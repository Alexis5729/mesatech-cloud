# Catálogo Service

Microservicio responsable de administrar las categorías y prioridades utilizadas por las solicitudes. Está desarrollado con Java 17, Spring Boot, JPA y PostgreSQL.

## Responsabilidad

- Crear, consultar, modificar y eliminar categorías.
- Crear, consultar, modificar y eliminar prioridades.
- Entregar los identificadores que `solicitudes-service` guarda como `categoriaId` y `prioridadId`.
- Persistir el catálogo sin acceso directo desde el BFF a la base de datos.

## Endpoints v1

| Método | Ruta | Uso |
|---|---|---|
| `GET` | `/v1/catalogo/categorias` | Consultar categorías. |
| `POST` | `/v1/catalogo/categorias` | Crear una categoría. |
| `PUT` | `/v1/catalogo/categorias/{id}` | Modificar una categoría. |
| `DELETE` | `/v1/catalogo/categorias/{id}` | Eliminar una categoría. |
| `GET` | `/v1/catalogo/prioridades` | Consultar prioridades. |
| `POST` | `/v1/catalogo/prioridades` | Crear una prioridad. |
| `PUT` | `/v1/catalogo/prioridades/{id}` | Modificar una prioridad. |
| `DELETE` | `/v1/catalogo/prioridades/{id}` | Eliminar una prioridad. |

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

El nombre de cada elemento debe ser único. En prioridades, el nivel también debe ser único y positivo.

## Respuestas

- Crear devuelve HTTP `201`.
- Modificar y consultar devuelven HTTP `200`.
- Eliminar devuelve HTTP `204`.
- Un elemento inexistente devuelve HTTP `404`.
- Un nombre o nivel duplicado devuelve HTTP `409`.
- Datos inválidos devuelven HTTP `400`.

Los errores usan `status`, `message` y `timestamp`, igual que `solicitudes-service`.

## Configuración

| Variable | Valor local predeterminado |
|---|---|
| `CATALOGO_PORT` | `8082` |
| `DB_URL` | `jdbc:postgresql://localhost:5432/mesatech` |
| `DB_USERNAME` | `postgres` |
| `DB_PASSWORD` | vacío |
| `JPA_DDL_AUTO` | `update` |

Ejemplo en PowerShell:

```powershell
$env:DB_PASSWORD = "tu_clave_local"
.\mvnw.cmd spring-boot:run
```

Las credenciales se suministran mediante variables de entorno y se mantienen fuera del repositorio.

## Pruebas

```powershell
.\mvnw.cmd test
```

Las pruebas usan H2 y validan el CRUD completo de categorías y prioridades, persistencia, duplicados, validaciones y arranque del contexto.

## Organización interna

```text
controller/   define los endpoints
service/      aplica validaciones y mantenimiento
repository/   accede a PostgreSQL mediante JPA
entity/       representa categorías y prioridades
dto/          define los JSON de entrada y salida
exception/    devuelve errores uniformes
```
