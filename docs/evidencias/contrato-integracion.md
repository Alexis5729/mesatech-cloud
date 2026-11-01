# Contrato de integración EP2 — MesaTech Cloud

## RabbitMQ

- Virtual host: `mesatech`
- Exchange: `catalogo.exchange`
- Tipo: `direct`
- Durable: `true`
- Cola: `solicitudes.catalogo.queue`
- Durable: `true`
- Auto delete: `false`
- Routing key: `categoria.creada`

## Evento categoria.creada

Formato: JSON UTF-8.

```json
{
  "eventId": "9bd0f9a2-e594-462b-8d26-623af6240101",
  "tipoEvento": "categoria.creada",
  "fechaEvento": "2026-10-28T20:00:00Z",
  "categoriaId": 42,
  "nombre": "Redes EP2"
}
```

### Campos

- `eventId`: UUID representado como texto.
- `tipoEvento`: `categoria.creada`.
- `fechaEvento`: fecha y hora ISO 8601 UTC.
- `categoriaId`: identificador original de la categoría creada por Catálogo.
- `nombre`: nombre de la categoría.

Solicitudes debe conservar el `categoriaId` original recibido desde Catálogo.

## Categorías locales

Endpoint:

`GET /v1/solicitudes/categorias`

Respuesta:

```json
[
  {
    "id": 42,
    "nombre": "Redes EP2"
  }
]
```

## Flujo

`React → API Gateway → BFF → Solicitudes`

La creación de categorías mantiene:

`React → API Gateway → BFF → Catálogo`

y posteriormente:

`Catálogo → RabbitMQ → Solicitudes`

## Autorización

- Crear categoría: `ADMINISTRADOR`
- Consultar categorías locales: `CLIENTE`, `OPERADOR`, `ADMINISTRADOR`

## Fallo de publicación

Si Catálogo guarda correctamente la categoría pero RabbitMQ no confirma la publicación:

- se devuelve un error HTTP controlado;
- no se afirma que el registro fue revertido;
- se informa que la categoría pudo quedar persistida;
- se conserva `categoriaId` para trazabilidad cuando sea posible.

## Alcance

Para EP2 se implementa únicamente el evento `categoria.creada`.
No se exige propagar por RabbitMQ modificaciones, eliminaciones ni prioridades.