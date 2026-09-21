package cl.mesatech.bff.client;

import cl.mesatech.bff.dto.ActualizarEstadoRequest;
import cl.mesatech.bff.dto.CrearSolicitudRequest;
import cl.mesatech.bff.dto.SolicitudResponse;
import cl.mesatech.bff.dto.SolicitudV2Response;
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

    public SolicitudResponse crearSolicitud(String userId, CrearSolicitudRequest request){
        return restClient
                .post()
                .uri("/v1/solicitudes")
                .header("X-User-Id", userId)
                .body(request)
                .retrieve()
                .body(SolicitudResponse.class);
    }

    public SolicitudResponse[] obtenerSolicitudes(){
        return restClient
                .get()
                .uri("/v1/solicitudes")
                .retrieve()
                .body(SolicitudResponse[].class);
    }

    public SolicitudResponse[] obtenerMisSolicitudes(String userId){
        return restClient
                .get()
                .uri("/v1/solicitudes/mias")
                .header("X-User-Id", userId)
                .retrieve()
                .body(SolicitudResponse[].class);
    }

    public SolicitudResponse actualizarEstado(Long id, ActualizarEstadoRequest request){
        return restClient
                .patch()
                .uri("/v1/solicitudes/{id}/estado", id)
                .body(request)
                .retrieve()
                .body(SolicitudResponse.class);
    }

    public SolicitudV2Response[] obtenerSolicitudesV2(){
        return restClient
                .get()
                .uri("/v2/solicitudes")
                .retrieve()
                .body(SolicitudV2Response[].class);
    }

}
