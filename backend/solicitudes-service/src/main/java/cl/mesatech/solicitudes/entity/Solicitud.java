package cl.mesatech.solicitudes.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;

// Entidad persistida por este microservicio. El BFF nunca accede directamente a esta tabla.
@Entity
@Table(name = "solicitudes")
public class Solicitud {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String titulo;

    @Column(nullable = false, length = 4000)
    private String descripcion;

    @Column(name = "categoria_id", nullable = false)
    private Long categoriaId;

    @Column(name = "prioridad_id", nullable = false)
    private Long prioridadId;

    @Column(name = "usuario_solicitante", nullable = false, length = 150)
    private String usuarioSolicitante;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EstadoSolicitud estado;

    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private OffsetDateTime fechaCreacion;

    protected Solicitud() {
        // Constructor requerido por JPA.
    }

    public Solicitud(String titulo, String descripcion, Long categoriaId, Long prioridadId,
                     String usuarioSolicitante) {
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.categoriaId = categoriaId;
        this.prioridadId = prioridadId;
        this.usuarioSolicitante = usuarioSolicitante;
        this.estado = EstadoSolicitud.CREADA;
    }

    @PrePersist
    void completarDatosIniciales() {
        // Se usa UTC para que EC2, PostgreSQL y los equipos locales guarden la misma referencia horaria.
        if (fechaCreacion == null) {
            fechaCreacion = OffsetDateTime.now(ZoneOffset.UTC);
        }
        if (estado == null) {
            estado = EstadoSolicitud.CREADA;
        }
    }

    public Long getId() {
        return id;
    }

    public String getTitulo() {
        return titulo;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public Long getCategoriaId() {
        return categoriaId;
    }

    public Long getPrioridadId() {
        return prioridadId;
    }

    public String getUsuarioSolicitante() {
        return usuarioSolicitante;
    }

    public EstadoSolicitud getEstado() {
        return estado;
    }

    public OffsetDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void cambiarEstado(EstadoSolicitud nuevoEstado) {
        this.estado = nuevoEstado;
    }
}
