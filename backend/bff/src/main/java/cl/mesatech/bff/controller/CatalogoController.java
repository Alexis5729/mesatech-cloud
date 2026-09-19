package cl.mesatech.bff.controller;

import cl.mesatech.bff.client.CatalogoClient;
import cl.mesatech.bff.dto.CategoriaResponse;
import cl.mesatech.bff.dto.PrioridadResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/catalogo")
public class CatalogoController {

    private final CatalogoClient catalogoClient;

    public CatalogoController(CatalogoClient catalogoClient){
        this.catalogoClient = catalogoClient;
    }

    @GetMapping("/categorias")
    public CategoriaResponse[] obtenerCategorias(){
        return catalogoClient.obtenerCategorias();
    }

    @GetMapping("/prioridades")
    public PrioridadResponse[] obtenerPrioridades(){
        return catalogoClient.obtenerPrioridades();
    }
}
