package cl.mesatech.solicitudes.controller;

import cl.mesatech.solicitudes.dto.ActualizarEstadoRequest;
import cl.mesatech.solicitudes.dto.CrearSolicitudRequest;
import cl.mesatech.solicitudes.dto.SolicitudResponse;
import cl.mesatech.solicitudes.service.SolicitudService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

// Endpoints v1 que consumirá el BFF del Integrante 2.
@RestController
@RequestMapping("/v1/solicitudes")
public class SolicitudController {

    private final SolicitudService solicitudService;

    public SolicitudController(SolicitudService solicitudService) {
        this.solicitudService = solicitudService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SolicitudResponse crear(
            @Valid @RequestBody CrearSolicitudRequest request,
            @RequestHeader("X-User-Id") String usuarioId) {
        return solicitudService.crear(request, usuarioId);
    }

    @GetMapping("/mias")
    public List<SolicitudResponse> listarMias(@RequestHeader("X-User-Id") String usuarioId) {
        return solicitudService.listarDelUsuario(usuarioId);
    }

    @GetMapping
    public List<SolicitudResponse> listarTodas() {
        return solicitudService.listarTodas();
    }

    @PatchMapping("/{id}/estado")
    public SolicitudResponse actualizarEstado(
            @PathVariable Long id,
            @Valid @RequestBody ActualizarEstadoRequest request) {
        return solicitudService.actualizarEstado(id, request);
    }
}
