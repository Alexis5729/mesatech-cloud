package cl.mesatech.bff.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PrioridadResponse {

    private Long id;
    private String nombre;
    private int nivel;
}
