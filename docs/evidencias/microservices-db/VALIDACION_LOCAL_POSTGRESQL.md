# Validación local del Integrante 3

Fecha de validación: **13 de septiembre de 2026**.

## Alcance

Esta evidencia corresponde únicamente a:

- `solicitudes-service`.
- `catalogo-service`.
- PostgreSQL local.
- Persistencia y pruebas automáticas.

No se configuraron BFF, frontend, API Gateway ni AWS durante esta validación.

## PostgreSQL real

| Elemento | Resultado |
|---|---|
| Versión | PostgreSQL 18.6 para Windows |
| Servicio | `postgresql-x64-18` iniciado automáticamente |
| Host | `localhost` |
| Puerto | `5432` |
| Base | `mesatech` |
| Usuario local | `postgres` |

La contraseña se entregó a los procesos mediante una variable de entorno temporal y no se almacenó en Git.

## Esquema ejecutado

Se ejecutaron correctamente, en este orden:

1. `database/schema/01_solicitudes.sql`.
2. `database/schema/02_catalogo.sql`.

Tablas comprobadas:

- `solicitudes`.
- `categorias`.
- `prioridades`.

Los scripts son compatibles con PostgreSQL. Utilizan `BIGSERIAL`, `TIMESTAMPTZ`, restricciones `CHECK`, índices y `ON CONFLICT DO NOTHING`.

## Prueba de persistencia

Los datos se crearon mediante los endpoints de los microservicios, no mediante inserciones SQL manuales:

| Dato | Identificador |
|---|---|
| Categoría `Evidencia PostgreSQL` | 5 |
| Prioridad `Evidencia Local` | 5 |
| Solicitud `Validación PostgreSQL real` | 1 |

Procedimiento realizado:

1. Iniciar ambos servicios conectados a `mesatech`.
2. Crear la categoría y la prioridad mediante `catalogo-service`.
3. Crear la solicitud mediante `solicitudes-service` y `X-User-Id`.
4. Consultar los datos en `/v1` y `/v2`.
5. Detener ambos servicios.
6. Volver a iniciarlos con las mismas variables de entorno.
7. Consultar nuevamente los datos.

Resultado: los tres registros continuaron disponibles después del reinicio. También se comprobó `/v1/solicitudes/mias` y el campo `diasAbierta` de `/v2/solicitudes`.

Estado final almacenado en PostgreSQL:

- 1 solicitud.
- 5 categorías: cuatro iniciales y una de evidencia.
- 5 prioridades: cuatro iniciales y una de evidencia.

## Variables de entorno

Cada servicio se inició desde su propia terminal con variables temporales:

```powershell
$env:DB_URL = "jdbc:postgresql://localhost:5432/mesatech"
$env:DB_USERNAME = "postgres"
$env:DB_PASSWORD = "<CONTRASEÑA_LOCAL>"
```

La contraseña real no debe escribirse en `application.yml`, README, scripts ni capturas.

## Compilación y pruebas

Comandos ejecutados:

```powershell
cd backend\solicitudes-service
.\mvnw.cmd clean package

cd ..\catalogo-service
.\mvnw.cmd clean package
```

| Microservicio | Pruebas | Fallos | Resultado |
|---|---:|---:|---|
| solicitudes-service | 8 | 0 | `BUILD SUCCESS` |
| catalogo-service | 5 | 0 | `BUILD SUCCESS` |
| Total | 13 | 0 | Correcto |

Las pruebas automáticas utilizaron H2 en memoria mediante el perfil `test`. PostgreSQL se utilizó para la prueba funcional local y de persistencia.

JAR generados:

- `backend/solicitudes-service/target/solicitudes-service-0.0.1-SNAPSHOT.jar`.
- `backend/catalogo-service/target/catalogo-service-0.0.1-SNAPSHOT.jar`.

## Resultado

La persistencia local y la compilación de ambos microservicios están validadas. El despliegue en EC2 queda pendiente para la etapa AWS.
