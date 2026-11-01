# Contrato de integración EP2

## Estado

Contrato final implementado y validado en AWS para la EP2 de MesaTech Cloud.

La integración Catálogo → RabbitMQ → Solicitudes se encuentra operativa. El publisher, el consumidor, la persistencia local de categorías, el BFF, API Gateway y las pruebas P1–P8 fueron ejecutados sobre la infraestructura final.

## RabbitMQ

| Elemento | Valor |
|---|---|
| Virtual host | `mesatech` |
| Publisher | `catalogo-publisher` |
| Consumer | `solicitudes-consumer` |
| Exchange | `catalogo.exchange` |
| Tipo de exchange | `direct` |
| Exchange durable | Sí |
| Cola | `solicitudes.catalogo.queue` |
| Cola durable | Sí |
| Auto delete | No |
| Routing key | `categoria.creada` |
| Binding | `catalogo.exchange` + `categoria.creada` → `solicitudes.catalogo.queue` |

Las cuentas de aplicación son separadas y no administradoras. `mesatech_admin` se reserva para administración.

## Evento de categoría creada

Formato JSON UTF-8:

```json
{
  "eventId": "9bd0f9a2-e594-462b-8d26-623af6240101",
  "tipoEvento": "categoria.creada",
  "fechaEvento": "2026-11-01T20:00:00Z",
  "categoriaId": 42,
  "nombre": "Redes EP2"
}
```

| Campo | Tipo | Regla |
|---|---|---|
| `eventId` | String/UUID | Identificador único del evento. |
| `tipoEvento` | String | Valor fijo `categoria.creada`. |
| `fechaEvento` | Instant | ISO 8601 UTC. |
| `categoriaId` | Long | ID original de RDS Catálogo. |
| `nombre` | String | Nombre persistido de la categoría. |

Solicitudes conserva el `categoriaId` original y además registra `eventId`, `fechaEvento` y fecha de recepción para trazabilidad.

## Flujo final

```text
React + Entra ID
       ↓
API Gateway
       ↓
BFF
       ↓
Catálogo
  ├── RDS Catálogo
  └── RabbitMQ
         ↓
      Solicitudes
         ↓
      RDS Solicitudes
```

Para crear una solicitud, el frontend obtiene las categorías locales desde:

```text
GET /v1/solicitudes/categorias
```

Solicitudes valida `categoriaId` únicamente contra su copia local; no consulta RDS Catálogo.

## Publisher

`catalogo-service`:

1. valida la categoría;
2. persiste en RDS Catálogo;
3. construye `CategoriaCreadaEvent`;
4. publica en `catalogo.exchange`;
5. usa routing key `categoria.creada`;
6. publica PERSISTENT;
7. espera Publisher Confirm;
8. detecta retornos mediante Publisher Returns y `mandatory=true`.

Publisher Confirm significa que RabbitMQ aceptó la publicación; no significa que Solicitudes ya la haya procesado.

## Consumer

`solicitudes-service`:

1. escucha `solicitudes.catalogo.queue`;
2. deserializa el evento;
3. valida los datos;
4. persiste la categoría en `categorias_locales`;
5. finaliza correctamente después de persistir.

Se utiliza ACK AUTO de Spring AMQP. Un ACK del consumidor representa finalización correcta del listener, no una garantía de exactly-once.

## Seguridad

Roles:

- `CLIENTE`: consulta catálogo/categorías locales y crea/consulta sus solicitudes.
- `OPERADOR`: consulta y gestiona solicitudes.
- `ADMINISTRADOR`: además administra Catálogo.

La seguridad se mantiene mediante Microsoft Entra ID, JWT Authorizer en API Gateway y autorización por roles en BFF.

## Fallo de publicación

PostgreSQL y RabbitMQ no forman una transacción distribuida.

Si Catálogo persiste y RabbitMQ falla:

```text
RDS Catálogo guarda
        ↓
RabbitMQ no confirma
        ↓
HTTP 502 controlado
```

Respuesta utilizada:

```json
{
  "status": 502,
  "message": "La categoría fue guardada, pero no se pudo confirmar la publicación en RabbitMQ",
  "timestamp": "<UTC>"
}
```

P7 confirmó que la categoría puede permanecer en RDS Catálogo aunque el evento no haya sido publicado.

## Infraestructura final

- EC2 Catálogo.
- EC2 Solicitudes.
- EC2 RabbitMQ.
- EC2 BFF.
- RDS exclusivo Catálogo.
- RDS exclusivo Solicitudes.

Cada microservicio es propietario exclusivo de su RDS. El BFF no accede directamente a bases de datos.

## Pruebas finales

| Prueba | Resultado |
|---|---|
| P1 | EC2 y RDS separadas. |
| P2 | Flujo E2E autenticado y solicitud creada con categoría recibida. |
| P3 | Consumidor detenido: mensaje queda Ready. |
| P4 | Consumo diferido: mensaje consumido y persistido al reiniciar Solicitudes. |
| P5 | Recreación del contenedor conservando volumen y mensaje. |
| P6 | Reinicio de ambos microservicios sin pérdida en RDS. |
| P7 | RabbitMQ detenido: HTTP 502 y persistencia real documentada. |
| P8 | 401 sin token, 403 por rol, 409 transición inválida, v1/v2 autorizadas. |

## Responsabilidades de integración

### Alexis

- publisher de Catálogo;
- Publisher Confirms/Returns;
- manejo de fallo de publicación;
- frontend React;
- contrato inicial y apoyo de integración.

### Damián

- infraestructura AWS final;
- EC2/RDS/Security Groups;
- despliegues;
- RabbitMQ en AWS;
- consumidor de Solicitudes;
- categorías locales;
- integración BFF y pruebas finales.

Las pruebas, informe, revisión y defensa corresponden al trabajo integrado del equipo.

## Cierre

Este documento representa el contrato aplicado en la infraestructura AWS final. Las credenciales reales permanecen externalizadas y no se almacenan en el repositorio.
