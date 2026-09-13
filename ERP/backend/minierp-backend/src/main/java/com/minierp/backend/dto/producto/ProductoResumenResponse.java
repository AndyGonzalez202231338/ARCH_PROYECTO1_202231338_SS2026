package com.minierp.backend.dto.producto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class ProductoResumenResponse {
    private Long id;
    private String codigo;
    private String nombre;
    private BigDecimal precioVenta;
    private Integer stockActual;
}