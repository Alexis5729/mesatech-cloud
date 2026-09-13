package cl.mesatech.solicitudes.dto;

import java.time.OffsetDateTime;

// Formato de error simple acordado con el equipo para que el BFF pueda propagarlo.
public record ErrorResponse(
        int status,
        String message,
        OffsetDateTime timestamp
) {
}
