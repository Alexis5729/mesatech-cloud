# Frontend MesaTech Cloud

Aplicación web desarrollada con React y Vite. Gestiona el inicio de sesión mediante Microsoft Entra ID y consume la API protegida a través de AWS API Gateway.

## Funcionalidades

- Inicio y cierre de sesión con MSAL.
- Consulta de solicitudes según el rol del usuario.
- Creación de solicitudes utilizando categorías y prioridades del catálogo.
- Actualización del estado de las solicitudes para los roles autorizados.
- Administración de categorías y prioridades.
- Envío del Access Token en las solicitudes dirigidas a la API.

## Configuración

La dirección de API Gateway se define en un archivo `.env` local:

```dotenv
VITE_API_URL=https://<api-id>.execute-api.<region>.amazonaws.com
```

El archivo `.env` permanece fuera del repositorio. `.env.example` conserva únicamente la referencia de configuración requerida por el proyecto.

## Ejecución local

```powershell
npm install
npm run dev
```

La aplicación queda disponible de forma predeterminada en `http://localhost:5173`.

## Verificación

```powershell
npm run lint
npm run build
```

La compilación genera los archivos de distribución en `frontend/dist/`.

## Estructura principal

```text
src/auth/        configuración de Microsoft Entra ID y MSAL
src/hooks/       lectura de roles del usuario autenticado
src/pages/       vistas de acceso, solicitudes y catálogo
src/services/    cliente HTTP y adquisición del Access Token
```

## Consideraciones de seguridad

Las credenciales, tokens y datos de usuarios de prueba no se almacenan en el código ni se incorporan a las evidencias. La autorización definitiva se aplica en API Gateway y en el BFF; la interfaz utiliza los roles para adaptar la navegación y las acciones disponibles.
