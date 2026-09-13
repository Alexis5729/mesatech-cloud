package cl.mesatech.solicitudes.service;

import cl.mesatech.solicitudes.dto.ActualizarEstadoRequest;
import cl.mesatech.solicitudes.dto.CrearSolicitudRequest;
import cl.mesatech.solicitudes.dto.SolicitudResponse;
import cl.mesatech.solicitudes.entity.EstadoSolicitud;
import cl.mesatech.solicitudes.entity.Solicitud;
import cl.mesatech.solicitudes.exception.SolicitudInvalidaException;
import cl.mesatech.solicitudes.exception.SolicitudNoEncontradaException;
import cl.mesatech.solicitudes.exception.TransicionEstadoInvalidaException;
import cl.mesatech.solicitudes.repository.SolicitudRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

// Contiene la lógica del negocio; el controlador solo recibe y devuelve datos HTTP.
@Service
@Transactional(readOnly = true)
public class SolicitudService {

    private final SolicitudRepository solicitudRepository;

    public SolicitudService(SolicitudRepository solicitudRepository) {
        this.solicitudRepository = solicitudRepository;
    }

    @Transactional
    public SolicitudResponse crear(CrearSolicitudRequest request, String usuarioId) {
        String usuarioNormalizado = validarUsuario(usuarioId);

        Solicitud solicitud = new Solicitud(
                request.titulo().trim(),
                request.descripcion().trim(),
                request.categoriaId(),
                request.prioridadId(),
                usuarioNormalizado
        );

        return convertir(solicitudRepository.save(solicitud));
    }

    public List<SolicitudResponse> listarTodas() {
        // El orden descendente entrega primero las solicitudes más recientes.
        return solicitudRepository.findAll(Sort.by(Sort.Direction.DESC, "fechaCreacion")).stream()
                .map(this::convertir)
                .toList();
    }

    public List<SolicitudResponse> listarDelUsuario(String usuarioId) {
        String usuarioNormalizado = validarUsuario(usuarioId);
        return solicitudRepository
                .findByUsuarioSolicitanteOrderByFechaCreacionDesc(usuarioNormalizado)
                .stream()
                .map(this::convertir)
                .toList();
    }

    @Transactional
    public SolicitudResponse actualizarEstado(Long id, ActualizarEstadoRequest request) {
        Solicitud solicitud = solicitudRepository.findById(id)
                .orElseThrow(() -> new SolicitudNoEncontradaException(id));

        EstadoSolicitud nuevoEstado = request.estado();

        // Esta validación garantiza, entre otras reglas, que CREADA no pueda pasar directo a RESUELTA.
        if (!solicitud.getEstado().puedeCambiarA(nuevoEstado)) {
            throw new TransicionEstadoInvalidaException(solicitud.getEstado(), nuevoEstado);
        }

        solicitud.cambiarEstado(nuevoEstado);
        return convertir(solicitudRepository.save(solicitud));
    }

    private String validarUsuario(String usuarioId) {
        if (usuarioId == null || usuarioId.isBlank()) {
            throw new SolicitudInvalidaException("X-User-Id no puede estar vacío");
        }
        return usuarioId.trim();
    }

    private SolicitudResponse convertir(Solicitud solicitud) {
        return new SolicitudResponse(
                solicitud.getId(),
                solicitud.getTitulo(),
                solicitud.getDescripcion(),
                solicitud.getCategoriaId(),
                solicitud.getPrioridadId(),
                solicitud.getUsuarioSolicitante(),
                solicitud.getEstado(),
                solicitud.getFechaCreacion()
        );
    }
}
