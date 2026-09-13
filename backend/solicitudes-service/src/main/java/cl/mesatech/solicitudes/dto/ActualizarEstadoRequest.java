package cl.mesatech.solicitudes.dto;

import cl.mesatech.solicitudes.entity.EstadoSolicitud;
import jakarta.validation.constraints.NotNull;

// Cuerpo mínimo para solicitar un cambio de estado.
public record ActualizarEstadoRequest(
        @NotNull(message = "El nuevo estado es obligatorio")
        EstadoSolicitud estado
) {
}
