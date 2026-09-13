package com.minierp.backend.dto.compra;

import com.minierp.backend.entity.enums.EstadoCompra;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class CompraResumenResponse {
    private Long id;
    private String numeroCompra;
    private String proveedorNombre;
    private LocalDateTime fecha;
    private BigDecimal total;
    private EstadoCompra estado;
}