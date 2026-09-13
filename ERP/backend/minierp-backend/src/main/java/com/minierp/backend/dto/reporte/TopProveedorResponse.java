package com.minierp.backend.dto.reporte;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class TopProveedorResponse {
    private Long proveedorId;
    private String nombre;
    private Long cantidadCompras;
    private BigDecimal montoTotal;
}