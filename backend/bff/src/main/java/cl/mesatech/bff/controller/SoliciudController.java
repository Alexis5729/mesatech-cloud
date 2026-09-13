package cl.mesatech.bff.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/solicitudes")
public class SoliciudController {

    @GetMapping
    public String obtenerSolicitudes(){
        return "Listado de solicitudes";
    }

    @GetMapping("/mias")
    public String obtenerMisSolicitudes(){
        return "Mis solicitudes";
    }

    @PostMapping
    public String crearSolicitud(){
        return "Solicitud creada";
    }
}
