package cl.mesatech.catalogo.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

// Prioridad referenciada mediante prioridadId; un nivel mayor representa mayor urgencia.
@Entity
@Table(name = "prioridades")
public class Prioridad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String nombre;

    @Column(nullable = false, unique = true)
    private Integer nivel;

    protected Prioridad() {
        // Constructor requerido por JPA.
    }

    public Prioridad(String nombre, Integer nivel) {
        this.nombre = nombre;
        this.nivel = nivel;
    }

    public Long getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public Integer getNivel() {
        return nivel;
    }

    public void actualizar(String nombre, Integer nivel) {
        this.nombre = nombre;
        this.nivel = nivel;
    }
}
