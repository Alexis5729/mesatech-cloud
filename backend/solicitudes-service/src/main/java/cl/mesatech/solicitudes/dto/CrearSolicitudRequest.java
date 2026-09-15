package cl.mesatech.solicitudes.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

// El usuario no viene en el cuerpo: se recibe desde el BFF mediante X-User-Id.
public record CrearSolicitudRequest(
        @NotBlank(message = "El título es obligatorio")
        @Size(max = 150, message = "El título no puede superar 150 caracteres")
        String titulo,

        @NotBlank(message = "La descripción es obligatoria")
        @Size(max = 4000, message = "La descripción no puede superar 4000 caracteres")
        String descripcion,

        @NotNull(message = "La categoría es obligatoria")
        @Positive(message = "La categoría debe ser un identificador positivo")
        Long categoriaId,

        @NotNull(message = "La prioridad es obligatoria")
        @Positive(message = "La prioridad debe ser un identificador positivo")
        Long prioridadId
) {
}
