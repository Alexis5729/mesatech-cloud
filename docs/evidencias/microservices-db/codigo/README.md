# Evidencias de código del Integrante 3

Estas capturas complementan las evidencias de AWS existentes. Fueron generadas a partir de los archivos reales de la rama `damian/microservices-db` el 14-09-2026.

No contienen contraseñas ni reemplazan las evidencias previas.

## Contenido

1. `01-versionamiento-estructura.png`: rama, commits y estructura asignada al Integrante 3.
2. `02-configuracion-servicios.png`: puertos 8081/8082 y conexión PostgreSQL mediante variables de entorno.
3. `03-esquemas-postgresql.png`: scripts SQL de solicitudes, categorías y prioridades.
4. `04-endpoints-solicitudes.png`: endpoints mínimos y uso del header `X-User-Id`.
5. `05-reglas-estado.png`: estados permitidos y rechazo de transiciones inválidas.
6. `06-versionamiento-v1-v2.png`: coexistencia de v1 y v2 con el campo `diasAbierta` solo en v2.
7. `07-catalogo-crud.png`: consulta, creación, modificación y eliminación del catálogo.
8. `08-pruebas-solicitudes.png`: persistencia, filtro por usuario, estados y versiones.
9. `09-pruebas-catalogo.png`: CRUD funcional de categorías y prioridades.
10. `10-resultados-build.png`: `clean package` exitoso y uso de H2 únicamente para pruebas.

## Resultado validado

- `solicitudes-service`: 8 pruebas, 0 fallos y `BUILD SUCCESS`.
- `catalogo-service`: 5 pruebas, 0 fallos y `BUILD SUCCESS`.
- Total: 13 pruebas automáticas aprobadas.
