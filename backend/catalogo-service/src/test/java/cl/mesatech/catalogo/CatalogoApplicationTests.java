package cl.mesatech.catalogo;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

// Verifica que Spring pueda construir y arrancar el contexto del catálogo.
@SpringBootTest
@ActiveProfiles("test")
class CatalogoApplicationTests {

    @Test
    void contextLoads() {
    }
}
