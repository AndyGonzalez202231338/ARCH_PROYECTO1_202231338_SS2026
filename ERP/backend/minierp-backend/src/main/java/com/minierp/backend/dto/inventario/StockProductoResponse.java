package com.minierp.backend.dto.inventario;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class StockProductoResponse {
    private Long productoId;
    private String codigo;
    private String nombre;
    private String categoria;
    private Integer stockActual;
    private Integer stockMinimo;
    private Boolean bajoStock;
}