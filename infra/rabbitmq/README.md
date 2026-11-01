# RabbitMQ - MesaTech Cloud EP2

## Objetivo

RabbitMQ se utiliza como broker de mensajería entre los microservicios `catalogo-service` y `solicitudes-service`.

El flujo implementado es:

```text
React
  ↓
API Gateway
  ↓
BFF
  ↓
catalogo-service
  ├── Guarda categoría en RDS Catálogo
  └── Publica evento en RabbitMQ
            ↓
solicitudes-service
            ↓
      Guarda categoría recibida
      en RDS Solicitudes
```

El guardado en RDS Catálogo y la publicación en RabbitMQ son operaciones separadas.

---

## Requisitos

Para ejecutar RabbitMQ se requiere:

- Docker Engine
- Docker Compose
- Archivo `.env`
- Puertos disponibles:
  - `5672`: comunicación AMQP entre aplicaciones y RabbitMQ.
  - `15672`: interfaz web de administración de RabbitMQ.

En AWS, RabbitMQ se ejecuta en una EC2 independiente con Ubuntu 24.04 LTS.

---

## Imagen utilizada

El archivo `compose.yaml` utiliza una versión explícita de RabbitMQ:

```yaml
image: rabbitmq:4.4.0-management
```

La variante `management` incluye la interfaz web de administración.

---

## Variables de entorno

Las credenciales administrativas no se almacenan directamente en Git.

Crear un archivo:

```text
infra/rabbitmq/.env
```

tomando como referencia:

```text
.env.example
```

Ejemplo:

```env
RABBITMQ_ADMIN_USER=admin
RABBITMQ_ADMIN_PASSWORD=CAMBIAR_ESTA_PASSWORD
```

El archivo `.env` real está excluido mediante `.gitignore`.

---

## Validar Docker Compose

Antes de iniciar RabbitMQ:

```bash
docker compose config --quiet
```

Si no se muestra ningún error, la configuración es válida.

---

## Descargar la imagen

```bash
docker compose pull
```

---

## Iniciar RabbitMQ

```bash
docker compose up -d
```

---

## Verificar el contenedor

```bash
docker compose ps
```

El contenedor esperado es:

```text
mesatech-rabbitmq
```

y debe exponer:

```text
5672
15672
```

---

## Revisar logs

```bash
docker compose logs rabbitmq
```

También se puede seguir el log en tiempo real con:

```bash
docker compose logs -f rabbitmq
```

---

## Configuración del contenedor

El broker utiliza:

```text
Container: mesatech-rabbitmq
Hostname: mesatech-rabbit
Restart policy: unless-stopped
```

El almacenamiento persistente se mantiene mediante:

```text
rabbitmq_data:/var/lib/rabbitmq
```

Esto permite conservar la información del broker al recrear el contenedor, siempre que no se elimine el volumen.

---

# Recursos RabbitMQ de MesaTech

## Virtual Host

```text
mesatech
```

---

## Usuarios de aplicación

Se utilizan usuarios separados para cada responsabilidad.

### Publisher

```text
mesatech_publicador
```

Utilizado por:

```text
catalogo-service
```

### Consumer

```text
mesatech_consumidor
```

Utilizado por:

```text
solicitudes-service
```

Las contraseñas reales no se almacenan en Git.

---

## Exchange

```text
Nombre: catalogo.exchange
Tipo: direct
Durable: sí
```

---

## Cola

```text
Nombre: solicitudes.catalogo.queue
Durable: sí
Auto delete: no
```

---

## Routing Key

```text
categoria.creada
```

---

## Binding

```text
catalogo.exchange
        |
        | categoria.creada
        ↓
solicitudes.catalogo.queue
```

---

# Evento publicado

Al crear una categoría, `catalogo-service` publica un evento JSON con la siguiente estructura:

```json
{
  "eventId": "9bd0f9a2-e594-462b-8d26-623af6240101",
  "tipoEvento": "categoria.creada",
  "fechaEvento": "2026-10-29T15:00:00Z",
  "categoriaId": 42,
  "nombre": "Redes"
}
```

Campos:

| Campo         | Descripción                                                   |
|---------------|---------------------------------------------------------------|
| `eventId`     | Identificador único del evento                                |
| `tipoEvento`  | Tipo de evento publicado                                      |
| `fechaEvento` | Fecha y hora del evento                                       |
| `categoriaId` | ID original de la categoría almacenada en Catálogo            |
| `nombre`      | Nombre de la categoría                                        |

---

# Persistencia del mensaje

Los mensajes publicados por `catalogo-service` utilizan:

```text
Delivery Mode: PERSISTENT
```

Además, el publisher utiliza:

```text
Publisher confirms
Publisher returns
Mandatory = true
```

Esto permite detectar:

- mensajes no confirmados por RabbitMQ;
- mensajes que no tienen una ruta válida hacia una cola.

---

# Flujo de publicación

El flujo del publisher es:

```text
1. Recibir solicitud HTTP.
2. Validar categoría.
3. Guardar categoría en RDS Catálogo.
4. Crear CategoriaCreadaEvent.
5. Publicar en catalogo.exchange.
6. Utilizar routing key categoria.creada.
7. Esperar confirmación del broker.
8. Detectar mensajes retornados por ausencia de ruta.
```

Si RabbitMQ falla después de guardar la categoría, la aplicación devuelve un error controlado.

Actualmente se utiliza:

```text
HTTP 502 Bad Gateway
```

La categoría puede permanecer almacenada en RDS Catálogo porque la persistencia en PostgreSQL y la publicación en RabbitMQ no forman una única transacción distribuida.

---

# Detener RabbitMQ

Para detener el contenedor sin eliminarlo:

```bash
docker compose stop rabbitmq
```

Para volver a iniciarlo:

```bash
docker compose start rabbitmq
```

---

# Recrear RabbitMQ conservando el volumen

Para las pruebas de persistencia se puede recrear el contenedor:

```bash
docker compose down
docker compose up -d
```

No utilizar:

```bash
docker compose down -v
```

durante las pruebas de persistencia, porque `-v` elimina el volumen de RabbitMQ.

El volumen:

```text
rabbitmq_data
```

debe mantenerse.

Después de recrear el contenedor se debe comprobar que siguen disponibles:

- virtual host;
- usuarios;
- exchange;
- cola;
- binding;
- mensajes persistentes pendientes.

---

# Verificación desde RabbitMQ Management

La interfaz web se encuentra en:

```text
http://IP_RABBITMQ:15672
```

Desde allí se deben comprobar:

### Virtual Hosts

```text
mesatech
```

### Exchanges

```text
catalogo.exchange
```

### Queues

```text
solicitudes.catalogo.queue
```

### Binding

```text
catalogo.exchange
+ categoria.creada
→ solicitudes.catalogo.queue
```

---

# Pruebas relevantes de la EP2

## Publicación normal

Resultado esperado:

```text
POST categoría
→ categoría guardada en RDS Catálogo
→ mensaje publicado
→ HTTP 201
```

---

## Consumidor detenido

Resultado esperado:

```text
Categoría guardada en Catálogo
→ mensaje queda Ready
→ todavía no existe copia en RDS Solicitudes
```

---

## Reinicio del broker

Con un mensaje pendiente:

```text
Ready = 1
```

recrear el contenedor conservando el volumen.

Después del reinicio deben mantenerse:

```text
vhost
exchange
queue
binding
mensaje pendiente
```

---

## RabbitMQ detenido

Resultado esperado:

```text
Categoría guardada en RDS Catálogo
→ publicación falla
→ HTTP 502 controlado
```

Esto demuestra que guardar en RDS y publicar el evento son operaciones independientes.

---

# Recuperación recomendada

En caso de reinicio general del sistema:

```text
1. Verificar RDS Catálogo.
2. Verificar RDS Solicitudes.
3. Iniciar RabbitMQ.
4. Verificar vhost, exchange, cola y binding.
5. Iniciar catalogo-service.
6. Iniciar solicitudes-service.
7. Iniciar BFF.
8. Verificar API Gateway.
9. Iniciar frontend React.
10. Comprobar mensajes Ready/Unacked y logs.
```

---

# Seguridad

No deben almacenarse en Git:

- contraseñas;
- archivos `.env` reales;
- tokens JWT;
- claves privadas;
- credenciales AWS.

Los archivos `.env.example` solo contienen valores ficticios.

Las aplicaciones utilizan cuentas RabbitMQ separadas para publisher y consumer.

---

# Resumen de configuración

```text
Vhost:
mesatech

Publisher:
mesatech_publicador

Consumer:
mesatech_consumidor

Exchange:
catalogo.exchange

Exchange type:
direct

Queue:
solicitudes.catalogo.queue

Routing key:
categoria.creada

RabbitMQ AMQP:
5672

RabbitMQ Management:
15672

Imagen:
rabbitmq:4.4.0-management

Volumen:
rabbitmq_data

Hostname:
mesatech-rabbit
```
