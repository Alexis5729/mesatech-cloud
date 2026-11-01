package cl.mesatech.catalogo.messaging;

import java.time.Instant;

public record CategoriaCreadaEvent(
        String eventId,
        String tipoEvento,
        Instant fechaEvento,
        Long categoriaId,
        String nombre
) {
}