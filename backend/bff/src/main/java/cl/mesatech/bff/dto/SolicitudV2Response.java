package cl.mesatech.bff.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;

@Getter
@Setter
public class SolicitudV2Response {

    private Long id;
    private String titulo;
    private String descripcion;
    private Long categoriaId;
    private Long prioridadId;
    private String usuarioSolicitante;
    private String estado;
    private OffsetDateTime fechaCreacion;
    private long diasAbierta;


}
