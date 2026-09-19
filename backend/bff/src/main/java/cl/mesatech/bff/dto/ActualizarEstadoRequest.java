package cl.mesatech.bff.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ActualizarEstadoRequest {

    @NotBlank(message = "El estado es obligatorio")
    private String estado;
}
