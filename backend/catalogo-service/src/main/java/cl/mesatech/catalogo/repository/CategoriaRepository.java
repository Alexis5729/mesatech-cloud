package cl.mesatech.catalogo.repository;

import cl.mesatech.catalogo.entity.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;

// Spring Data implementa el CRUD y las comprobaciones de nombre automáticamente.
public interface CategoriaRepository extends JpaRepository<Categoria, Long> {

    boolean existsByNombreIgnoreCase(String nombre);

    boolean existsByNombreIgnoreCaseAndIdNot(String nombre, Long id);
}
