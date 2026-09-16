package cl.mesatech.bff.controller;

import cl.mesatech.bff.client.SolicitudClient;
import cl.mesatech.bff.dto.CrearSolicitudRequest;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/solicitudes")
public class SoliciudController {

    private final SolicitudClient solicitudClient;

    public SoliciudController(SolicitudClient solicitudClient) {
        this.solicitudClient = solicitudClient;
    }

    @GetMapping
    public String obtenerSolicitudes(){
        return "Listado de solicitudes";
    }

    @GetMapping("/mias")
    public String obtenerMisSolicitudes(){
        return "Mis solicitudes";
    }

    @PostMapping
    public String crearSolicitud(@RequestBody CrearSolicitudRequest request){
        return solicitudClient.crearSolicitud(request);
    }
}
