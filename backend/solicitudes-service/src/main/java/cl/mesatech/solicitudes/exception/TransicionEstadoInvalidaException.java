package cl.mesatech.solicitudes.exception;

import cl.mesatech.solicitudes.entity.EstadoSolicitud;

public class TransicionEstadoInvalidaException extends RuntimeException {

    public TransicionEstadoInvalidaException(EstadoSolicitud estadoActual, EstadoSolicitud nuevoEstado) {
        super("No se puede cambiar una solicitud de " + estadoActual + " a " + nuevoEstado);
    }
}
