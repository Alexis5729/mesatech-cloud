package cl.mesatech.solicitudes.messaging;

import java.time.Instant;

public record CategoriaCreadaEvent(
        String eventId,
        String tipoEvento,
        Instant fechaEvento,
        Long categoriaId,
        String nombre
) {
}
