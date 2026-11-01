# Contrato de integración EP2 — MesaTech Cloud

## Estado

Integración final implementada y validada en AWS.

## RabbitMQ

- Virtual host: `mesatech`
- Publisher: `catalogo-publisher`
- Consumer: `solicitudes-consumer`
- Exchange: `catalogo.exchange`
- Tipo: `direct`
- Exchange durable: `true`
- Cola: `solicitudes.catalogo.queue`
- Cola durable: `true`
- Auto delete: `false`
- Routing key: `categoria.creada`

## Evento `categoria.creada`

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

Solicitudes conserva el `categoriaId` original recibido desde Catálogo y registra datos del evento para trazabilidad.

## Flujo

```text
React → API Gateway → BFF → Catálogo → RDS Catálogo
                              |
                              └→ RabbitMQ → Solicitudes → RDS Solicitudes
```

El selector de categorías para nuevas solicitudes utiliza:

```text
React → API Gateway → BFF → GET /v1/solicitudes/categorias
```

La creación de solicitudes valida únicamente la copia local de categorías en Solicitudes.

## Autorización

- Crear/editar/eliminar Catálogo: `ADMINISTRADOR`.
- Consultar categorías locales: `CLIENTE`, `OPERADOR`, `ADMINISTRADOR`.
- Gestionar solicitudes: `OPERADOR`, `ADMINISTRADOR`.

## Confirmaciones

```text
Publisher Confirm = RabbitMQ aceptó el mensaje.
ACK consumidor    = Solicitudes terminó correctamente después de persistir.
```

No se afirma procesamiento exactly-once.

## Fallo de publicación

Si Catálogo persiste pero RabbitMQ no confirma:

- se devuelve HTTP `502` controlado;
- la categoría puede permanecer en RDS Catálogo;
- no se afirma rollback automático;
- la inconsistencia se documenta como resultado real de P7.

## Resultado de pruebas

P1–P8 fueron ejecutadas sobre la infraestructura AWS final, incluyendo persistencia de mensajes, recreación del contenedor, reinicio de microservicios, seguridad por JWT/roles y disponibilidad v1/v2.

## Alcance

Para EP2 se propaga por RabbitMQ el evento `categoria.creada`. No se exige propagar modificaciones, eliminaciones ni prioridades.

Las credenciales reales se externalizan y no forman parte del repositorio.
