package cl.mesatech.bff.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CrearSolicitudRequest {

    @NotBlank(message = "El titulo es obligatorio")
    private String titulo;

    @NotBlank(message = "La descripción es obligatoria")
    private String descripcion;

    @NotNull(message = "La categoria es obligatoria")
    private Long categoriaId;

    @NotNull(message = "La prioridad es obligatoria")
    private Long prioridadId;
}
