package com.minierp.backend.dto.reporte;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

/**
 * Se usa para reportes de "Top productos":
 *  - más vendidos (valor = cantidad vendida)
 *  - con más ingresos (valor = monto total)
 *  - con más movimientos (valor = cantidad de movimientos)
 */
@Getter
@AllArgsConstructor
public class TopProductoResponse {
    private Long productoId;
    private String nombre;
    private BigDecimal valor;
}