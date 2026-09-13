package cl.mesatech.catalogo.controller;

import cl.mesatech.catalogo.dto.CategoriaRequest;
import cl.mesatech.catalogo.dto.CategoriaResponse;
import cl.mesatech.catalogo.dto.PrioridadRequest;
import cl.mesatech.catalogo.dto.PrioridadResponse;
import cl.mesatech.catalogo.service.CatalogoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

// API v1 para que el BFF consulte y mantenga el catálogo.
@RestController
@RequestMapping("/v1/catalogo")
public class CatalogoController {

    private final CatalogoService catalogoService;

    public CatalogoController(CatalogoService catalogoService) {
        this.catalogoService = catalogoService;
    }

    @GetMapping("/categorias")
    public List<CategoriaResponse> listarCategorias() {
        return catalogoService.listarCategorias();
    }

    @PostMapping("/categorias")
    @ResponseStatus(HttpStatus.CREATED)
    public CategoriaResponse crearCategoria(@Valid @RequestBody CategoriaRequest request) {
        return catalogoService.crearCategoria(request);
    }

    @PutMapping("/categorias/{id}")
    public CategoriaResponse modificarCategoria(
            @PathVariable Long id,
            @Valid @RequestBody CategoriaRequest request) {
        return catalogoService.modificarCategoria(id, request);
    }

    @DeleteMapping("/categorias/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminarCategoria(@PathVariable Long id) {
        catalogoService.eliminarCategoria(id);
    }

    @GetMapping("/prioridades")
    public List<PrioridadResponse> listarPrioridades() {
        return catalogoService.listarPrioridades();
    }

    @PostMapping("/prioridades")
    @ResponseStatus(HttpStatus.CREATED)
    public PrioridadResponse crearPrioridad(@Valid @RequestBody PrioridadRequest request) {
        return catalogoService.crearPrioridad(request);
    }

    @PutMapping("/prioridades/{id}")
    public PrioridadResponse modificarPrioridad(
            @PathVariable Long id,
            @Valid @RequestBody PrioridadRequest request) {
        return catalogoService.modificarPrioridad(id, request);
    }

    @DeleteMapping("/prioridades/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminarPrioridad(@PathVariable Long id) {
        catalogoService.eliminarPrioridad(id);
    }
}
