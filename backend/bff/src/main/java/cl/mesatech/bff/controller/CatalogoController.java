package cl.mesatech.bff.controller;

import cl.mesatech.bff.client.CatalogoClient;
import cl.mesatech.bff.dto.CategoriaResponse;
import cl.mesatech.bff.dto.CrearCategoriaRequest;
import cl.mesatech.bff.dto.CrearPrioridadRequest;
import cl.mesatech.bff.dto.PrioridadResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @PostMapping("/categorias")
    public CategoriaResponse crearCategoria(
        @Valid @RequestBody CrearCategoriaRequest request){
        return catalogoClient.crearCategoria(request);
    }

    @PostMapping("/prioridades")
    public PrioridadResponse crearPrioridad(
            @Valid @RequestBody CrearPrioridadRequest request){
                return catalogoClient.crearPrioridad(request);
    }

    @PutMapping("/categorias/{id}")
    public CategoriaResponse actualizarCategoria(
            @PathVariable Long id,
            @Valid @RequestBody CrearCategoriaRequest request){
        return catalogoClient.actualizarCategoria(id, request);
    }

    @PutMapping("prioridades/{id}")
    public PrioridadResponse actualizarPrioridad(
            @PathVariable Long id,
            @Valid @RequestBody CrearPrioridadRequest request){
        return catalogoClient.actualizarPrioridad(id, request);
    }

    @DeleteMapping("/categorias/{id}")
    public ResponseEntity<Void> eliminarCategoria(
            @PathVariable Long id){
        catalogoClient.eliminarCategoria(id);

        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/prioridades/{id}")
    public ResponseEntity<Void> eliminarPrioridad(
            @PathVariable Long id){
        catalogoClient.eliminarPrioridad(id);

        return ResponseEntity.noContent().build();
    }


}
