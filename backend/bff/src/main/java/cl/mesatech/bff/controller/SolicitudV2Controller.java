package cl.mesatech.bff.controller;

import cl.mesatech.bff.client.SolicitudClient;
import cl.mesatech.bff.dto.SolicitudV2Response;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@AllArgsConstructor
@RestController
@RequestMapping("/v2/solicitudes")
public class SolicitudV2Controller {

    private final SolicitudClient solicitudClient;

    @GetMapping
    public SolicitudV2Response[] obtenerSolicitudes(){
        return solicitudClient.obtenerSolicitudesV2();
    }
}
