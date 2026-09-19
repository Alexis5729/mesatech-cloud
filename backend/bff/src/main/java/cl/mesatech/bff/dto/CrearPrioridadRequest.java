package cl.mesatech.bff.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CrearPrioridadRequest {

    @NotBlank(message = "El nombre de la prioridad es obligatorio")
    private String nombre;

    @NotNull(message = "El nivel de prioridad es obligatorio")
    private Integer nivel;
}
