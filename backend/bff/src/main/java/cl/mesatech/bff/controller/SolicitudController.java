package cl.mesatech.bff.controller;

import cl.mesatech.bff.client.SolicitudClient;
import cl.mesatech.bff.dto.ActualizarEstadoRequest;
import cl.mesatech.bff.dto.CrearSolicitudRequest;
import cl.mesatech.bff.dto.SolicitudResponse;
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
            @RequestHeader("X-User-Id") String userId){
        return solicitudClient.obtenerMisSolicitudes(userId);
    }

    @PostMapping
    public SolicitudResponse crearSolicitud(
            @RequestHeader("X-User-Id") String userId,
            @RequestBody CrearSolicitudRequest request){

        return solicitudClient.crearSolicitud(userId, request);
    }

    @PatchMapping("/{id}/estado")
    public SolicitudResponse actualizarEstado(
            @PathVariable Long id,
            @RequestBody ActualizarEstadoRequest request){
        return solicitudClient.actualizarEstado(id, request);
    }
}
