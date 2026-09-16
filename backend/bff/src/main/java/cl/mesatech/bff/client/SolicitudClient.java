package cl.mesatech.bff.client;

import cl.mesatech.bff.dto.CrearSolicitudRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class SolicitudClient {

    private final RestClient restClient;

    public SolicitudClient(
            @Value("${services.solicitudes.base-url}") String baseUrl){

        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .build();
    }

    public String crearSolicitud(CrearSolicitudRequest request){
        return restClient
                .post()
                .uri("/v1/solicitudes")
                .body(request)
                .retrieve()
                .body(String.class);
    }

}
