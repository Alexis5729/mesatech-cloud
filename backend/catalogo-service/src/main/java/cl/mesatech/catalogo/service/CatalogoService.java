package cl.mesatech.catalogo.service;

import cl.mesatech.catalogo.dto.CategoriaRequest;
import cl.mesatech.catalogo.dto.CategoriaResponse;
import cl.mesatech.catalogo.dto.PrioridadRequest;
import cl.mesatech.catalogo.dto.PrioridadResponse;
import cl.mesatech.catalogo.entity.Categoria;
import cl.mesatech.catalogo.entity.Prioridad;
import cl.mesatech.catalogo.exception.ElementoDuplicadoException;
import cl.mesatech.catalogo.exception.ElementoNoEncontradoException;
import cl.mesatech.catalogo.repository.CategoriaRepository;
import cl.mesatech.catalogo.repository.PrioridadRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

// Reúne las reglas sencillas de mantenimiento de categorías y prioridades.
@Service
@Transactional(readOnly = true)
public class CatalogoService {

    private final CategoriaRepository categoriaRepository;
    private final PrioridadRepository prioridadRepository;

    public CatalogoService(CategoriaRepository categoriaRepository, PrioridadRepository prioridadRepository) {
        this.categoriaRepository = categoriaRepository;
        this.prioridadRepository = prioridadRepository;
    }

    public List<CategoriaResponse> listarCategorias() {
        return categoriaRepository.findAll(Sort.by("nombre")).stream()
                .map(this::convertirCategoria)
                .toList();
    }

    @Transactional
    public CategoriaResponse crearCategoria(CategoriaRequest request) {
        String nombre = request.nombre().trim();
        validarNombreCategoriaDisponible(nombre, null);

        Categoria categoria = new Categoria(nombre, normalizarDescripcion(request.descripcion()));
        return convertirCategoria(categoriaRepository.save(categoria));
    }

    @Transactional
    public CategoriaResponse modificarCategoria(Long id, CategoriaRequest request) {
        Categoria categoria = buscarCategoria(id);
        String nombre = request.nombre().trim();
        validarNombreCategoriaDisponible(nombre, id);

        categoria.actualizar(nombre, normalizarDescripcion(request.descripcion()));
        return convertirCategoria(categoriaRepository.save(categoria));
    }

    @Transactional
    public void eliminarCategoria(Long id) {
        // Primero se busca para devolver 404 en lugar de ignorar silenciosamente el id.
        categoriaRepository.delete(buscarCategoria(id));
    }

    public List<PrioridadResponse> listarPrioridades() {
        return prioridadRepository.findAll(Sort.by("nivel")).stream()
                .map(this::convertirPrioridad)
                .toList();
    }

    @Transactional
    public PrioridadResponse crearPrioridad(PrioridadRequest request) {
        String nombre = request.nombre().trim();
        validarPrioridadDisponible(nombre, request.nivel(), null);

        Prioridad prioridad = new Prioridad(nombre, request.nivel());
        return convertirPrioridad(prioridadRepository.save(prioridad));
    }

    @Transactional
    public PrioridadResponse modificarPrioridad(Long id, PrioridadRequest request) {
        Prioridad prioridad = buscarPrioridad(id);
        String nombre = request.nombre().trim();
        validarPrioridadDisponible(nombre, request.nivel(), id);

        prioridad.actualizar(nombre, request.nivel());
        return convertirPrioridad(prioridadRepository.save(prioridad));
    }

    @Transactional
    public void eliminarPrioridad(Long id) {
        prioridadRepository.delete(buscarPrioridad(id));
    }

    private Categoria buscarCategoria(Long id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new ElementoNoEncontradoException("una categoría", id));
    }

    private Prioridad buscarPrioridad(Long id) {
        return prioridadRepository.findById(id)
                .orElseThrow(() -> new ElementoNoEncontradoException("una prioridad", id));
    }

    private void validarNombreCategoriaDisponible(String nombre, Long idActual) {
        boolean existe = idActual == null
                ? categoriaRepository.existsByNombreIgnoreCase(nombre)
                : categoriaRepository.existsByNombreIgnoreCaseAndIdNot(nombre, idActual);

        if (existe) {
            throw new ElementoDuplicadoException("Ya existe una categoría con nombre " + nombre);
        }
    }

    private void validarPrioridadDisponible(String nombre, Integer nivel, Long idActual) {
        boolean nombreExiste = idActual == null
                ? prioridadRepository.existsByNombreIgnoreCase(nombre)
                : prioridadRepository.existsByNombreIgnoreCaseAndIdNot(nombre, idActual);
        boolean nivelExiste = idActual == null
                ? prioridadRepository.existsByNivel(nivel)
                : prioridadRepository.existsByNivelAndIdNot(nivel, idActual);

        if (nombreExiste) {
            throw new ElementoDuplicadoException("Ya existe una prioridad con nombre " + nombre);
        }
        if (nivelExiste) {
            throw new ElementoDuplicadoException("Ya existe una prioridad con nivel " + nivel);
        }
    }

    private String normalizarDescripcion(String descripcion) {
        return descripcion == null || descripcion.isBlank() ? null : descripcion.trim();
    }

    private CategoriaResponse convertirCategoria(Categoria categoria) {
        return new CategoriaResponse(categoria.getId(), categoria.getNombre(), categoria.getDescripcion());
    }

    private PrioridadResponse convertirPrioridad(Prioridad prioridad) {
        return new PrioridadResponse(prioridad.getId(), prioridad.getNombre(), prioridad.getNivel());
    }
}
