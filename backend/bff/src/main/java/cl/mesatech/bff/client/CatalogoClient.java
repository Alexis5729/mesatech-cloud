package cl.mesatech.bff.client;

import cl.mesatech.bff.dto.CategoriaResponse;
import cl.mesatech.bff.dto.PrioridadResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class CatalogoClient {

    private final RestClient restClient;

    public CatalogoClient(
            @Value("${services.catalogo.base-url}") String baseUrl){
                this.restClient = RestClient.builder()
                        .baseUrl(baseUrl)
                        .build();
    }

    public CategoriaResponse[] obtenerCategorias(){
        return restClient
                .get()
                .uri("/v1/catalogo/categorias")
                .retrieve()
                .body(CategoriaResponse[].class);
    }

    public PrioridadResponse[] obtenerPrioridades(){
        return restClient
                .get()
                .uri("/v1/catalogo/prioridades")
                .retrieve()
                .body(PrioridadResponse[].class);
    }

}
