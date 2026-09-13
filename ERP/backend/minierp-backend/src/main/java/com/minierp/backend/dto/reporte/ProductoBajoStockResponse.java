package com.minierp.backend.dto.reporte;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ProductoBajoStockResponse {
    private Long productoId;
    private String codigo;
    private String nombre;
    private Integer stockActual;
    private Integer stockMinimo;
}