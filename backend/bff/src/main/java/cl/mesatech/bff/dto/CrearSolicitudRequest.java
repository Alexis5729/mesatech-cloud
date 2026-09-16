package cl.mesatech.bff.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CrearSolicitudRequest {

    private String titulo;
    private String descripcion;
    private Long categoriaId;
    private Long prioridadId;
}
