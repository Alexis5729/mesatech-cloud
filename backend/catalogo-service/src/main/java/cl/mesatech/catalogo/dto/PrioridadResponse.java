package cl.mesatech.catalogo.dto;

// JSON de salida para una prioridad.
public record PrioridadResponse(
        Long id,
        String nombre,
        Integer nivel
) {
}
