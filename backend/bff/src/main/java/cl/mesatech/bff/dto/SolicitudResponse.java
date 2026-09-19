package cl.mesatech.bff.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class SolicitudResponse {

    private Long id;
    private String titulo;
    private String descripcion;
    private Long categoriaId;
    private Long prioridadId;
    private String usuarioSolicitante;
    private String estado;
    private Instant fechaCreacion;
}
