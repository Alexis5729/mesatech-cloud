package cl.mesatech.bff.client;

import cl.mesatech.bff.dto.CategoriaResponse;
import cl.mesatech.bff.dto.CrearCategoriaRequest;
import cl.mesatech.bff.dto.CrearPrioridadRequest;
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

    public CategoriaResponse crearCategoria(CrearCategoriaRequest request){
        return restClient
                .post()
                .uri("/v1/catalogo/categorias")
                .body(request)
                .retrieve()
                .body(CategoriaResponse.class);

    }

    public PrioridadResponse[] obtenerPrioridades(){
        return restClient
                .get()
                .uri("/v1/catalogo/prioridades")
                .retrieve()
                .body(PrioridadResponse[].class);
    }

    public PrioridadResponse crearPrioridad(CrearPrioridadRequest request){
        return restClient
                .post()
                .uri("/v1/catalogo/prioridades")
                .body(request)
                .retrieve()
                .body(PrioridadResponse.class);
    }

    public CategoriaResponse actualizarCategoria(Long id, CrearCategoriaRequest request){
        return restClient
                .put()
                .uri("/v1/catalogo/categorias/{id}", id)
                .body(request)
                .retrieve()
                .body(CategoriaResponse.class);
    }

    public PrioridadResponse actualizarPrioridad(Long id, CrearPrioridadRequest request){
        return restClient
                .put()
                .uri("/v1/catalogo/prioridades/{id}", id)
                .body(request)
                .retrieve()
                .body(PrioridadResponse.class);
    }

    public void eliminarCategoria(Long id){
        restClient
                .delete()
                .uri("/v1/catalogo/categorias/{id}", id)
                .retrieve()
                .toBodilessEntity();
    }

    public void eliminarPrioridad(Long id){
        restClient
                .delete()
                .uri("/v1/catalogo/prioridades/{id}", id)
                .retrieve()
                .toBodilessEntity();
    }

}
