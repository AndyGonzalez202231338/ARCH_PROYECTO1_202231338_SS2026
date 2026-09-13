package com.minierp.backend.dto.reporte;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class TopClienteResponse {
    private Long clienteId;
    private String nombre;
    private Long cantidadVentas;
    private BigDecimal montoTotal;
}