# Contrato de integración EP2

Estado: propuesta para revisión de Alexis y Damián antes de implementar G1.

Este contrato permite desarrollar el publicador y el consumidor en paralelo. Un cambio posterior en nombres, tipos o rutas debe actualizarse aquí y comunicarse antes de integrar las ramas.

## RabbitMQ

| Elemento | Valor |
|---|---|
| Virtual host | `mesatech` |
| Exchange | `catalogo.exchange` |
| Tipo de exchange | `direct` |
| Exchange durable | Sí |
| Cola | `solicitudes.catalogo.queue` |
| Cola durable | Sí |
| Auto delete | No |
| Routing key | `categoria.creada` |
| Binding | `catalogo.exchange` + `categoria.creada` → `solicitudes.catalogo.queue` |

Los recursos se crean mediante el procedimiento de infraestructura documentado. Las aplicaciones usan cuentas diferenciadas y no administradoras:

- `catalogo-publisher`: publica en `catalogo.exchange`.
- `solicitudes-consumer`: consume desde `solicitudes.catalogo.queue`.
- No se utiliza `guest` remotamente.
- Las credenciales reales se externalizan y nunca se guardan en Git.

## Evento de categoría creada

Content type: `application/json`

Codificación: UTF-8

Mensaje persistente: sí

Ejemplo:

```json
{
  "eventId": "9bd0f9a2-e594-462b-8d26-623af6240101",
  "tipoEvento": "categoria.creada",
  "fechaEvento": "2026-10-29T15:00:00Z",
  "categoriaId": 42,
  "nombre": "Redes EP2"
}
```

| Campo | Tipo Java sugerido | Regla |
|---|---|---|
| `eventId` | `UUID` | Se genera una vez por publicación |
| `tipoEvento` | `String` | Valor fijo `categoria.creada` |
| `fechaEvento` | `Instant` | ISO 8601 en UTC |
| `categoriaId` | `Long` | ID original de RDS Catálogo |
| `nombre` | `String` | Nombre validado y persistido |

`categoriaId` debe conservarse en Solicitudes. No se reemplaza por una referencia autogenerada que pierda el ID de Catálogo.

## Flujo del publicador

1. Validar la petición.
2. Guardar la categoría en RDS Catálogo y confirmar la transacción.
3. Construir el evento.
4. Publicar un mensaje persistente en el exchange con la routing key acordada.
5. Esperar una confirmación acotada del broker y controlar mensajes retornados por ausencia de ruta.
6. Registrar `eventId` y `categoriaId` sin secretos.

La confirmación del broker no significa que Solicitudes ya haya guardado el evento.

Si la categoría queda guardada y la publicación falla, la respuesta debe indicar que el registro pudo persistirse. No se afirma rollback automático.

Respuesta propuesta para fallo de publicación:

- Estado HTTP: `503 Service Unavailable`.
- Cuerpo mínimo:

```json
{
  "codigo": "CATEGORIA_GUARDADA_PUBLICACION_FALLIDA",
  "mensaje": "La categoría pudo quedar guardada, pero RabbitMQ no confirmó la publicación.",
  "categoriaId": 42,
  "eventId": "9bd0f9a2-e594-462b-8d26-623af6240101"
}
```

## Flujo del consumidor

1. Escuchar `solicitudes.catalogo.queue`.
2. Deserializar y validar el evento.
3. Guardar la categoría en la tabla local de RDS Solicitudes.
4. Confirmar el procesamiento después de terminar correctamente la persistencia.
5. Registrar `eventId`, `categoriaId` y resultado sin secretos.

Con el modo AUTO de Spring AMQP, el listener debe retornar después del guardado y propagar los errores de persistencia. No se promete procesamiento exactamente una vez.

## Endpoint de categorías locales

Ruta interna y expuesta por el BFF:

`GET /v1/solicitudes/categorias`

Roles permitidos:

- `CLIENTE`
- `OPERADOR`
- `ADMINISTRADOR`

Respuesta `200 OK`:

```json
[
  {
    "id": 42,
    "nombre": "Redes EP2"
  }
]
```

Si todavía no existen categorías recibidas, responde `200 OK` con `[]`.

El frontend obtiene estas categorías mediante React → API Gateway → BFF → Solicitudes. No consulta Catálogo para llenar el selector de una nueva solicitud.

## Validación al crear una solicitud

`POST /v1/solicitudes` acepta un `categoriaId` solo si existe en la copia local de Solicitudes. Si la categoría todavía no fue recibida, el servicio responde de forma controlada y no crea la solicitud.

Las prioridades conservan el comportamiento de EP1.

## Datos iniciales

Las categorías insertadas directamente mediante SQL en RDS Catálogo no generan eventos. Las pruebas P2 a P5 utilizarán categorías nuevas creadas mediante el flujo de la aplicación.

Los datos simulados o insertados manualmente pueden utilizarse durante el desarrollo aislado, pero no como evidencia del flujo final.

## Responsabilidades

| Alexis | Damián |
|---|---|
| Catálogo y publicación | Solicitudes y consumo |
| Confirmaciones y retornos | Persistencia antes del ACK |
| RabbitMQ y recursos | Categorías locales |
| Frontend | Endpoint y BFF |
| EC2 A, EC2 C y RDS Catálogo | EC2 B y RDS Solicitudes |

## Cierre de G0

Antes de comenzar G1, ambos integrantes confirman:

- nombres de vhost, exchange, cola y routing key;
- estructura y tipos del evento;
- endpoint y respuesta de categorías locales;
- respuesta de publicación fallida;
- responsabilidades y ramas de trabajo.
