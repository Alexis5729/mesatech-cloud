# MesaTech Cloud

MesaTech Cloud es una solución de gestión de solicitudes de soporte desarrollada para la evaluación EP2 de Desarrollo Cloud Native.

La aplicación integra un frontend desarrollado en React, autenticación mediante Microsoft Entra ID, AWS API Gateway, un Backend for Frontend (BFF), dos microservicios independientes, dos bases de datos PostgreSQL administradas mediante Amazon RDS y comunicación asíncrona entre microservicios utilizando RabbitMQ.

## Arquitectura

```text
                  ┌─────────────────────┐
                  │   Microsoft Entra   │
                  │         ID          │
                  └─────────┬───────────┘
                            │
                            v
                       React + MSAL
                            │
                            │ Access Token
                            v
                  AWS API Gateway
                            │
                            v
                  BFF Spring Boot :8080
                     │              │
                     │              │
                     v              v
        solicitudes-service       catalogo-service
              :8081                    :8082
                │                         │
                │                         │
                v                         v
        Amazon RDS                Amazon RDS
        Solicitudes               Catálogo
                ^                         │
                │                         │
                │                         │
                │                 categoria.creada
                │                         │
                └──── RabbitMQ <──────────┘
                      EC2 + Docker
```

### Flujo principal

1. El usuario inicia sesión mediante Microsoft Entra ID.
2. React obtiene un Access Token mediante MSAL.
3. Las solicitudes HTTP son enviadas a AWS API Gateway.
4. API Gateway deriva las solicitudes hacia el BFF.
5. El BFF valida identidad y roles y comunica las solicitudes a los microservicios.
6. Cada microservicio utiliza su propia base de datos PostgreSQL en Amazon RDS.
7. Cuando se crea una categoría en `catalogo-service`, esta se guarda en RDS Catálogo y se publica un evento `categoria.creada` en RabbitMQ.
8. `solicitudes-service` consume el evento y mantiene una réplica local de las categorías en su propia base de datos.
9. Las categorías locales son utilizadas para validar la creación de nuevas solicitudes.

## Componentes

| Componente | Responsabilidad |
| --- | --- |
| `frontend/` | Interfaz React, autenticación con Microsoft Entra ID mediante MSAL y consumo de la API. |
| `backend/bff/` | Validación JWT, autorización por roles y comunicación con los microservicios. |
| `backend/solicitudes-service/` | Gestión del ciclo de vida de las solicitudes, validación de categorías y consumo de eventos RabbitMQ. |
| `backend/catalogo-service/` | Administración de categorías y prioridades y publicación de eventos RabbitMQ. |
| `infra/rabbitmq/` | Configuración Docker Compose del broker RabbitMQ utilizado en EP2. |
| `database/` | Scripts y definiciones relacionadas con persistencia PostgreSQL. |
| `docs/` | Contratos, documentación técnica y evidencias de la evaluación. |

## Persistencia

La arquitectura utiliza bases de datos independientes para cada microservicio.

### RDS Catálogo

Utilizada exclusivamente por `catalogo-service`.

Almacena:

- categorías;
- prioridades;
- información propia del catálogo.

### RDS Solicitudes

Utilizada exclusivamente por `solicitudes-service`.

Almacena:

- solicitudes;
- estados;
- identificadores asociados;
- réplica local de categorías recibidas mediante RabbitMQ.

Los microservicios no acceden directamente a la base de datos del otro servicio.

## Comunicación entre microservicios

La comunicación asíncrona entre Catálogo y Solicitudes se realiza mediante RabbitMQ.

```text
catalogo-service
      │
      │ categoria.creada
      v
catalogo.exchange
      │
      │ routing key: categoria.creada
      v
solicitudes.catalogo.queue
      │
      v
solicitudes-service
      │
      v
categorias_locales
RDS Solicitudes
```

### Configuración RabbitMQ

| Elemento | Valor |
| --- | --- |
| Virtual Host | `mesatech` |
| Exchange | `catalogo.exchange` |
| Tipo | `direct` |
| Queue | `solicitudes.catalogo.queue` |
| Routing Key | `categoria.creada` |
| Publisher | `catalogo-service` |
| Consumer | `solicitudes-service` |

RabbitMQ se ejecuta mediante Docker en una instancia EC2 independiente.

La documentación detallada de RabbitMQ se encuentra en:

```text
infra/rabbitmq/README.md
```

## Infraestructura AWS

La solución desplegada para EP2 utiliza:

- Amazon EC2 para `catalogo-service`;
- Amazon EC2 para `solicitudes-service`;
- Amazon EC2 para RabbitMQ;
- Amazon RDS PostgreSQL independiente para Catálogo;
- Amazon RDS PostgreSQL independiente para Solicitudes;
- AWS API Gateway;
- Microsoft Entra ID para autenticación;
- Security Groups para restringir la comunicación entre componentes.

Las bases de datos RDS no requieren exposición pública para el funcionamiento normal de la aplicación.

## Puertos de aplicación

| Servicio | Puerto |
| --- | --- |
| BFF | `8080` |
| Solicitudes | `8081` |
| Catálogo | `8082` |
| PostgreSQL | `5432` |
| RabbitMQ AMQP | `5672` |
| RabbitMQ Management | `15672` |
| Frontend local | `5173` |

Los puertos expuestos en AWS se controlan mediante Security Groups y solo se habilitan cuando son necesarios para la arquitectura o las pruebas de la evaluación.

## Endpoints principales

### Catálogo

```text
GET    /v1/catalogo/categorias
POST   /v1/catalogo/categorias
PUT    /v1/catalogo/categorias/{id}
DELETE /v1/catalogo/categorias/{id}

GET    /v1/catalogo/prioridades
POST   /v1/catalogo/prioridades
PUT    /v1/catalogo/prioridades/{id}
DELETE /v1/catalogo/prioridades/{id}
```

### Solicitudes

```text
POST  /v1/solicitudes
GET   /v1/solicitudes
GET   /v1/solicitudes/mias
PATCH /v1/solicitudes/{id}/estado

GET   /v1/solicitudes/categorias
GET   /v2/solicitudes
```

El endpoint:

```text
GET /v1/solicitudes/categorias
```

consulta las categorías almacenadas localmente por `solicitudes-service` después de haber sido recibidas desde RabbitMQ.

## Seguridad

Las credenciales y parámetros sensibles se suministran mediante variables de entorno.

No se almacenan en Git:

- contraseñas;
- tokens JWT;
- Access Tokens;
- credenciales de AWS;
- claves privadas;
- archivos `.env` reales;
- contraseñas de PostgreSQL;
- contraseñas de RabbitMQ.

Los archivos `.env.example` contienen únicamente referencias o valores ficticios necesarios para reproducir la configuración.

## Documentación

La documentación específica de cada componente se encuentra en:

```text
frontend/README.md
backend/solicitudes-service/README.md
backend/catalogo-service/README.md
infra/rabbitmq/README.md
docs/
```

## Estado de integración EP2

La comunicación asíncrona implementada sigue el flujo:

```text
Crear categoría
      ↓
catalogo-service
      ↓
RDS Catálogo
      ↓
RabbitMQ
      ↓
solicitudes-service
      ↓
categorias_locales
      ↓
RDS Solicitudes
```

La integración ha sido validada en AWS comprobando que:

- Catálogo persiste categorías en su RDS.
- Catálogo publica eventos `categoria.creada`.
- RabbitMQ recibe y enruta los mensajes.
- Solicitudes consume los mensajes.
- La cola disminuye después del consumo.
- Las categorías recibidas se almacenan en `categorias_locales`.
- `GET /v1/solicitudes/categorias` devuelve las categorías sincronizadas.