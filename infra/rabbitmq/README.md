# RabbitMQ - MesaTech Cloud EP2

## Objetivo

RabbitMQ desacopla la creación de categorías en `catalogo-service` de su uso en `solicitudes-service`.

```text
React
  ↓
API Gateway
  ↓
BFF
  ↓
catalogo-service
  ├── RDS Catálogo
  └── catalogo.exchange
          │ categoria.creada
          ↓
solicitudes.catalogo.queue
          ↓
solicitudes-service
          ↓
RDS Solicitudes / categorias_locales
```

El guardado en RDS Catálogo y la publicación RabbitMQ son operaciones independientes.

## Despliegue AWS final

- EC2 independiente con Ubuntu 24.04 LTS.
- Docker Engine instalado desde el repositorio oficial.
- Docker Compose plugin.
- Imagen `rabbitmq:4.4.0-management`.
- Contenedor `rabbitmq`.
- Hostname `mesatech-rabbitmq`.
- Restart policy `unless-stopped`.
- Volumen `rabbitmq_data:/var/lib/rabbitmq`.
- Puerto AMQP `5672`.
- Puerto Management `15672`.

## Variables de entorno

Crear `infra/rabbitmq/.env` a partir de `.env.example`:

```env
RABBITMQ_DEFAULT_USER=mesatech_admin
RABBITMQ_DEFAULT_PASS=CAMBIAR_ESTA_PASSWORD
RABBITMQ_DEFAULT_VHOST=mesatech
```

El archivo real `.env` no debe versionarse.

## Inicio y diagnóstico

```bash
docker compose config --quiet
docker compose pull
docker compose up -d
docker compose ps
docker compose logs rabbitmq
```

## Topología final

| Elemento | Valor |
|---|---|
| Virtual host | `mesatech` |
| Publisher | `catalogo-publisher` |
| Consumer | `solicitudes-consumer` |
| Exchange | `catalogo.exchange` |
| Tipo | `direct` |
| Exchange durable | Sí |
| Queue | `solicitudes.catalogo.queue` |
| Queue durable | Sí |
| Auto delete | No |
| Routing key | `categoria.creada` |

El usuario `mesatech_admin` se utiliza solo para administración. Las aplicaciones utilizan cuentas separadas y no administradoras.

## Crear usuarios y permisos

Ejecutar dentro del contenedor. Las contraseñas deben recibirse desde variables o ingreso seguro; no deben quedar en Git ni en evidencias.

```bash
docker exec rabbitmq rabbitmqctl add_user catalogo-publisher "<PASSWORD_PUBLISHER>"
docker exec rabbitmq rabbitmqctl add_user solicitudes-consumer "<PASSWORD_CONSUMER>"

docker exec rabbitmq rabbitmqctl set_permissions -p mesatech catalogo-publisher   '^$' '^catalogo\.exchange$' '^$'

docker exec rabbitmq rabbitmqctl set_permissions -p mesatech solicitudes-consumer   '^solicitudes\.catalogo\.queue$' '^$' '^solicitudes\.catalogo\.queue$'
```

## Crear exchange, queue y binding

En RabbitMQ Management (`:15672`) sobre el vhost `mesatech`:

1. Crear exchange `catalogo.exchange`, tipo `direct`, durable.
2. Crear queue `solicitudes.catalogo.queue`, durable y con Auto delete desactivado.
3. Crear binding desde `catalogo.exchange` hacia `solicitudes.catalogo.queue` usando routing key `categoria.creada`.

## Verificación por CLI

```bash
docker exec rabbitmq rabbitmqctl list_users
docker exec rabbitmq rabbitmqctl list_permissions -p mesatech
docker exec rabbitmq rabbitmqctl list_exchanges -p mesatech name type durable
docker exec rabbitmq rabbitmqctl list_queues -p mesatech name durable auto_delete messages consumers
docker exec rabbitmq rabbitmqctl list_bindings -p mesatech source_name destination_name destination_kind routing_key
```

## Evento `categoria.creada`

```json
{
  "eventId": "9bd0f9a2-e594-462b-8d26-623af6240101",
  "tipoEvento": "categoria.creada",
  "fechaEvento": "2026-11-01T20:00:00Z",
  "categoriaId": 42,
  "nombre": "Redes EP2"
}
```

`categoriaId` conserva el identificador original de Catálogo.

## Garantías utilizadas

El publisher usa:

```text
Delivery Mode: PERSISTENT
Publisher Confirms
Publisher Returns
mandatory=true
```

El consumidor usa ACK AUTO de Spring AMQP. El listener persiste primero en RDS Solicitudes y retorna correctamente después del guardado.

```text
Publisher Confirm = RabbitMQ aceptó la publicación.
ACK consumidor    = Solicitudes terminó correctamente su procesamiento.
```

No se afirma procesamiento exactamente una vez.

## Variables de las aplicaciones en AWS

Catálogo utiliza propiedades Spring externalizadas, equivalentes a:

```text
SPRING_RABBITMQ_HOST=<IP_PRIVADA_RABBITMQ>
SPRING_RABBITMQ_PORT=5672
SPRING_RABBITMQ_USERNAME=catalogo-publisher
SPRING_RABBITMQ_VIRTUAL_HOST=mesatech
```

Solicitudes utiliza:

```text
RABBITMQ_HOST=<IP_PRIVADA_RABBITMQ>
RABBITMQ_PORT=5672
RABBITMQ_USERNAME=solicitudes-consumer
RABBITMQ_VHOST=mesatech
RABBITMQ_QUEUE=solicitudes.catalogo.queue
```

Las contraseñas se mantienen fuera del repositorio.

## Persistencia y recreación del contenedor

Para P5:

```bash
docker compose down
docker compose up -d
```

No usar `docker compose down -v`, porque eliminaría el volumen.

En la prueba final se comprobó que un mensaje `Ready=1` permaneció disponible después de recrear el contenedor y fue consumido al volver a iniciar Solicitudes.

## Fallo de publicación

Si RabbitMQ no está disponible después de persistir una categoría, Catálogo devuelve:

```text
HTTP 502 Bad Gateway
La categoría fue guardada, pero no se pudo confirmar la publicación en RabbitMQ
```

La categoría puede quedar en RDS Catálogo. Este comportamiento fue comprobado en P7 y documenta que PostgreSQL y RabbitMQ no participan en una transacción distribuida.

## Orden de recuperación

```text
1. Verificar ambos RDS.
2. Iniciar RabbitMQ.
3. Verificar vhost, usuarios, exchange, queue y binding.
4. Iniciar Catálogo.
5. Iniciar Solicitudes.
6. Iniciar BFF.
7. Verificar API Gateway.
8. Iniciar frontend.
9. Comprobar mensajes Ready/Unacked y logs.
```

## Seguridad

No versionar ni incluir en evidencias:

- contraseñas;
- `.env` reales;
- JWT;
- claves privadas;
- credenciales AWS.

El puerto `5672` debe aceptar tráfico solo desde los Security Groups de Catálogo y Solicitudes. El puerto `15672` debe restringirse a la IP administrativa autorizada.
