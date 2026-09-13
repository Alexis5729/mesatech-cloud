# Contrato de integración con el BFF

Este documento indica lo que el Integrante 2 necesita para conectar el BFF con los microservicios del Integrante 3. El BFF no necesita ni debe tener acceso directo a PostgreSQL.

## Direcciones locales

| Servicio | Dirección |
|---|---|
| solicitudes-service | `http://localhost:8081` |
| catalogo-service | `http://localhost:8082` |

En AWS el BFF y los microservicios estarán en dos EC2 distintas, dentro de la misma región y VPC. El Integrante 2 reemplazará `localhost` por la IP o DNS privado de la EC2 del Integrante 3; las rutas HTTP no cambian.

## Identidad del usuario

El BFF debe extraer la identidad desde el JWT y enviarla al microservicio como:

```http
X-User-Id: identificador-del-usuario
```

El cliente no envía `usuarioSolicitante` dentro del JSON. `solicitudes-service` lo obtiene exclusivamente desde `X-User-Id`.

## Solicitudes v1

### Crear

```http
POST /v1/solicitudes
X-User-Id: usuario-123
Content-Type: application/json
```

```json
{
  "titulo": "No funciona el correo",
  "descripcion": "Outlook no sincroniza",
  "categoriaId": 1,
  "prioridadId": 2
}
```

Respuesta: HTTP `201` con la solicitud creada en estado `CREADA`.

### Consultar solicitudes del usuario

```http
GET /v1/solicitudes/mias
X-User-Id: usuario-123
```

### Consultar todas

```http
GET /v1/solicitudes
```

### Cambiar estado

```http
PATCH /v1/solicitudes/1/estado
Content-Type: application/json
```

```json
{
  "estado": "ASIGNADA"
}
```

Estados válidos:

```text
CREADA -> ASIGNADA -> EN_PROCESO -> RESUELTA -> CERRADA
   |          |            |
   +----------+------------+-> CANCELADA
```

Una transición inválida devuelve HTTP `409`.

## Solicitudes v2

```http
GET /v2/solicitudes
```

Devuelve los mismos campos de v1 y agrega `diasAbierta`. La respuesta de v1 no contiene ese campo.

## Categorías

| Método | Ruta |
|---|---|
| `GET` | `/v1/catalogo/categorias` |
| `POST` | `/v1/catalogo/categorias` |
| `PUT` | `/v1/catalogo/categorias/{id}` |
| `DELETE` | `/v1/catalogo/categorias/{id}` |

JSON de creación o modificación:

```json
{
  "nombre": "Hardware",
  "descripcion": "Equipos y periféricos"
}
```

## Prioridades

| Método | Ruta |
|---|---|
| `GET` | `/v1/catalogo/prioridades` |
| `POST` | `/v1/catalogo/prioridades` |
| `PUT` | `/v1/catalogo/prioridades/{id}` |
| `DELETE` | `/v1/catalogo/prioridades/{id}` |

JSON de creación o modificación:

```json
{
  "nombre": "Alta",
  "nivel": 3
}
```

## Errores

Los dos microservicios responden errores controlados con la misma estructura:

```json
{
  "status": 409,
  "message": "Descripción sencilla del error",
  "timestamp": "2026-09-13T12:00:00Z"
}
```

Códigos principales:

- `400`: JSON o datos inválidos, o falta `X-User-Id`.
- `404`: elemento inexistente.
- `409`: transición de estado o elemento duplicado.

## Límites de responsabilidad

- El BFF valida JWT, roles y scopes.
- El BFF propaga `X-User-Id` hacia `solicitudes-service`.
- Los microservicios aplican sus reglas y acceden a PostgreSQL.
- El BFF no accede directamente a las tablas.
- Las URL se configuran como variables del BFF usando la dirección privada de la EC2 del Integrante 3.
- Los puertos `8081` y `8082` aceptan tráfico solamente desde la EC2 o el Security Group del BFF.
- PostgreSQL `5432` no se expone al BFF ni a Internet.
