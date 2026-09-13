package cl.mesatech.solicitudes.dto;

import cl.mesatech.solicitudes.entity.EstadoSolicitud;

import java.time.OffsetDateTime;

// Contrato de salida de la API v1.
public record SolicitudResponse(
        Long id,
        String titulo,
        String descripcion,
        Long categoriaId,
        Long prioridadId,
        String usuarioSolicitante,
        EstadoSolicitud estado,
        OffsetDateTime fechaCreacion
) {
}
