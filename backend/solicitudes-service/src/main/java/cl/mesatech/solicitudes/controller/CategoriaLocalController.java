package cl.mesatech.solicitudes.controller;

import cl.mesatech.solicitudes.dto.CategoriaLocalResponse;
import cl.mesatech.solicitudes.service.CategoriaLocalService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/v1/solicitudes/categorias")
public class CategoriaLocalController {

    private final CategoriaLocalService service;

    public CategoriaLocalController(CategoriaLocalService service) {
        this.service = service;
    }

    @GetMapping
    public List<CategoriaLocalResponse> listar() {
        return service.listar();
    }
}
