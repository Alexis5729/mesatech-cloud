package cl.mesatech.catalogo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

// Datos aceptados al crear o modificar una prioridad.
public record PrioridadRequest(
        @NotBlank(message = "El nombre de la prioridad es obligatorio")
        @Size(max = 50, message = "El nombre de la prioridad no puede superar 50 caracteres")
        String nombre,

        @NotNull(message = "El nivel de la prioridad es obligatorio")
        @Positive(message = "El nivel de la prioridad debe ser positivo")
        Integer nivel
) {
}
