package cl.mesatech.catalogo.dto;

// JSON de salida para una categoría.
public record CategoriaResponse(
        Long id,
        String nombre,
        String descripcion
) {
}
