package cl.mesatech.solicitudes.service;

import cl.mesatech.solicitudes.dto.CategoriaLocalResponse;
import cl.mesatech.solicitudes.repository.CategoriaLocalRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class CategoriaLocalService {

    private final CategoriaLocalRepository repository;

    public CategoriaLocalService(CategoriaLocalRepository repository) {
        this.repository = repository;
    }

    public List<CategoriaLocalResponse> listar() {
        return repository.findAll(Sort.by("nombre")).stream()
                .map(c -> new CategoriaLocalResponse(
                        c.getCategoriaId(),
                        c.getNombre()
                ))
                .toList();
    }
}
