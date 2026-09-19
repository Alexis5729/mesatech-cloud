package cl.mesatech.bff.exception;

import cl.mesatech.bff.dto.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientResponseException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.time.Instant;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private final ObjectMapper objectMapper;

    public GlobalExceptionHandler(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    private String obtenerMensaje(RestClientResponseException ex){
        try{
            JsonNode json = objectMapper.readTree(ex.getResponseBodyAsString());
            if (json.has("message")){
                return json.get("message").asText();
            }

        }catch (Exception e){
            return ex.getStatusText();
        }

        return ex.getStatusText();
    }

    @ExceptionHandler(RestClientResponseException.class)
    public ResponseEntity<ErrorResponse> manejarErrorMicroservicio(
            RestClientResponseException ex){
        ErrorResponse error = new ErrorResponse(
                ex.getStatusCode().value(),
                obtenerMensaje(ex),
                Instant.now()
        );

        return ResponseEntity
                .status(ex.getStatusCode())
                .body(error);
    }

    @ExceptionHandler(ResourceAccessException.class)
    public ResponseEntity<ErrorResponse> manejarServicioNoDisponible(
            ResourceAccessException ex){
        ErrorResponse error = new ErrorResponse(
                503,
                "El microservicio no se encuentra disponible",
                Instant.now()
        );

        return ResponseEntity
                .status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(error);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> manejarErrorValidacion(
            MethodArgumentNotValidException ex){

        String mensaje = ex.getBindingResult()
                .getFieldErrors()
                .getFirst()
                .getDefaultMessage();

        ErrorResponse error = new ErrorResponse(
                400,
                mensaje,
                Instant.now()
        );

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(error);
    }

}
