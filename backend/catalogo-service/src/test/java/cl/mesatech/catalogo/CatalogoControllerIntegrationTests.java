package cl.mesatech.catalogo;

import cl.mesatech.catalogo.repository.CategoriaRepository;
import cl.mesatech.catalogo.repository.PrioridadRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// Pruebas funcionales del CRUD solicitado por la pauta.
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CatalogoControllerIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private PrioridadRepository prioridadRepository;

    @BeforeEach
    void limpiarBaseDePrueba() {
        categoriaRepository.deleteAll();
        prioridadRepository.deleteAll();
    }

    @Test
    void creaConsultaModificaYEliminaUnaCategoria() throws Exception {
        mockMvc.perform(post("/v1/catalogo/categorias")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nombre\":\"Hardware\",\"descripcion\":\"Equipos y periféricos\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nombre").value("Hardware"));

        Long id = categoriaRepository.findAll().get(0).getId();

        mockMvc.perform(get("/v1/catalogo/categorias"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].descripcion").value("Equipos y periféricos"));

        mockMvc.perform(put("/v1/catalogo/categorias/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nombre\":\"Hardware TI\",\"descripcion\":\"Equipos tecnológicos\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value("Hardware TI"));

        mockMvc.perform(delete("/v1/catalogo/categorias/{id}", id))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/v1/catalogo/categorias"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void creaConsultaModificaYEliminaUnaPrioridad() throws Exception {
        mockMvc.perform(post("/v1/catalogo/prioridades")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nombre\":\"Alta\",\"nivel\":3}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nivel").value(3));

        Long id = prioridadRepository.findAll().get(0).getId();

        mockMvc.perform(get("/v1/catalogo/prioridades"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].nombre").value("Alta"));

        mockMvc.perform(put("/v1/catalogo/prioridades/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nombre\":\"Crítica\",\"nivel\":4}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value("Crítica"))
                .andExpect(jsonPath("$.nivel").value(4));

        mockMvc.perform(delete("/v1/catalogo/prioridades/{id}", id))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/v1/catalogo/prioridades"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void rechazaUnaCategoriaConNombreDuplicado() throws Exception {
        crearCategoria("Software");

        mockMvc.perform(post("/v1/catalogo/categorias")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nombre\":\"software\",\"descripcion\":\"Duplicada\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message").exists())
                .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    void validaQueElNivelDePrioridadSeaPositivo() throws Exception {
        mockMvc.perform(post("/v1/catalogo/prioridades")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nombre\":\"Inválida\",\"nivel\":0}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    private void crearCategoria(String nombre) throws Exception {
        mockMvc.perform(post("/v1/catalogo/categorias")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nombre\":\"" + nombre + "\",\"descripcion\":\"Categoría de prueba\"}"))
                .andExpect(status().isCreated());
    }
}
