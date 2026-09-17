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

    public String obtenerSolicitudes(){
        return restClient
                .get()
                .uri("/v1/solicitudes")
                .retrieve()
                .body(String.class);
    }

    public String obtenerMisSolicitudes(String userId){
        return restClient
                .get()
                .uri("/v1/solicitudes/mias")
                .header("X-User-Id", userId)
                .retrieve()
                .body(String.class);
    }

}
