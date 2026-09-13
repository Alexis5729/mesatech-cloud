package cl.mesatech.solicitudes.entity;

// Estados permitidos por la pauta para el ciclo de vida de una solicitud.
public enum EstadoSolicitud {
    CREADA,
    ASIGNADA,
    EN_PROCESO,
    RESUELTA,
    CERRADA,
    CANCELADA;

    // Centralizar la regla evita que un controlador o una futura integración la omita.
    public boolean puedeCambiarA(EstadoSolicitud nuevoEstado) {
        if (nuevoEstado == null) {
            return false;
        }

        return switch (this) {
            case CREADA -> nuevoEstado == ASIGNADA || nuevoEstado == CANCELADA;
            case ASIGNADA -> nuevoEstado == EN_PROCESO || nuevoEstado == CANCELADA;
            case EN_PROCESO -> nuevoEstado == RESUELTA || nuevoEstado == CANCELADA;
            case RESUELTA -> nuevoEstado == CERRADA;
            case CERRADA, CANCELADA -> false;
        };
    }
}
