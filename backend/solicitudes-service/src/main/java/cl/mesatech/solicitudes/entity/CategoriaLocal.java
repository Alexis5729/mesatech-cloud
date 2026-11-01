package cl.mesatech.solicitudes.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "categorias_locales")
public class CategoriaLocal {

    @Id
    @Column(name = "categoria_id", nullable = false)
    private Long categoriaId;

    @Column(nullable = false, length = 150)
    private String nombre;

    @Column(name = "event_id", nullable = false, unique = true, length = 36)
    private String eventId;

    @Column(name = "fecha_evento", nullable = false)
    private Instant fechaEvento;

    @Column(name = "fecha_recepcion", nullable = false)
    private Instant fechaRecepcion;

    protected CategoriaLocal() {
    }

    public CategoriaLocal(Long categoriaId, String nombre,
                          String eventId, Instant fechaEvento) {
        this.categoriaId = categoriaId;
        this.nombre = nombre;
        this.eventId = eventId;
        this.fechaEvento = fechaEvento;
    }

    @PrePersist
    void completarFechaRecepcion() {
        if (fechaRecepcion == null) {
            fechaRecepcion = Instant.now();
        }
    }

    public Long getCategoriaId() {
        return categoriaId;
    }

    public String getNombre() {
        return nombre;
    }

    public String getEventId() {
        return eventId;
    }

    public Instant getFechaEvento() {
        return fechaEvento;
    }

    public Instant getFechaRecepcion() {
        return fechaRecepcion;
    }
}
