# Contrato de integración EP2

## Estado

Contrato definitivo de integración entre `catalogo-service`, RabbitMQ y `solicitudes-service` para la EP2 de MesaTech Cloud.

El publisher de Catálogo se encuentra implementado y probado. El consumidor de Solicitudes se implementa respetando este contrato.

Cualquier cambio posterior en nombres, tipos, rutas o recursos RabbitMQ debe actualizarse en este documento y comunicarse antes de integrar las ramas.

---

# RabbitMQ

| Elemento         | Valor                                                                     |
|------------------|---------------------------------------------------------------------------|
| Virtual host     | `mesatech`                                                                |
| Exchange         | `catalogo.exchange`                                                       |
| Tipo de exchange | `direct`                                                                  |
| Exchange durable | Sí                                                                        |
| Cola             | `solicitudes.catalogo.queue`                                              |
| Cola durable     | Sí                                                                        |
| Auto delete      | No                                                                        |
| Routing key      | `categoria.creada`                                                        |
| Binding          | `catalogo.exchange` + `categoria.creada` → `solicitudes.catalogo.queue`   |

Los recursos RabbitMQ se despliegan mediante Docker Compose en una EC2 independiente.

Las aplicaciones utilizan cuentas separadas y no administradoras.

### Publisher

```text
mesatech_publicador
```

Utilizado por:

```text
catalogo-service
```

### Consumer

```text
mesatech_consumidor
```

Utilizado por:

```text
solicitudes-service
```

No se utiliza el usuario `guest` para conexiones remotas.

Las credenciales reales se externalizan y no se almacenan en Git.

---

# Evento de categoría creada

Cuando se crea correctamente una nueva categoría, `catalogo-service` publica un evento JSON.

Content type:

```text
application/json
```

Codificación:

```text
UTF-8
```

El mensaje se publica utilizando:

```text
Delivery Mode: PERSISTENT
```

Ejemplo:

```json
{
  "eventId": "9bd0f9a2-e594-462b-8d26-623af6240101",
  "tipoEvento": "categoria.creada",
  "fechaEvento": "2026-10-29T15:00:00Z",
  "categoriaId": 42,
  "nombre": "Redes EP2"
}
```

| Campo         | Tipo Java | Regla                                                  |
|---------------|-----------|--------------------------------------------------------|
| `eventId`     | `String`  | Identificador único generado una vez por publicación   |
| `tipoEvento`  | `String`  | Valor fijo `categoria.creada`                          |
| `fechaEvento` | `Instant` | Fecha y hora en formato ISO 8601                       |
| `categoriaId` | `Long`    | ID original almacenado en RDS Catálogo                 |
| `nombre`      | `String`  | Nombre validado y persistido de la categoría           |

El campo `categoriaId` debe conservarse en Solicitudes.

No debe reemplazarse por un identificador autogenerado que elimine la referencia al registro original de Catálogo.

---

# Flujo del publisher

El publisher corresponde a `catalogo-service`.

El flujo implementado es:

```text
1. Recibir la petición HTTP.
2. Validar los datos.
3. Guardar la categoría en RDS Catálogo.
4. Construir CategoriaCreadaEvent.
5. Publicar el evento en catalogo.exchange.
6. Utilizar routing key categoria.creada.
7. Publicar el mensaje como PERSISTENT.
8. Esperar Publisher Confirm.
9. Comprobar mensajes retornados por ausencia de una ruta válida.
```

El publisher utiliza:

```text
Publisher confirms
Publisher returns
Mandatory = true
```

La confirmación del broker demuestra que RabbitMQ aceptó la publicación.

No demuestra que `solicitudes-service` haya procesado o persistido todavía la categoría.

---

# Fallo de publicación

El guardado en PostgreSQL y la publicación en RabbitMQ son operaciones separadas.

Por lo tanto puede ocurrir:

```text
RDS Catálogo guarda correctamente
        ↓
RabbitMQ falla
        ↓
la categoría permanece en Catálogo
```

No se implementa rollback automático entre PostgreSQL y RabbitMQ.

Si la categoría ya fue guardada pero RabbitMQ no confirma correctamente la publicación, `catalogo-service` devuelve:

```text
HTTP 502 Bad Gateway
```

Formato actual de la respuesta:

```json
{
  "status": 502,
  "message": "La categoría fue guardada, pero no se pudo confirmar la publicación en RabbitMQ",
  "timestamp": "2026-11-01T00:00:00Z"
}
```

El valor exacto de `timestamp` depende del momento en que se produce el error.

Este comportamiento permite demostrar en la prueba P7 que la persistencia y la publicación no forman una única transacción distribuida.

---

# Flujo del consumidor

El consumidor corresponde a `solicitudes-service`.

Debe:

```text
1. Escuchar solicitudes.catalogo.queue.
2. Deserializar CategoriaCreadaEvent.
3. Validar el evento recibido.
4. Guardar la categoría en RDS Solicitudes.
5. Finalizar correctamente el listener después de persistir.
6. Permitir entonces la confirmación del procesamiento.
```

La categoría debe almacenarse en una tabla local de Solicitudes.

El consumidor debe conservar como mínimo:

```text
categoriaId
nombre
```

También puede conservar datos del evento como:

```text
eventId
fechaEvento
```

para mejorar la trazabilidad.

El consumidor no debe consultar el RDS de Catálogo para demostrar el procesamiento del evento.

---

# Confirmación del consumidor

Se admite el modo AUTO de Spring AMQP utilizado en el laboratorio.

Para que este comportamiento sea válido:

- el listener debe guardar primero en RDS Solicitudes;
- debe retornar correctamente solo después de persistir;
- los errores de persistencia deben propagarse;
- no se debe afirmar procesamiento exactamente una vez.

La confirmación del publisher y la confirmación del consumidor representan momentos distintos.

```text
Publisher Confirm
= RabbitMQ aceptó el mensaje.

ACK del consumidor
= el consumidor terminó correctamente su procesamiento.
```

---

# Endpoint de categorías locales

`solicitudes-service` debe permitir consultar las categorías recibidas desde RabbitMQ mediante:

```text
GET /v1/solicitudes/categorias
```

El endpoint debe permanecer protegido por el flujo de seguridad heredado de la EP1.

Roles contemplados:

- `CLIENTE`
- `OPERADOR`
- `ADMINISTRADOR`

Ejemplo de respuesta:

```json
[
  {
    "id": 42,
    "nombre": "Redes EP2"
  }
]
```

Si todavía no existen categorías recibidas:

```json
[]
```

con:

```text
HTTP 200 OK
```

---

# Uso desde el frontend

El frontend no debe consultar directamente el microservicio Catálogo para llenar el selector de categorías al crear una solicitud.

El flujo esperado es:

```text
React
  ↓
API Gateway
  ↓
BFF
  ↓
solicitudes-service
  ↓
categorías locales recibidas desde RabbitMQ
```

Esto permite demostrar que la información fue realmente transferida y persistida mediante mensajería.

---

# Validación al crear una solicitud

Cuando se ejecute:

```text
POST /v1/solicitudes
```

el `categoriaId` utilizado debe existir en la copia local almacenada por `solicitudes-service`.

Si la categoría todavía no ha sido recibida desde RabbitMQ, la solicitud no debe crearse y el servicio debe responder de manera controlada.

Las prioridades mantienen el comportamiento existente de la EP1.

---

# Datos iniciales

Las categorías creadas directamente mediante SQL en RDS Catálogo no producen eventos RabbitMQ.

Por esta razón, las pruebas P2, P3, P4 y P5 deben utilizar categorías nuevas creadas mediante el flujo de la aplicación.

Los datos insertados manualmente pueden utilizarse durante desarrollo o pruebas aisladas, pero no reemplazan la evidencia del flujo final.

---

# Infraestructura final AWS

La infraestructura final utilizada para la evaluación se concentra en el entorno AWS administrado por Damián.

Debe existir:

```text
EC2 Catálogo
EC2 Solicitudes
EC2 RabbitMQ

RDS Catálogo
RDS Solicitudes
```

Los dos microservicios deben ejecutarse en EC2 diferentes.

Cada microservicio debe utilizar una instancia RDS exclusiva.

RabbitMQ debe ejecutarse en una tercera EC2 independiente.

El BFF puede compartir infraestructura según lo permitido por la pauta, pero no accede directamente a ningún RDS.

---

# Responsabilidades

## Alexis

Responsable principalmente de:

- integración RabbitMQ en `catalogo-service`;
- `CategoriaCreadaEvent`;
- `CategoriaPublisher`;
- mensajes persistentes;
- Publisher Confirms;
- Publisher Returns;
- detección de ausencia de ruta;
- manejo controlado mediante HTTP `502`;
- Docker Compose de RabbitMQ;
- contrato de mensajería;
- documentación RabbitMQ;
- frontend React;
- participación en pruebas de integración y evidencias.

El publisher ha sido probado localmente en los siguientes escenarios:

```text
Publicación correcta → HTTP 201
RabbitMQ detenido → HTTP 502
Binding inexistente / NO_ROUTE → HTTP 502
```

En los escenarios de error se comprobó que la categoría podía permanecer persistida en PostgreSQL.

Las pruebas oficiales finales deben repetirse sobre la infraestructura AWS utilizada para la evaluación.

---

## Damián

Responsable principalmente de:

- infraestructura AWS final;
- EC2 Catálogo;
- EC2 Solicitudes;
- EC2 RabbitMQ;
- RDS Catálogo;
- RDS Solicitudes;
- Security Groups y conectividad;
- despliegue de los servicios en AWS;
- configuración final de RabbitMQ en AWS;
- implementación del consumidor en `solicitudes-service`;
- persistencia de categorías locales;
- endpoint de categorías locales;
- validación de categorías al crear solicitudes;
- integración con BFF;
- participación en pruebas de integración y evidencias.

---

# Responsabilidades compartidas

Alexis y Damián deben ejecutar conjuntamente:

- integración final Catálogo → RabbitMQ → Solicitudes;
- pruebas P1 a P8;
- revisión de evidencias;
- informe técnico;
- diagrama final;
- presentación;
- preparación de la defensa individual.

Cada integrante debe ser capaz de explicar tanto el publisher como el consumer y la infraestructura completa.

---

# Contrato final RabbitMQ

```text
Virtual host:
mesatech

Publisher:
mesatech_publicador

Consumer:
mesatech_consumidor

Exchange:
catalogo.exchange

Exchange type:
direct

Exchange durable:
sí

Queue:
solicitudes.catalogo.queue

Queue durable:
sí

Auto delete:
no

Routing key:
categoria.creada

Binding:
catalogo.exchange
+ categoria.creada
→ solicitudes.catalogo.queue
```

---

# Estado de implementación

## Completado

- contrato del evento;
- Docker Compose RabbitMQ;
- volumen persistente;
- publisher Catálogo;
- mensaje PERSISTENT;
- Publisher Confirm;
- Publisher Returns;
- `mandatory=true`;
- manejo de error HTTP `502`;
- prueba local de publicación correcta;
- prueba local con RabbitMQ detenido;
- prueba local de NO_ROUTE;
- credenciales externalizadas.

## Pendiente de integración final

- consumidor en `solicitudes-service`;
- categorías locales en RDS Solicitudes;
- endpoint de categorías locales;
- validación al crear solicitudes;
- despliegue conjunto definitivo;
- ejecución oficial de P1 a P8;
- evidencias finales.

---

# Cierre del contrato

Los nombres y estructuras definidos en este documento se consideran el contrato definitivo para la integración EP2.

Cualquier modificación debe ser acordada por ambos integrantes y reflejada tanto en el código como en esta documentación.