package com.minierp.backend.dto.producto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
@Builder
public class ProductoResponse {
    private Long id;
    private String codigo;
    private String nombre;
    private String descripcion;
    private Long categoriaId;
    private String categoriaNombre;
    private BigDecimal precioCompra;
    private BigDecimal precioVenta;
    private String unidadMedida;
    private Integer stockActual;
    private Integer stockMinimo;
    private Boolean activo;
    private Boolean bajoStock;   // stockActual <= stockMinimo
}