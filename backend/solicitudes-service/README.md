# Solicitudes Service

Microservicio del **Integrante 3** para crear, consultar y cambiar el estado de solicitudes. Usa Java 17, Spring Boot, JPA y PostgreSQL.

## Responsabilidad

- Guarda las solicitudes en su propia base de datos.
- Recibe la identidad del usuario desde el BFF en `X-User-Id`.
- Aplica las transiciones de estado obligatorias.
- No valida JWT y no accede a Microsoft Entra ID; esas tareas pertenecen al BFF.
- Guarda `categoriaId` y `prioridadId`. La validación contra el catálogo se integrará en una etapa posterior.

## Endpoints

| Método | Ruta | Uso |
|---|---|---|
| `POST` | `/v1/solicitudes` | Crear una solicitud. Requiere `X-User-Id`. |
| `GET` | `/v1/solicitudes/mias` | Consultar las solicitudes del usuario. Requiere `X-User-Id`. |
| `GET` | `/v1/solicitudes` | Consultar todas las solicitudes. |
| `PATCH` | `/v1/solicitudes/{id}/estado` | Cambiar el estado de una solicitud. |
| `GET` | `/v2/solicitudes` | Consultar solicitudes agregando `diasAbierta`. |

### Crear una solicitud

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

La solicitud se crea automáticamente con estado `CREADA`, fecha UTC y el usuario recibido en el header.

## Versionamiento

- `/v1/solicitudes` conserva exactamente los campos originales.
- `/v2/solicitudes` devuelve los mismos campos y agrega `diasAbierta`.
- `diasAbierta` cuenta los días calendario desde `fechaCreacion` hasta la fecha UTC actual.
- No se guarda otro campo en la tabla, por lo que ambas versiones usan los mismos datos persistidos.

### Cambiar un estado

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

- `RESUELTA` solo se acepta cuando el estado actual es `EN_PROCESO`.
- `CANCELADA` se acepta desde `CREADA`, `ASIGNADA` y `EN_PROCESO`.
- Una solicitud `RESUELTA`, `CERRADA` o `CANCELADA` no se puede cancelar.
- Una transición inválida devuelve HTTP `409`.

## Errores

Todos los errores controlados usan el formato acordado:

```json
{
  "status": 409,
  "message": "No se puede cambiar una solicitud de CREADA a RESUELTA",
  "timestamp": "2026-09-13T12:00:00Z"
}
```

## Configuración

El servicio escucha en `8081`. Las variables se pueden cambiar sin modificar código:

| Variable | Valor local predeterminado |
|---|---|
| `SOLICITUDES_PORT` | `8081` |
| `DB_URL` | `jdbc:postgresql://localhost:5432/mesatech` |
| `DB_USERNAME` | `postgres` |
| `DB_PASSWORD` | vacío |
| `JPA_DDL_AUTO` | `update` |

Ejemplo en PowerShell:

```powershell
$env:DB_PASSWORD = "tu_clave_local"
.\mvnw.cmd spring-boot:run
```

No se deben guardar contraseñas reales en Git.

## Pruebas

```powershell
.\mvnw.cmd test
```

Las pruebas usan H2 solo dentro del entorno de test. Cubren creación, consulta general, consulta por usuario, persistencia, flujo válido, transición inválida a `RESUELTA`, cancelación, errores del header y funcionamiento simultáneo de v1 y v2.

## Estructura simple

```text
controller/   recibe solicitudes HTTP
service/      aplica reglas de negocio
repository/   accede a la base de datos
entity/       representa la tabla y los estados
dto/          define los JSON de entrada y salida
exception/    entrega errores uniformes
```

## Pendiente de otras etapas

- Integración del BFF con estos endpoints.
- Integración de `catalogo-service` con el BFF.
- Instalación de PostgreSQL y despliegue en EC2.
