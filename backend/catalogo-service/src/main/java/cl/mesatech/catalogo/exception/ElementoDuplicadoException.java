package cl.mesatech.catalogo.exception;

// Informa un conflicto de catálogo sin revelar detalles internos de la base de datos.
public class ElementoDuplicadoException extends RuntimeException {

    public ElementoDuplicadoException(String message) {
        super(message);
    }
}
