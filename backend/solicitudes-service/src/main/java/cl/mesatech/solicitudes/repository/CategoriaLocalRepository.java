package cl.mesatech.solicitudes.repository;

import cl.mesatech.solicitudes.entity.CategoriaLocal;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoriaLocalRepository
        extends JpaRepository<CategoriaLocal, Long> {

    boolean existsByEventId(String eventId);
}
