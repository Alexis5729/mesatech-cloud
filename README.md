# MesaTech Cloud

MesaTech Cloud es una solución de gestión de solicitudes de soporte desarrollada para la evaluación EP1 de Desarrollo Cloud Native. La aplicación integra un frontend React, autenticación con Microsoft Entra ID, AWS API Gateway, un Backend for Frontend y dos microservicios con persistencia PostgreSQL.

## Arquitectura

```text
React + MSAL
      |
      v
AWS API Gateway
      |
      v
BFF Spring Boot :8080
      |
      +--> solicitudes-service :8081
      |
      +--> catalogo-service :8082
                    |
                    v
             PostgreSQL :5432
```

El BFF valida la identidad y los roles del usuario. Los microservicios aplican las reglas de negocio y son los únicos componentes con acceso a PostgreSQL.

## Componentes

| Componente | Responsabilidad |
|---|---|
| `frontend/` | Interfaz React, autenticación MSAL y consumo de la API. |
| `backend/bff/` | Validación JWT, autorización por roles e integración con los microservicios. |
| `backend/solicitudes-service/` | Gestión del ciclo de vida de las solicitudes y API v1/v2. |
| `backend/catalogo-service/` | Administración de categorías y prioridades. |
| `database/schema/` | Esquemas iniciales de PostgreSQL. |
| `docs/evidencias/microservices-db/` | Contratos y registros de validación de microservicios y persistencia. |

## Puertos

| Servicio | Puerto |
|---|---:|
| BFF | `8080` |
| Solicitudes | `8081` |
| Catálogo | `8082` |
| PostgreSQL | `5432` |

## Documentación

- [`frontend/README.md`](frontend/README.md)
- [`backend/solicitudes-service/README.md`](backend/solicitudes-service/README.md)
- [`backend/catalogo-service/README.md`](backend/catalogo-service/README.md)
- [`docs/evidencias/microservices-db/CONTRATO_BFF.md`](docs/evidencias/microservices-db/CONTRATO_BFF.md)

## Configuración segura

Las URL, credenciales y parámetros de despliegue se suministran mediante variables de entorno. No se almacenan contraseñas, tokens, llaves privadas ni secretos de aplicaciones en Git.
