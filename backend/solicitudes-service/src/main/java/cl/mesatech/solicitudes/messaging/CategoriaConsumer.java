package cl.mesatech.solicitudes.messaging;

import cl.mesatech.solicitudes.entity.CategoriaLocal;
import cl.mesatech.solicitudes.repository.CategoriaLocalRepository;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class CategoriaConsumer {

    private final CategoriaLocalRepository categoriaRepository;

    public CategoriaConsumer(CategoriaLocalRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    @RabbitListener(queues = "${app.rabbitmq.queue}")
    @Transactional
    public void consumir(CategoriaCreadaEvent evento) {

        if (evento == null
                || evento.eventId() == null
                || evento.eventId().isBlank()
                || evento.categoriaId() == null
                || evento.nombre() == null
                || evento.nombre().isBlank()
                || evento.fechaEvento() == null
                || !"categoria.creada".equals(evento.tipoEvento())) {
            throw new IllegalArgumentException(
                    "Evento categoria.creada inválido"
            );
        }

        // Permite una redelivery del mismo evento sin duplicar datos.
        if (categoriaRepository.existsByEventId(evento.eventId())) {
            return;
        }

        // categoriaId representa el ID original proveniente de RDS Catálogo.
        if (categoriaRepository.existsById(evento.categoriaId())) {
            throw new IllegalStateException(
                    "La categoría " + evento.categoriaId()
                            + " ya existe con otro eventId"
            );
        }

        CategoriaLocal categoria = new CategoriaLocal(
                evento.categoriaId(),
                evento.nombre().trim(),
                evento.eventId(),
                evento.fechaEvento()
        );

        categoriaRepository.save(categoria);
    }
}
