package cl.mesatech.solicitudes.controller;

import cl.mesatech.solicitudes.dto.SolicitudV2Response;
import cl.mesatech.solicitudes.service.SolicitudService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

// Controlador separado para que la API v1 permanezca estable y sin cambios en su JSON.
@RestController
@RequestMapping("/v2/solicitudes")
public class SolicitudV2Controller {

    private final SolicitudService solicitudService;

    public SolicitudV2Controller(SolicitudService solicitudService) {
        this.solicitudService = solicitudService;
    }

    @GetMapping
    public List<SolicitudV2Response> listarTodas() {
        return solicitudService.listarTodasV2();
    }
}
