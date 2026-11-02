# MesaTech Cloud

MesaTech Cloud es una solución de gestión de solicitudes de soporte desarrollada para la evaluación EP2 de Desarrollo Cloud Native I.

La versión final integra un frontend React, autenticación mediante Microsoft Entra ID, AWS API Gateway, un Backend for Frontend (BFF), dos microservicios independientes, bases de datos PostgreSQL separadas mediante Amazon RDS y comunicación asíncrona mediante RabbitMQ.

## Arquitectura final

```text
                  Microsoft Entra ID
                          |
                          v
                    React + MSAL
                          |
                     Access Token
                          |
                          v
                   AWS API Gateway
                          |
                          v
                  BFF Spring Boot
                       :8080
                   /           \
                  v             v
     solicitudes-service    catalogo-service
           :8081                :8082
             |                    |
             v                    v
      RDS Solicitudes       RDS Catálogo
             ^                    |
             |                    |
             |             categoria.creada
             |                    |
             +------ RabbitMQ <----+
                    EC2 + Docker

RabbitMQ se ejecuta en una EC2 independiente.

El BFF no accede directamente a las bases de datos RDS.

Cuando se crea una categoría, catalogo-service la persiste en RDS Catálogo y publica el evento categoria.creada.

solicitudes-service consume el evento y mantiene una copia local de la categoría en su propio RDS.

La creación de nuevas solicitudes valida el categoriaId contra esta copia local.
Flujo principal
1. El usuario inicia sesión mediante Microsoft Entra ID.
2. React obtiene un Access Token mediante MSAL.
3. React envía las solicitudes HTTP hacia AWS API Gateway.
4. API Gateway deriva las solicitudes hacia el BFF.
5. El BFF valida identidad y roles.
6. El BFF comunica las operaciones a los microservicios correspondientes.
7. Cada microservicio utiliza su propia base de datos PostgreSQL en Amazon RDS.
8. Al crear una categoría, Catálogo la persiste y publica categoria.creada.
9. RabbitMQ enruta el evento hacia Solicitudes.
10. Solicitudes consume el evento y almacena la categoría en categorias_locales.
11. Las categorías locales son utilizadas para validar nuevas solicitudes.
Componentes
Componente	Responsabilidad
frontend/	React, autenticación mediante Microsoft Entra ID/MSAL y consumo seguro de la API.
backend/bff/	Validación JWT, autorización por roles y comunicación con los microservicios.
backend/catalogo-service/	Categorías, prioridades, persistencia propia y publicación RabbitMQ.
backend/solicitudes-service/	Gestión de solicitudes, estados, consumer RabbitMQ y categorías locales.
infra/rabbitmq/	Docker Compose y configuración reproducible del broker RabbitMQ.
database/	Scripts y definiciones de persistencia PostgreSQL.
docs/ep2/	Contrato y documentación técnica de la integración EP2.
docs/evidencias/	Evidencias y documentación asociada a la evaluación.


Despliegue AWS
La infraestructura final utiliza:
- EC2 BFF — Amazon Linux 2023.
- EC2 Catálogo — Amazon Linux 2023.
- EC2 Solicitudes — Amazon Linux 2023.
- EC2 RabbitMQ — Ubuntu 24.04 LTS.
- Amazon RDS PostgreSQL independiente para Catálogo.
- Amazon RDS PostgreSQL independiente para Solicitudes.
- AWS API Gateway.
- Microsoft Entra ID.
- Security Groups para restringir las comunicaciones.
Los RDS no se exponen públicamente para el funcionamiento normal.

Cada RDS acepta conexiones PostgreSQL únicamente desde el microservicio propietario.
Persistencia
RDS Catálogo
Utilizado exclusivamente por:
catalogo-service

Almacena:
- categorías;
- prioridades;
- datos propios del catálogo.
RDS Solicitudes
Utilizado exclusivamente por:
solicitudes-service

Almacena:
- solicitudes;
- estados;
- identificadores asociados;
- categorías locales sincronizadas mediante RabbitMQ.
La tabla:
categorias_locales

mantiene la copia local de las categorías recibidas desde Catálogo.

Los microservicios no acceden directamente al RDS del otro servicio.
Comunicación entre microservicios
La comunicación asíncrona utiliza RabbitMQ:
catalogo-service
      |
      | categoria.creada
      v
catalogo.exchange
      |
      | routing key: categoria.creada
      v
solicitudes.catalogo.queue
      |
      v
solicitudes-service
      |
      v
categorias_locales
      |
      v
RDS Solicitudes

RabbitMQ final
La configuración desplegada y validada en AWS es:
Elemento	Valor
Virtual host	mesatech
Usuario administrador/bootstrap	mesatech_admin
Publisher Catálogo	catalogo-publisher
Consumer Solicitudes	solicitudes-consumer
Exchange	catalogo.exchange
Tipo	direct
Exchange durable	Sí
Queue	solicitudes.catalogo.queue
Queue durable	Sí
Auto delete	No
Routing key	categoria.creada


Configuración del contenedor AWS:
Container: rabbitmq
Hostname: mesatech-rabbitmq
Image: rabbitmq:4.4.0-management
Volume: rabbitmq_data:/var/lib/rabbitmq

El usuario:
mesatech_admin

se utiliza únicamente para administración/bootstrap.

Las aplicaciones utilizan usuarios separados y no administradores:
catalogo-service
→ catalogo-publisher

solicitudes-service
→ solicitudes-consumer

Garantías RabbitMQ
El publisher utiliza:
Delivery Mode: PERSISTENT
Publisher Confirms
Publisher Returns
mandatory=true

El consumer utiliza ACK AUTO de Spring AMQP después de finalizar correctamente el procesamiento.
Publisher Confirm
= RabbitMQ aceptó la publicación.

ACK consumidor
= Solicitudes terminó correctamente después de persistir.

No se afirma procesamiento exactly-once.
Puertos
Servicio	Puerto	Uso
BFF	8080	Integración HTTP desde API Gateway
Solicitudes	8081	API interna
Catálogo	8082	API interna
PostgreSQL	5432	Acceso privado a RDS
RabbitMQ AMQP	5672	Publisher/consumer
RabbitMQ Management	15672	Administración restringida
Frontend local	5173	Desarrollo React/Vite


Los accesos en AWS se controlan mediante Security Groups.
Endpoints principales
Catálogo
GET    /v1/catalogo/categorias
POST   /v1/catalogo/categorias
PUT    /v1/catalogo/categorias/{id}
DELETE /v1/catalogo/categorias/{id}

GET    /v1/catalogo/prioridades
POST   /v1/catalogo/prioridades
PUT    /v1/catalogo/prioridades/{id}
DELETE /v1/catalogo/prioridades/{id}

Solicitudes
POST  /v1/solicitudes
GET   /v1/solicitudes
GET   /v1/solicitudes/mias
PATCH /v1/solicitudes/{id}/estado

GET   /v1/solicitudes/categorias
GET   /v2/solicitudes

El endpoint:
GET /v1/solicitudes/categorias

devuelve las categorías almacenadas localmente por solicitudes-service después de haber sido recibidas mediante RabbitMQ.
Seguridad
La solución utiliza:
- Microsoft Entra ID.
- MSAL en React.
- JWT Authorizer en AWS API Gateway.
- autorización por roles en BFF.
- Security Groups en AWS.
- variables de entorno para configuraciones sensibles.
Roles:
CLIENTE
OPERADOR
ADMINISTRADOR

Las operaciones administrativas del catálogo están restringidas a:
ADMINISTRADOR

No se almacenan en Git:
- contraseñas;
- tokens JWT;
- Access Tokens;
- archivos .env reales;
- credenciales AWS;
- claves privadas;
- contraseñas PostgreSQL;
- contraseñas RabbitMQ.
Fallo de publicación RabbitMQ
PostgreSQL y RabbitMQ no forman una transacción distribuida.

Puede ocurrir:
RDS Catálogo guarda categoría
          |
          v
RabbitMQ no confirma publicación
          |
          v
HTTP 502 controlado

En este escenario la categoría puede permanecer almacenada en RDS Catálogo.

Este comportamiento fue validado durante las pruebas EP2.
Pruebas EP2
Las pruebas P1 a P8 fueron ejecutadas sobre la infraestructura AWS final.

Se validó:
- separación de EC2 y RDS;
- persistencia independiente por microservicio;
- publicación categoria.creada;
- consumo mediante RabbitMQ;
- almacenamiento en categorias_locales;
- consumer detenido y consumo diferido;
- persistencia de mensajes;
- recreación del contenedor conservando volumen;
- reinicio de aplicaciones sin pérdida de datos;
- fallo controlado RabbitMQ con HTTP 502;
- autenticación mediante Entra ID;
- JWT;
- roles;
- transición de estados;
- funcionamiento de v1 y v2;
- flujo desde React hacia la infraestructura AWS.
Estado de integración EP2
El flujo completo validado es:
Crear categoría
      |
      v
catalogo-service
      |
      +----> RDS Catálogo
      |
      v
RabbitMQ
      |
      v
solicitudes-service
      |
      v
categorias_locales
      |
      v
RDS Solicitudes

Se comprobó que:
- Catálogo persiste categorías en su RDS.
- Catálogo publica categoria.creada.
- RabbitMQ recibe y enruta los mensajes.
- Solicitudes consume los mensajes.
- Las categorías se almacenan en categorias_locales.
- GET /v1/solicitudes/categorias devuelve las categorías sincronizadas.
- La creación de solicitudes valida el categoriaId contra la copia local.
Documentación
- [RabbitMQ EP2](infra/rabbitmq/README.md)
- [Contrato de integración EP2](docs/ep2/contrato-integracion.md)
- [Frontend](frontend/README.md)
- [Solicitudes Service](backend/solicitudes-service/README.md)
- [Catálogo Service](backend/catalogo-service/README.md)