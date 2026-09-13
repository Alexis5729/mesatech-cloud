package cl.mesatech.catalogo.repository;

import cl.mesatech.catalogo.entity.Prioridad;
import org.springframework.data.jpa.repository.JpaRepository;

// Evita prioridades duplicadas por nombre o por nivel.
public interface PrioridadRepository extends JpaRepository<Prioridad, Long> {

    boolean existsByNombreIgnoreCase(String nombre);

    boolean existsByNombreIgnoreCaseAndIdNot(String nombre, Long id);

    boolean existsByNivel(Integer nivel);

    boolean existsByNivelAndIdNot(Integer nivel, Long id);
}
