package cl.mesatech.catalogo.exception;

// Se usa cuando se intenta modificar o eliminar un elemento inexistente.
public class ElementoNoEncontradoException extends RuntimeException {

    public ElementoNoEncontradoException(String tipo, Long id) {
        super("No existe " + tipo + " con id " + id);
    }
}
