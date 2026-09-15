package cl.mesatech.catalogo.exception;

import cl.mesatech.catalogo.dto.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;

// Mantiene el mismo formato de error en todas las operaciones del catálogo.
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ElementoNoEncontradoException.class)
    public ResponseEntity<ErrorResponse> manejarNoEncontrado(ElementoNoEncontradoException ex) {
        return crearRespuesta(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(ElementoDuplicadoException.class)
    public ResponseEntity<ErrorResponse> manejarDuplicado(ElementoDuplicadoException ex) {
        return crearRespuesta(HttpStatus.CONFLICT, ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> manejarValidacion(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(error -> error.getDefaultMessage())
                .orElse("El catálogo contiene datos inválidos");
        return crearRespuesta(HttpStatus.BAD_REQUEST, message);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> manejarJsonInvalido(HttpMessageNotReadableException ex) {
        return crearRespuesta(HttpStatus.BAD_REQUEST, "El cuerpo JSON es inválido");
    }

    private ResponseEntity<ErrorResponse> crearRespuesta(HttpStatus status, String message) {
        ErrorResponse error = new ErrorResponse(status.value(), message, OffsetDateTime.now(ZoneOffset.UTC));
        return ResponseEntity.status(status).body(error);
    }
}
