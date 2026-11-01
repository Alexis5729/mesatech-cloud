# Catálogo Service

Microservicio responsable de administrar las categorías y prioridades utilizadas por las solicitudes.

Está desarrollado con Java 17, Spring Boot, JPA y PostgreSQL, y en EP2 incorpora publicación de eventos mediante
RabbitMQ para sincronizar las categorías con `solicitudes-service`.

## Responsabilidad

- Crear, consultar, modificar y eliminar categorías.
- Crear, consultar, modificar y eliminar prioridades.
- Persistir el catálogo en su propia base de datos PostgreSQL.
- Publicar eventos RabbitMQ cuando se crea una categoría.
- Mantener desacoplada la comunicación con `solicitudes-service`.
- No acceder directamente a la base de datos de Solicitudes.

## Arquitectura

```text
React
  ↓
API Gateway
  ↓
BFF
  ↓
catalogo-service
  ├── Guarda categoría en RDS Catálogo
  └── Publica categoria.creada
              ↓
           RabbitMQ
              ↓
      solicitudes-service
              ↓
      RDS Solicitudes
```

La persistencia en RDS Catálogo y la publicación del evento RabbitMQ son operaciones independientes.

## Endpoints v1

| Método   | Ruta                            | Uso                                                       |
|----------|---------------------------------|-----------------------------------------------------------|
| `GET`    | `/v1/catalogo/categorias`       | Consultar categorías.                                     |
| `POST`   | `/v1/catalogo/categorias`       | Crear una categoría y publicar el evento correspondiente. |
| `PUT`    | `/v1/catalogo/categorias/{id}`  | Modificar una categoría.                                  |
| `DELETE` | `/v1/catalogo/categorias/{id}`  | Eliminar una categoría.                                   |
| `GET`    | `/v1/catalogo/prioridades`      | Consultar prioridades.                                    |
| `POST`   | `/v1/catalogo/prioridades`      | Crear una prioridad.                                      |
| `PUT`    | `/v1/catalogo/prioridades/{id}` | Modificar una prioridad.                                  |
| `DELETE` | `/v1/catalogo/prioridades/{id}` | Eliminar una prioridad.                                   |

### Ejemplo de categoría

```json
{
  "nombre": "Hardware",
  "descripcion": "Equipos y periféricos"
}
```

### Ejemplo de prioridad

```json
{
  "nombre": "Alta",
  "nivel": 3
}
```

El nombre de cada elemento debe ser único.

En prioridades, el nivel también debe ser único y positivo.

## Respuestas HTTP

- Crear devuelve HTTP `201`.
- Modificar y consultar devuelven HTTP `200`.
- Eliminar devuelve HTTP `204`.
- Un elemento inexistente devuelve HTTP `404`.
- Un nombre o nivel duplicado devuelve HTTP `409`.
- Datos inválidos devuelven HTTP `400`.

Cuando la categoría se guarda correctamente pero falla la publicación en RabbitMQ, el servicio devuelve un error
controlado.

Actualmente se utiliza:

```text
HTTP 502 Bad Gateway
```

Esto ocurre porque la persistencia PostgreSQL y la publicación RabbitMQ no forman una única transacción distribuida.

## Publicación RabbitMQ

Al crear una categoría, `catalogo-service` actúa como publisher.

El flujo es:

```text
POST /v1/catalogo/categorias
        ↓
Validación
        ↓
Guardar en RDS Catálogo
        ↓
Crear CategoriaCreadaEvent
        ↓
Publicar en catalogo.exchange
        ↓
Routing Key: categoria.creada
        ↓
solicitudes.catalogo.queue
```

## Evento `categoria.creada`

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

| Campo         | Descripción                                         |
|---------------|-----------------------------------------------------|
| `eventId`     | Identificador único del evento.                     |
| `tipoEvento`  | Tipo de evento publicado.                           |
| `fechaEvento` | Fecha y hora del evento.                            |
| `categoriaId` | ID original de la categoría almacenada en Catálogo. |
| `nombre`      | Nombre de la categoría.                             |

## Configuración RabbitMQ

La integración utiliza:

| Elemento          | Valor                        |
|-------------------|------------------------------|
| Virtual Host      | `mesatech`                   |
| Exchange          | `catalogo.exchange`          |
| Tipo              | `direct`                     |
| Routing Key       | `categoria.creada`           |
| Queue destino     | `solicitudes.catalogo.queue` |
| Usuario publisher | `mesatech_publicador`        |

Los mensajes se publican como persistentes.

Además, el publisher utiliza mecanismos de confirmación para detectar problemas de entrega.

## Persistencia de mensajes

Los mensajes se publican utilizando:

```text
Delivery Mode: PERSISTENT
```

También se utilizan:

```text
Publisher confirms
Publisher returns
Mandatory = true
```

Esto permite detectar:

- mensajes no confirmados por RabbitMQ;
- mensajes sin una ruta válida hacia una cola;
- errores de publicación.

## Configuración local

El servicio escucha por defecto en:

```text
8082
```

Las variables de entorno permiten modificar la configuración sin cambiar el código.

### Base de datos

| Variable        | Valor local predeterminado                           |
|-----------------|------------------------------------------------------|
| `CATALOGO_PORT` | `8082`                                               |
| `DB_URL`        | `jdbc:postgresql://localhost:5432/mesatech_catalogo` |
| `DB_USERNAME`   | `postgres`                                           |
| `DB_PASSWORD`   | vacío                                                |
| `JPA_DDL_AUTO`  | `update`                                             |

### RabbitMQ

| Variable               | Uso                                          |
|------------------------|----------------------------------------------|
| `RABBITMQ_HOST`        | Host o IP del broker RabbitMQ.               |
| `RABBITMQ_PORT`        | Puerto AMQP.                                 |
| `RABBITMQ_USERNAME`    | Usuario publisher.                           |
| `RABBITMQ_PASSWORD`    | Contraseña del publisher.                    |
| `RABBITMQ_VHOST`       | Virtual Host utilizado por MesaTech.         |
| `RABBITMQ_EXCHANGE`    | Exchange utilizado para eventos de catálogo. |
| `RABBITMQ_ROUTING_KEY` | Routing Key del evento.                      |

Valores lógicos esperados:

```text
RABBITMQ_PORT=5672
RABBITMQ_VHOST=mesatech
RABBITMQ_EXCHANGE=catalogo.exchange
RABBITMQ_ROUTING_KEY=categoria.creada
```

Las credenciales reales no deben almacenarse en Git.

## Ejecución local

Ejemplo en PowerShell:

```powershell
$env:DB_URL = "jdbc:postgresql://localhost:5432/mesatech_catalogo"
$env:DB_USERNAME = "postgres"
$env:DB_PASSWORD = "tu_clave_local"

$env:RABBITMQ_HOST = "localhost"
$env:RABBITMQ_PORT = "5672"
$env:RABBITMQ_USERNAME = "mesatech_publicador"
$env:RABBITMQ_PASSWORD = "tu_clave_rabbitmq"
$env:RABBITMQ_VHOST = "mesatech"

.\mvnw.cmd spring-boot:run
```

## Despliegue AWS

En EP2, `catalogo-service` se ejecuta en una instancia EC2.

El servicio se conecta a:

- Amazon RDS PostgreSQL para persistencia;
- RabbitMQ desplegado en una EC2 independiente.

Las conexiones se configuran mediante variables de entorno.

La base de datos de Catálogo es independiente de la base de datos utilizada por `solicitudes-service`.

## Flujo validado en AWS

La integración del publisher fue validada en AWS con el siguiente resultado:

```text
Crear categoría
      ↓
catalogo-service
      ↓
RDS Catálogo
      ↓
catalogo.exchange
      ↓
solicitudes.catalogo.queue
      ↓
solicitudes-service
      ↓
categorias_locales
      ↓
RDS Solicitudes
```

Se comprobó que:

- la categoría se guarda correctamente en RDS Catálogo;
- el evento `categoria.creada` se publica en RabbitMQ;
- RabbitMQ enruta el mensaje hacia la cola configurada;
- `solicitudes-service` consume el mensaje;
- la categoría termina almacenada en `categorias_locales`.

## Fallo de RabbitMQ

Si RabbitMQ no está disponible después de haber guardado una categoría:

```text
Categoría guardada en RDS Catálogo
        ↓
Publicación RabbitMQ falla
        ↓
Respuesta HTTP 502
```

La categoría puede permanecer almacenada en RDS Catálogo.

Esto demuestra que:

```text
Persistencia PostgreSQL
```

y:

```text
Publicación RabbitMQ
```

son operaciones independientes.

## Pruebas

Ejecutar:

```powershell
.\mvnw.cmd test
```

Las pruebas del servicio validan:

- CRUD de categorías;
- CRUD de prioridades;
- persistencia;
- duplicados;
- validaciones;
- arranque del contexto.

Las pruebas de integración EP2 agregan validación del flujo de publicación hacia RabbitMQ en el entorno desplegado.

## Organización interna

```text
controller/   define los endpoints
service/      aplica validaciones y lógica de negocio
repository/   accede a PostgreSQL mediante JPA
entity/       representa categorías y prioridades
dto/          define los JSON de entrada y salida
exception/    devuelve errores uniformes
config/       configuración de infraestructura y RabbitMQ
messaging/    eventos y lógica asociada a publicación RabbitMQ
```

La ubicación exacta de las clases RabbitMQ puede variar según la organización interna del proyecto, pero su
responsabilidad permanece separada de los controladores HTTP.

## Seguridad

No deben almacenarse en Git:

- contraseñas PostgreSQL;
- contraseñas RabbitMQ;
- archivos `.env` reales;
- tokens;
- credenciales AWS;
- claves privadas.

Los archivos `.env.example` contienen únicamente referencias y valores ficticios.

## Documentación relacionada

La configuración completa de RabbitMQ se encuentra en:

```text
infra/rabbitmq/README.md
```

La arquitectura general del proyecto se encuentra en el `README.md` de la raíz.