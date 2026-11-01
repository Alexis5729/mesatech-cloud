# Frontend MesaTech Cloud

Aplicación web desarrollada con React y Vite.

Gestiona el inicio de sesión mediante Microsoft Entra ID y consume la API protegida a través de AWS API Gateway.

## Funcionalidades

- Inicio y cierre de sesión con MSAL.
- Consulta de solicitudes según el rol del usuario.
- Creación de solicitudes utilizando categorías sincronizadas desde `solicitudes-service`.
- Actualización del estado de las solicitudes para los roles autorizados.
- Administración de categorías y prioridades.
- Envío del Access Token en las solicitudes dirigidas a la API.
- Navegación protegida según autenticación y roles.

## Arquitectura de consumo

El frontend no se comunica directamente con los microservicios desplegados en AWS.

El flujo principal es:

```text
React
  ↓
MSAL
  ↓
Access Token
  ↓
AWS API Gateway
  ↓
BFF
  ↓
Microservicios
```

Esto permite centralizar:

- autenticación;
- autorización;
- propagación de identidad;
- acceso a los microservicios;
- manejo de rutas protegidas.

## Categorías utilizadas al crear solicitudes

Para crear una nueva solicitud, el frontend obtiene las categorías desde:

```text
GET /v1/solicitudes/categorias
```

El flujo esperado es:

```text
React
  ↓
AWS API Gateway
  ↓
BFF
  ↓
solicitudes-service
  ↓
categorias_locales
```

Las categorías disponibles en `categorias_locales` fueron previamente sincronizadas desde `catalogo-service` mediante RabbitMQ.

El frontend no necesita consultar directamente el RDS de Catálogo ni comunicarse directamente con RabbitMQ.

## Flujo de sincronización relacionado

La información utilizada por el frontend se origina mediante el siguiente flujo:

```text
catalogo-service
      ↓
RabbitMQ
      ↓
solicitudes-service
      ↓
categorias_locales
      ↓
GET /v1/solicitudes/categorias
      ↓
BFF
      ↓
API Gateway
      ↓
React
```

## Configuración

La dirección de AWS API Gateway se define en un archivo `.env` local:

```dotenv
VITE_API_URL=https://<api-id>.execute-api.<region>.amazonaws.com
```

El archivo `.env` permanece fuera del repositorio.

El archivo:

```text
.env.example
```

conserva únicamente la referencia de configuración necesaria para ejecutar el proyecto.

Las credenciales, tokens y secretos no deben almacenarse en estos archivos de ejemplo.

## Ejecución local

Instalar dependencias:

```powershell
npm install
```

Ejecutar el servidor de desarrollo:

```powershell
npm run dev
```

La aplicación queda disponible de forma predeterminada en:

```text
http://localhost:5173
```

## Verificación

Ejecutar:

```powershell
npm run lint
```

y:

```powershell
npm run build
```

La compilación genera los archivos de distribución en:

```text
frontend/dist/
```

## Autenticación

La autenticación se realiza mediante Microsoft Entra ID utilizando MSAL.

El flujo es:

```text
Usuario
   ↓
Microsoft Entra ID
   ↓
MSAL
   ↓
Access Token
   ↓
Frontend
   ↓
API Gateway
```

El Access Token se incluye en las solicitudes protegidas.

## Autorización

La interfaz utiliza la información del usuario autenticado para adaptar:

- navegación;
- vistas disponibles;
- acciones permitidas;
- administración;
- cambios de estado.

Sin embargo, la autorización definitiva no depende únicamente del frontend.

Las restricciones de acceso se aplican también en:

- AWS API Gateway;
- BFF.

## Comunicación con la API

Las solicitudes del frontend se realizan mediante los servicios definidos en:

```text
src/services/
```

Estos servicios utilizan la URL configurada mediante:

```text
VITE_API_URL
```

El frontend no contiene direcciones privadas de EC2 ni credenciales de acceso a los microservicios.

## Estructura principal

```text
src/auth/        configuración de Microsoft Entra ID y MSAL
src/hooks/       lectura de autenticación y roles
src/pages/       vistas de acceso, solicitudes y catálogo
src/services/    cliente HTTP y adquisición del Access Token
```

## Creación de solicitudes

El flujo de creación es:

```text
Usuario
   ↓
NuevaSolicitud
   ↓
Consultar categorías disponibles
   ↓
GET /v1/solicitudes/categorias
   ↓
Seleccionar categoría
   ↓
POST /v1/solicitudes
   ↓
API Gateway
   ↓
BFF
   ↓
solicitudes-service
```

`solicitudes-service` valida que la categoría seleccionada exista en su réplica local antes de crear la solicitud.

## Administración del catálogo

Las funciones administrativas permiten trabajar con:

- categorías;
- prioridades.

Las operaciones se realizan mediante la API protegida y siguen el flujo:

```text
React
  ↓
API Gateway
  ↓
BFF
  ↓
catalogo-service
```

Cuando se crea una categoría, `catalogo-service` publica posteriormente el evento correspondiente en RabbitMQ.

## Consideraciones de seguridad

No se almacenan en el código ni en Git:

- Access Tokens;
- contraseñas;
- secretos de aplicaciones;
- credenciales AWS;
- claves privadas;
- archivos `.env` reales;
- credenciales de RabbitMQ;
- credenciales PostgreSQL.

El frontend utiliza los roles únicamente para adaptar la experiencia de usuario.

La seguridad efectiva se aplica en los componentes backend y en la infraestructura AWS.

## Integración EP2

En EP2, el frontend forma parte del flujo completo:

```text
Microsoft Entra ID
        ↓
      React
        ↓
  API Gateway
        ↓
       BFF
     ┌──┴──┐
     ↓     ↓
Solicitudes Catálogo
     ↓       ↓
RDS       RDS Catálogo
             ↓
          RabbitMQ
             ↓
        Solicitudes
```

La prueba final de integración debe comprobar que un usuario autenticado puede recorrer el flujo completo desde React hasta los microservicios desplegados en AWS.