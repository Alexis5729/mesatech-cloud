package cl.mesatech.catalogo.dto;

import java.time.OffsetDateTime;

// Formato de error simple compartido con solicitudes-service.
public record ErrorResponse(
        int status,
        String message,
        OffsetDateTime timestamp
) {
}
