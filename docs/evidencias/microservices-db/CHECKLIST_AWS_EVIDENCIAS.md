# Checklist AWS y evidencias del Integrante 3

## Alcance exacto

El Integrante 3 debe desplegar y demostrar en Amazon EC2:

- `solicitudes-service` en el puerto `8081`.
- `catalogo-service` en el puerto `8082`.
- PostgreSQL con la base `mesatech` y sus esquemas.
- Persistencia real, reglas de estado y coexistencia v1/v2.

No corresponde al Integrante 3 configurar React, Microsoft Entra ID, JWT Authorizer, CORS o las rutas de API Gateway. La integración local y en EC2 con el BFF se valida junto con el Integrante 2, sin modificar su código sin coordinación.

## Alternativa acordada

Se utilizará PostgreSQL instalado en EC2, en lugar de RDS, porque es suficiente para la EP1 y reduce servicios adicionales. La pauta permite una sola instancia EC2 con puertos distintos.

Configuración sencilla recomendada para el equipo:

```text
EC2
├── BFF                 :8080  (Integrante 2)
├── solicitudes-service :8081  (Integrante 3)
├── catalogo-service    :8082  (Integrante 3)
└── PostgreSQL          :5432  (Integrante 3, acceso local)
```

Si todos los componentes están en la misma instancia, el BFF puede llamar a `localhost:8081` y `localhost:8082`, y PostgreSQL no necesita exponerse a Internet.

## Antes de entrar a AWS

- [ ] Alexis confirma si usarán una sola EC2 compartida.
- [ ] Alexis entrega al Integrante 3 acceso autorizado a la instancia o coordina la carga de los JAR.
- [ ] Los dos JAR están generados con `clean package`.
- [ ] La rama `damian/microservices-db` está actualizada y sin secretos.
- [ ] La contraseña débil usada localmente se reemplaza por una contraseña fuerte para EC2.
- [ ] Se acuerda dónde se guardarán las capturas: `docs/evidencias/microservices-db/aws/`.

## Configuración y capturas que sí corresponden

La pauta solicita un informe pormenorizado con capturas de cada paso de configuración cloud. Guardar las imágenes en orden y sin contraseñas visibles.

### 1. Instancia EC2

- [ ] Captura del nombre de la instancia, AMI, tipo de instancia y estado `Running`.
- [ ] Captura del resumen de la instancia con su identificador y dirección pública.
- [ ] Captura de la conexión SSH funcionando.
- [ ] Captura de `java -version` mostrando Java 17 o compatible.
- [ ] Captura de `psql --version` mostrando PostgreSQL instalado.

### 2. Seguridad de red

- [ ] Captura del Security Group utilizado por la EC2.
- [ ] Puerto `22` limitado a la IP de quienes administran la instancia.
- [ ] Puerto del BFF gestionado por el Integrante 2 según la integración con API Gateway.
- [ ] No publicar `5432` a `0.0.0.0/0` si PostgreSQL comparte la instancia.
- [ ] No publicar `8081` ni `8082` a Internet si el BFF los consume por `localhost`.

Si los microservicios se despliegan en otra instancia, permitir `8081` y `8082` solamente desde el Security Group o la IP privada de la instancia del BFF.

### 3. PostgreSQL en EC2

- [ ] Captura de instalación y servicio PostgreSQL activo.
- [ ] Captura de creación de la base `mesatech`.
- [ ] Captura de ejecución de `01_solicitudes.sql`.
- [ ] Captura de ejecución de `02_catalogo.sql`.
- [ ] Captura de `\dt` mostrando `solicitudes`, `categorias` y `prioridades`.
- [ ] Captura de una consulta que muestre datos, ocultando cualquier credencial.

### 4. Microservicios en EC2

- [ ] Captura de los JAR o del código desplegado en la instancia.
- [ ] Captura de las variables requeridas mostrando solo los nombres, nunca el valor de `DB_PASSWORD`.
- [ ] Captura de `solicitudes-service` iniciado en `8081` y conectado a PostgreSQL.
- [ ] Captura de `catalogo-service` iniciado en `8082` y conectado a PostgreSQL.
- [ ] Captura de procesos o servicios activos después del arranque.
- [ ] Captura de logs sin errores ni secretos.

Variables esperadas:

```text
DB_URL=jdbc:postgresql://localhost:5432/mesatech
DB_USERNAME=<usuario_ec2>
DB_PASSWORD=<secreto_no_visible>
SOLICITUDES_PORT=8081
CATALOGO_PORT=8082
JPA_DDL_AUTO=validate
```

Primero se ejecutan los scripts SQL y después se inicia con `JPA_DDL_AUTO=validate`, para comprobar que el esquema desplegado coincide con las entidades.

## Pruebas y capturas funcionales de tu parte

- [ ] Crear una categoría y una prioridad mediante `catalogo-service`.
- [ ] Crear una solicitud mediante `POST /v1/solicitudes` y `X-User-Id`.
- [ ] Consultar todas las solicitudes en `/v1/solicitudes`.
- [ ] Consultar las solicitudes del usuario en `/v1/solicitudes/mias`.
- [ ] Mostrar una transición válida.
- [ ] Intentar `CREADA -> RESUELTA` y capturar el rechazo HTTP `409`.
- [ ] Consultar `/v1/solicitudes` y `/v2/solicitudes`; mostrar que v2 agrega `diasAbierta` y v1 continúa funcionando.
- [ ] Consultar categorías y prioridades.
- [ ] Crear, modificar y eliminar un elemento de catálogo.
- [ ] Detener y volver a iniciar ambos microservicios.
- [ ] Consultar nuevamente y capturar que los datos permanecen.

Las pruebas directas pueden ejecutarse con `curl` desde la propia EC2. La prueba extremo a extremo mediante API Gateway y BFF se realiza en conjunto con los Integrantes 1 y 2.

## Integración con el BFF

- [ ] Entregar al Integrante 2 `CONTRATO_BFF.md`.
- [ ] Confirmar que el BFF envía `X-User-Id`.
- [ ] Confirmar que el BFF llama a `localhost:8081` y `localhost:8082`, o a las direcciones privadas acordadas.
- [ ] Probar una operación de solicitudes y una de catálogo a través del BFF.
- [ ] Confirmar que el BFF no contiene conexión a PostgreSQL.

## Nombres sugeridos para las capturas

```text
01-ec2-instancia-running.png
02-ec2-security-group.png
03-ssh-java-postgresql.png
04-postgresql-base-mesatech.png
05-postgresql-scripts-tablas.png
06-solicitudes-service-8081.png
07-catalogo-service-8082.png
08-crear-solicitud.png
09-transicion-invalida-409.png
10-catalogo-crud.png
11-versiones-v1-v2.png
12-persistencia-despues-reinicio.png
13-integracion-bff-microservicios.png
```

## Cómo usar las capturas en la entrega

- En el informe pormenorizado se incluyen las capturas de cada paso de configuración AWS que se haya realizado, acompañadas por una explicación breve.
- En la presentación se utiliza solamente un resumen de las capturas más importantes; la pauta indica que no se debe ejecutar la aplicación en vivo durante la exposición.
- El equipo debe quedar preparado para iniciar los servicios y demostrar la aplicación si el docente lo solicita durante las preguntas.
- Las capturas de React, Entra ID, API Gateway y seguridad las aportan los Integrantes 1 y 2; tú aportas las de EC2, microservicios, PostgreSQL y pruebas de negocio/persistencia.

## No incluir en capturas o Git

- Contraseñas de PostgreSQL.
- Archivo de llave privada `.pem`.
- Variables con secretos visibles.
- Tokens JWT completos.
- Client secrets o credenciales de AWS.
- Connection strings que incluyan contraseñas.

## Criterio de terminado del Integrante 3

- [ ] Ambos microservicios funcionan en EC2.
- [ ] PostgreSQL funciona en EC2 y solo los microservicios acceden a sus datos.
- [ ] La regla `RESUELTA` solo desde `EN_PROCESO` queda demostrada.
- [ ] v1 y v2 coexisten.
- [ ] Los datos continúan después de reiniciar los procesos.
- [ ] El BFF puede llamar a ambos microservicios.
- [ ] Las capturas están ordenadas y no muestran secretos.
- [ ] El informe del equipo incluye una explicación breve de esta parte.
