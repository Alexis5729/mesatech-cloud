package cl.mesatech.solicitudes.dto;

import cl.mesatech.solicitudes.entity.EstadoSolicitud;

import java.time.OffsetDateTime;

// La respuesta v2 conserva todos los campos de v1 y agrega diasAbierta.
public record SolicitudV2Response(
        Long id,
        String titulo,
        String descripcion,
        Long categoriaId,
        Long prioridadId,
        String usuarioSolicitante,
        EstadoSolicitud estado,
        OffsetDateTime fechaCreacion,
        long diasAbierta
) {
}
