package cl.mesatech.solicitudes;

import cl.mesatech.solicitudes.entity.EstadoSolicitud;
import cl.mesatech.solicitudes.repository.SolicitudRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// Pruebas funcionales de la API y de las reglas obligatorias de la EP1.
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SolicitudControllerIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private SolicitudRepository solicitudRepository;

    @BeforeEach
    void limpiarBaseDePrueba() {
        solicitudRepository.deleteAll();
    }

    @Test
    void creaYVuelveAConsultarLaSolicitudPersistida() throws Exception {
        crearSolicitud("usuario-1", "No funciona el correo");

        mockMvc.perform(get("/v1/solicitudes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].titulo").value("No funciona el correo"))
                .andExpect(jsonPath("$[0].usuarioSolicitante").value("usuario-1"))
                .andExpect(jsonPath("$[0].estado").value("CREADA"))
                .andExpect(jsonPath("$[0].fechaCreacion").exists());
    }

    @Test
    void consultaSoloLasSolicitudesDelUsuarioDelHeader() throws Exception {
        crearSolicitud("usuario-1", "Solicitud de usuario uno");
        crearSolicitud("usuario-2", "Solicitud de usuario dos");

        mockMvc.perform(get("/v1/solicitudes/mias")
                        .header("X-User-Id", "usuario-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].usuarioSolicitante").value("usuario-1"));
    }

    @Test
    void permiteRecorrerLaSecuenciaValidaHastaCerrada() throws Exception {
        Long id = crearSolicitud("usuario-1", "Solicitud con flujo completo");

        cambiarEstado(id, EstadoSolicitud.ASIGNADA, 200);
        cambiarEstado(id, EstadoSolicitud.EN_PROCESO, 200);
        cambiarEstado(id, EstadoSolicitud.RESUELTA, 200);
        cambiarEstado(id, EstadoSolicitud.CERRADA, 200);

        mockMvc.perform(get("/v1/solicitudes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].estado").value("CERRADA"));
    }

    @Test
    void impideResolverSiLaSolicitudNoEstaEnProceso() throws Exception {
        Long id = crearSolicitud("usuario-1", "Intento de transición inválida");

        cambiarEstado(id, EstadoSolicitud.RESUELTA, 409);

        mockMvc.perform(get("/v1/solicitudes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].estado").value("CREADA"));
    }

    @Test
    void permiteCancelarDesdeCreada() throws Exception {
        Long id = crearSolicitud("usuario-1", "Solicitud cancelable");

        cambiarEstado(id, EstadoSolicitud.CANCELADA, 200);

        mockMvc.perform(get("/v1/solicitudes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].estado").value("CANCELADA"));
    }

    @Test
    void devuelveErrorSimpleCuandoFaltaElUsuario() throws Exception {
        mockMvc.perform(post("/v1/solicitudes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(cuerpoSolicitud("Sin usuario")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Falta el header obligatorio X-User-Id"))
                .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    void mantieneV1YV2FuncionandoSimultaneamente() throws Exception {
        crearSolicitud("usuario-versiones", "Solicitud para comparar versiones");

        mockMvc.perform(get("/v1/solicitudes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].titulo").value("Solicitud para comparar versiones"))
                .andExpect(jsonPath("$[0].diasAbierta").doesNotExist());

        mockMvc.perform(get("/v2/solicitudes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].titulo").value("Solicitud para comparar versiones"))
                .andExpect(jsonPath("$[0].diasAbierta").isNumber());
    }

    private Long crearSolicitud(String usuarioId, String titulo) throws Exception {
        mockMvc.perform(post("/v1/solicitudes")
                        .header("X-User-Id", usuarioId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(cuerpoSolicitud(titulo)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.estado").value("CREADA"));

        // Se obtiene el último id persistido sin depender de una librería JSON adicional.
        return solicitudRepository.findAll().stream()
                .mapToLong(solicitud -> solicitud.getId())
                .max()
                .orElseThrow();
    }

    private void cambiarEstado(Long id, EstadoSolicitud estado, int statusEsperado) throws Exception {
        mockMvc.perform(patch("/v1/solicitudes/{id}/estado", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"estado\":\"" + estado + "\"}"))
                .andExpect(status().is(statusEsperado));
    }

    private String cuerpoSolicitud(String titulo) {
        return """
                {
                  "titulo": "%s",
                  "descripcion": "Descripción usada por la prueba funcional",
                  "categoriaId": 1,
                  "prioridadId": 2
                }
                """.formatted(titulo);
    }
}
