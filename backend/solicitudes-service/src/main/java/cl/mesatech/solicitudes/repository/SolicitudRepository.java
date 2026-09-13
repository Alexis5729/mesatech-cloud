package cl.mesatech.solicitudes.repository;

import cl.mesatech.solicitudes.entity.Solicitud;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

// Spring Data genera las operaciones básicas de persistencia automáticamente.
public interface SolicitudRepository extends JpaRepository<Solicitud, Long> {

    List<Solicitud> findByUsuarioSolicitanteOrderByFechaCreacionDesc(String usuarioSolicitante);
}
