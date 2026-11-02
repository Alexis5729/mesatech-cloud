# Solicitudes Service

Microservicio responsable de crear, consultar y administrar el ciclo de vida de las solicitudes.

Está desarrollado con Java 17, Spring Boot, JPA y PostgreSQL.

En EP2 incorpora consumo de eventos RabbitMQ provenientes de `catalogo-service`, mantiene una réplica local de
categorías y utiliza esa información para validar la creación de nuevas solicitudes.

## Responsabilidad

- Guardar las solicitudes en su propia base de datos.
- Recibir la identidad del usuario desde el BFF mediante `X-User-Id`.
- Aplicar las transiciones de estado obligatorias.
- Mantener una réplica local de categorías recibidas mediante RabbitMQ.
- Validar que la categoría utilizada al crear una solicitud exista en `categorias_locales`.
- Exponer las categorías locales mediante un endpoint HTTP.
- No validar JWT directamente.
- No acceder a Microsoft Entra ID.
- No acceder directamente a la base de datos de Catálogo.

La autenticación y autorización pertenecen al BFF y a API Gateway.

## Arquitectura

```text
React
  ↓
API Gateway
  ↓
BFF
  ↓
solicitudes-service
  ├── Gestiona solicitudes
  ├── Consulta categorias_locales
  └── Persiste en RDS Solicitudes

catalogo-service
      ↓
RabbitMQ
      ↓
solicitudes.catalogo.queue
      ↓
solicitudes-service
      ↓
categorias_locales
      ↓
RDS Solicitudes
```

## Endpoints

| Método  | Ruta                          | Uso                                                          |
|---------|-------------------------------|--------------------------------------------------------------|
| `POST`  | `/v1/solicitudes`             | Crear una solicitud. Requiere `X-User-Id`.                   |
| `GET`   | `/v1/solicitudes/mias`        | Consultar las solicitudes del usuario. Requiere `X-User-Id`. |
| `GET`   | `/v1/solicitudes`             | Consultar todas las solicitudes.                             |
| `PATCH` | `/v1/solicitudes/{id}/estado` | Cambiar el estado de una solicitud.                          |
| `GET`   | `/v1/solicitudes/categorias`  | Consultar categorías sincronizadas mediante RabbitMQ.        |
| `GET`   | `/v2/solicitudes`             | Consultar solicitudes agregando `diasAbierta`.               |

## Crear una solicitud

```http
POST /v1/solicitudes
X-User-Id: usuario-123
Content-Type: application/json
```

```json
{
  "titulo": "No funciona el correo",
  "descripcion": "Outlook no sincroniza desde esta mañana",
  "categoriaId": 1,
  "prioridadId": 2
}
```

La solicitud se crea automáticamente con:

- estado `CREADA`;
- fecha UTC;
- usuario recibido mediante `X-User-Id`.

Antes de crear la solicitud, el servicio valida que `categoriaId` exista en la tabla local `categorias_locales`.

## Validación de categorías

Las categorías no se consultan directamente desde `catalogo-service`.

En su lugar, se utiliza una réplica local sincronizada mediante RabbitMQ.

El flujo es:

```text
catalogo-service
      ↓
categoria.creada
      ↓
catalogo.exchange
      ↓
solicitudes.catalogo.queue
      ↓
solicitudes-service
      ↓
categorias_locales
```

Cuando se recibe un evento `categoria.creada`, el servicio almacena localmente:

- `categoriaId`;
- nombre de la categoría.

Al crear una solicitud:

```text
categoriaId recibido
      ↓
buscar en categorias_locales
      ↓
existe
  ├── sí → continuar creación
  └── no → rechazar solicitud
```

Esto evita que `solicitudes-service` dependa de una llamada HTTP directa a `catalogo-service` para validar categorías.

## Categorías locales

El endpoint:

```text
GET /v1/solicitudes/categorias
```

devuelve las categorías que `solicitudes-service` ha recibido desde RabbitMQ.

Estas categorías se almacenan en la base de datos de Solicitudes.

Ejemplo de respuesta:

```json
[
  {
    "categoriaId": 42,
    "nombre": "Redes"
  }
]
```

## Consumer RabbitMQ

`solicitudes-service` actúa como consumer de eventos de catálogo.

### Configuración

| Elemento         | Valor                        |
|------------------|------------------------------|
| Virtual Host     | `mesatech`                   |
| Exchange         | `catalogo.exchange`          |
| Tipo             | `direct`                     |
| Queue            | `solicitudes.catalogo.queue` |
| Routing Key      | `categoria.creada`           |
| Usuario consumer | `solicitudes-consumer`        |

El servicio escucha la cola:

```text
solicitudes.catalogo.queue
```

y procesa los eventos publicados por `catalogo-service`.

## Evento recibido

Ejemplo:

```json
{
  "eventId": "9bd0f9a2-e594-462b-8d26-623af6240101",
  "tipoEvento": "categoria.creada",
  "fechaEvento": "2026-10-29T15:00:00Z",
  "categoriaId": 42,
  "nombre": "Redes"
}
```

### Campos

| Campo         | Descripción                              |
|---------------|------------------------------------------|
| `eventId`     | Identificador único del evento.          |
| `tipoEvento`  | Tipo de evento recibido.                 |
| `fechaEvento` | Fecha y hora del evento.                 |
| `categoriaId` | ID original de la categoría en Catálogo. |
| `nombre`      | Nombre de la categoría.                  |

## Flujo del consumer

```text
RabbitMQ
   ↓
solicitudes.catalogo.queue
   ↓
Consumer
   ↓
Deserializar evento
   ↓
Validar datos
   ↓
Guardar o actualizar categoria local
   ↓
RDS Solicitudes
```

Durante las pruebas en AWS se comprobó que:

```text
Ready = 1
Consumers = 0
```

pasó a:

```text
Ready = 0
Consumers = 1
```

después de iniciar `solicitudes-service`.

Esto confirmó que el mensaje fue consumido correctamente.

## Versionamiento

- `/v1/solicitudes` conserva los campos originales.
- `/v2/solicitudes` devuelve los mismos campos y agrega `diasAbierta`.
- `diasAbierta` cuenta los días calendario desde `fechaCreacion` hasta la fecha UTC actual.
- No se guarda un campo adicional en la tabla para `diasAbierta`.

Ambas versiones utilizan los mismos datos persistidos.

## Cambiar un estado

Ejemplo:

```json
{
  "estado": "ASIGNADA"
}
```

## Reglas de estado

```text
CREADA -> ASIGNADA -> EN_PROCESO -> RESUELTA -> CERRADA
   |          |            |
   +----------+------------+-> CANCELADA
```

Reglas:

- `RESUELTA` solo se acepta cuando el estado actual es `EN_PROCESO`.
- `CANCELADA` se acepta desde `CREADA`, `ASIGNADA` y `EN_PROCESO`.
- Una solicitud `RESUELTA`, `CERRADA` o `CANCELADA` no se puede cancelar.
- Una transición inválida devuelve HTTP `409`.

## Errores

Los errores controlados usan un formato uniforme:

```json
{
  "status": 409,
  "message": "No se puede cambiar una solicitud de CREADA a RESUELTA",
  "timestamp": "2026-09-13T12:00:00Z"
}
```

La validación de categorías también devuelve un error controlado cuando `categoriaId` no existe en `categorias_locales`.

## Configuración

El servicio escucha por defecto en:

```text
8081
```

Las variables de entorno permiten cambiar la configuración sin modificar código.

### Base de datos

| Variable           | Valor local predeterminado                              |
|--------------------|---------------------------------------------------------|
| `SOLICITUDES_PORT` | `8081`                                                  |
| `DB_URL`           | `jdbc:postgresql://localhost:5432/mesatech_solicitudes` |
| `DB_USERNAME`      | `postgres`                                              |
| `DB_PASSWORD`      | vacío                                                   |
| `JPA_DDL_AUTO`     | `update`                                                |

### RabbitMQ

| Variable               | Uso                                      |
|------------------------|------------------------------------------|
| `RABBITMQ_HOST`        | Host o IP del broker RabbitMQ.           |
| `RABBITMQ_PORT`        | Puerto AMQP.                             |
| `RABBITMQ_USERNAME`    | Usuario consumer.                        |
| `RABBITMQ_PASSWORD`    | Contraseña del consumer.                 |
| `RABBITMQ_VHOST`       | Virtual Host utilizado por MesaTech.     |
| `RABBITMQ_QUEUE`       | Cola utilizada por Solicitudes.          |
| `RABBITMQ_EXCHANGE`    | Exchange asociado al evento de catálogo. |
| `RABBITMQ_ROUTING_KEY` | Routing Key del evento consumido.        |

Valores esperados:

```text
RABBITMQ_PORT=5672
RABBITMQ_VHOST=mesatech
RABBITMQ_QUEUE=solicitudes.catalogo.queue
RABBITMQ_EXCHANGE=catalogo.exchange
RABBITMQ_ROUTING_KEY=categoria.creada
```

Las contraseñas reales no deben almacenarse en Git.

## Ejecución local

Ejemplo en PowerShell:

```powershell
$env:DB_URL = "jdbc:postgresql://localhost:5432/mesatech_solicitudes"
$env:DB_USERNAME = "postgres"
$env:DB_PASSWORD = "tu_clave_local"

$env:RABBITMQ_HOST = "localhost"
$env:RABBITMQ_PORT = "5672"
$env:RABBITMQ_USERNAME = "solicitudes-consumer"
$env:RABBITMQ_PASSWORD = "tu_clave_rabbitmq"
$env:RABBITMQ_VHOST = "mesatech"

.\mvnw.cmd spring-boot:run
```

## Despliegue AWS

En EP2, `solicitudes-service` se ejecuta en una instancia EC2 independiente.

El servicio se conecta a:

- Amazon RDS PostgreSQL para persistencia;
- RabbitMQ desplegado en otra EC2;
- BFF para recibir solicitudes HTTP.

La base de datos de Solicitudes es independiente de la utilizada por `catalogo-service`.

## Persistencia

RDS Solicitudes almacena:

- solicitudes;
- estados;
- categorías locales sincronizadas mediante RabbitMQ.

La tabla:

```text
categorias_locales
```

permite que el servicio valide categorías sin conectarse directamente a la base de datos de Catálogo.

## Pruebas

Ejecutar:

```powershell
.\mvnw.cmd test
```

Las pruebas del servicio cubren:

- creación de solicitudes;
- consulta general;
- consulta por usuario;
- persistencia;
- flujo válido de estados;
- transición inválida a `RESUELTA`;
- cancelación;
- errores relacionados con `X-User-Id`;
- funcionamiento simultáneo de v1 y v2.

Las pruebas de integración EP2 deben cubrir además:

- recepción de `categoria.creada`;
- almacenamiento en `categorias_locales`;
- categoría válida al crear una solicitud;
- categoría inexistente al crear una solicitud;
- recuperación del consumer después de reinicios;
- comportamiento ante indisponibilidad temporal de RabbitMQ.

## Organización interna

```text
controller/   recibe solicitudes HTTP
service/      aplica reglas de negocio
repository/   accede a PostgreSQL mediante JPA
entity/       representa tablas y estados
dto/          define JSON de entrada y salida
exception/    entrega errores uniformes
config/       contiene configuración de infraestructura
messaging/    contiene consumer y eventos RabbitMQ
```

Si los paquetes reales del proyecto tienen nombres diferentes, esta sección debe ajustarse para coincidir con la
estructura del código.

## Integración y despliegue

El flujo completo de integración es:

```text
React
  ↓
API Gateway
  ↓
BFF
  ↓
solicitudes-service
  ↓
RDS Solicitudes
```

y, paralelamente:

```text
catalogo-service
      ↓
RabbitMQ
      ↓
solicitudes-service
      ↓
categorias_locales
```

En AWS:

- el BFF consume los endpoints HTTP;
- el servicio utiliza PostgreSQL en RDS;
- RabbitMQ se utiliza para sincronizar categorías;
- las conexiones se restringen mediante Security Groups;
- PostgreSQL permanece sin exposición pública para el funcionamiento normal.

## Seguridad

No deben almacenarse en Git:

- contraseñas PostgreSQL;
- contraseñas RabbitMQ;
- archivos `.env` reales;
- tokens JWT;
- credenciales AWS;
- claves privadas.

Las configuraciones sensibles deben suministrarse mediante variables de entorno.

## Documentación relacionada

La configuración de RabbitMQ se encuentra en:

```text
infra/rabbitmq/README.md
```

La arquitectura general se encuentra en el `README.md` de la raíz.