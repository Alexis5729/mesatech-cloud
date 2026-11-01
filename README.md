# MesaTech Cloud

MesaTech Cloud es una solución de gestión de solicitudes de soporte desarrollada para la evaluación EP2 de Desarrollo Cloud Native I. La versión final conserva la seguridad y APIs de la EP1 e incorpora separación real de microservicios y bases de datos, además de mensajería asíncrona mediante RabbitMQ.

## Arquitectura final

```text
React + MSAL / Microsoft Entra ID
              |
              v
       AWS API Gateway
              |
              v
       BFF Spring Boot :8080
          /             \
         v               v
Solicitudes :8081     Catálogo :8082
     |                    |
     |                    +--> RDS Catálogo :5432
     |                    |
     |                    +--> RabbitMQ :5672
     |                           |
     +---------------------------+
     |
     v
RDS Solicitudes :5432
```

RabbitMQ se ejecuta en una tercera EC2 independiente. El BFF no accede directamente a ninguna RDS.

Cuando se crea una categoría, Catálogo la persiste en su RDS y publica el evento `categoria.creada`. Solicitudes consume ese evento y guarda una copia local de la categoría en su propia RDS. La creación de solicitudes valida la categoría contra esa copia local.

## Componentes

| Componente | Responsabilidad |
|---|---|
| `frontend/` | React, autenticación MSAL y consumo seguro de la API. |
| `backend/bff/` | Validación JWT, autorización por roles y orquestación hacia microservicios. |
| `backend/catalogo-service/` | Categorías, prioridades, persistencia propia y publicación RabbitMQ. |
| `backend/solicitudes-service/` | Solicitudes, ciclo de estados, consumidor RabbitMQ y categorías locales. |
| `infra/rabbitmq/` | Docker Compose, variables de ejemplo y documentación reproducible del broker. |
| `database/` | Scripts SQL para Catálogo y Solicitudes. |
| `docs/ep2/` | Contrato final de integración EP2. |

## Despliegue AWS

La evaluación final utiliza:

- EC2 BFF — Amazon Linux 2023.
- EC2 Catálogo — Amazon Linux 2023.
- EC2 Solicitudes — Amazon Linux 2023.
- EC2 RabbitMQ — Ubuntu 24.04 LTS.
- RDS PostgreSQL exclusivo para Catálogo.
- RDS PostgreSQL exclusivo para Solicitudes.

Los RDS no se exponen públicamente y cada uno acepta PostgreSQL únicamente desde el Security Group del microservicio propietario.

## Puertos

| Servicio | Puerto | Uso |
|---|---:|---|
| BFF | `8080` | Integración HTTP desde API Gateway. |
| Solicitudes | `8081` | API interna del microservicio. |
| Catálogo | `8082` | API interna del microservicio. |
| RabbitMQ AMQP | `5672` | Publicación/consumo entre microservicios. |
| RabbitMQ Management | `15672` | Administración restringida. |
| PostgreSQL | `5432` | Acceso privado desde el microservicio propietario. |

## RabbitMQ final

```text
Virtual host: mesatech
Publisher: catalogo-publisher
Consumer: solicitudes-consumer
Exchange: catalogo.exchange
Tipo: direct
Queue: solicitudes.catalogo.queue
Routing key: categoria.creada
Queue durable: true
Auto delete: false
```

El publisher utiliza mensajes persistentes, Publisher Confirms, Publisher Returns y `mandatory=true`. El consumidor utiliza ACK AUTO de Spring AMQP después de persistir correctamente.

## Seguridad heredada de EP1

- Microsoft Entra ID.
- JWT Authorizer en API Gateway.
- Roles `CLIENTE`, `OPERADOR` y `ADMINISTRADOR`.
- Rutas `/v1` y `/v2`.
- CORS para el frontend autorizado.
- Operaciones administrativas de Catálogo restringidas a `ADMINISTRADOR`.

## Pruebas finales EP2

Las pruebas P1 a P8 fueron ejecutadas sobre la infraestructura AWS final:

- separación de EC2 y RDS;
- flujo completo desde React;
- consumidor detenido y consumo diferido;
- recreación del contenedor RabbitMQ conservando volumen;
- reinicio de aplicaciones sin pérdida de datos;
- fallo controlado de publicación con HTTP 502;
- seguridad, roles, transición de estados y disponibilidad v1/v2.

Las evidencias se mantienen en el informe técnico de la evaluación.

## Documentación

- [RabbitMQ EP2](infra/rabbitmq/README.md)
- [Contrato de integración EP2](docs/ep2/contrato-integracion.md)
- [Frontend](frontend/README.md)
- [Solicitudes Service](backend/solicitudes-service/README.md)
- [Catálogo Service](backend/catalogo-service/README.md)

## Configuración segura

Las URL, credenciales y parámetros de despliegue se suministran mediante variables de entorno. No se almacenan contraseñas, tokens JWT, llaves privadas, archivos `.env` reales ni credenciales AWS en Git.
