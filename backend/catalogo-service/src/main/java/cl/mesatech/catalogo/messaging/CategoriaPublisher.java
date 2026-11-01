package cl.mesatech.catalogo.messaging;

import org.springframework.amqp.AmqpException;
import org.springframework.amqp.core.MessageDeliveryMode;
import org.springframework.amqp.rabbit.connection.CorrelationData;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;

@Component
public class CategoriaPublisher {

    private final RabbitTemplate rabbitTemplate;

    @Value("${app.rabbitmq.exchange}")
    private String exchange;

    @Value("${app.rabbitmq.routing-key}")
    private String routingKey;

    public CategoriaPublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void publicar(CategoriaCreadaEvent evento) {

        CorrelationData correlationData =
                new CorrelationData(evento.eventId());

        rabbitTemplate.convertAndSend(
                exchange,
                routingKey,
                evento,
                message -> {
                    message.getMessageProperties()
                            .setDeliveryMode(MessageDeliveryMode.PERSISTENT);

                    message.getMessageProperties()
                            .setMessageId(evento.eventId());

                    return message;
                },
                correlationData
        );

        try {
            CorrelationData.Confirm confirm =
                    correlationData.getFuture()
                            .get(10, TimeUnit.SECONDS);

            if (!confirm.ack()) {
                throw new AmqpException(
                        "RabbitMQ no confirmó la publicación"
                );
            }

            if (correlationData.getReturned() != null) {
                throw new AmqpException(
                        "RabbitMQ devolvió el mensaje porque no existe una ruta válida"
                );
            }

        } catch (Exception e) {

            if (e instanceof AmqpException) {
                throw (AmqpException) e;
            }

            throw new AmqpException(
                    "No fue posible confirmar la publicación en RabbitMQ",
                    e
            );
        }
    }
}