package com.minierp.backend.dto.venta;

import com.minierp.backend.entity.enums.EstadoVenta;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class VentaResumenResponse {
    private Long id;
    private String numeroVenta;
    private String clienteNombre;
    private LocalDateTime fecha;
    private BigDecimal total;
    private EstadoVenta estado;
}