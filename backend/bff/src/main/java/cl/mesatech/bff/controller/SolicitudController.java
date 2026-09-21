package cl.mesatech.bff.controller;

import cl.mesatech.bff.client.SolicitudClient;
import cl.mesatech.bff.dto.ActualizarEstadoRequest;
import cl.mesatech.bff.dto.CrearSolicitudRequest;
import cl.mesatech.bff.dto.SolicitudResponse;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/solicitudes")
public class SolicitudController {

    private final SolicitudClient solicitudClient;

    public SolicitudController(SolicitudClient solicitudClient) {
        this.solicitudClient = solicitudClient;
    }

    @GetMapping
    public SolicitudResponse[] obtenerSolicitudes(){
        return solicitudClient.obtenerSolicitudes();
    }

    @GetMapping("/mias")
    public SolicitudResponse[] obtenerMisSolicitudes(
            @AuthenticationPrincipal Jwt jwt){
        String userId = jwt.getClaimAsString("oid");

        return solicitudClient.obtenerMisSolicitudes(userId);
    }

    @PostMapping
    public SolicitudResponse crearSolicitud(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody CrearSolicitudRequest request){
        String userId = jwt.getClaimAsString("oid");

        return solicitudClient.crearSolicitud(userId, request);
    }

    @PatchMapping("/{id}/estado")
    public SolicitudResponse actualizarEstado(




            @PathVariable Long id,
            @Valid @RequestBody ActualizarEstadoRequest request){

        return solicitudClient.actualizarEstado(id, request);
    }
}
