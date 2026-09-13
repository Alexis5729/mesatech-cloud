package cl.mesatech.solicitudes;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

// Comprueba que Spring puede construir y arrancar el contexto completo del microservicio.
@SpringBootTest
@ActiveProfiles("test")
class SolicitudesApplicationTests {

    @Test
    void contextLoads() {
    }
}
