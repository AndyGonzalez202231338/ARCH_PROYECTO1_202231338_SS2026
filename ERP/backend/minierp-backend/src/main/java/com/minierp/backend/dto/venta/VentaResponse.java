package com.minierp.backend.dto.venta;

import com.minierp.backend.entity.enums.EstadoVenta;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@AllArgsConstructor
@Builder
public class VentaResponse {
    private Long id;
    private String numeroVenta;
    private Long clienteId;
    private String clienteNombre;
    private Long usuarioId;
    private String usuarioNombre;
    private LocalDateTime fecha;
    private BigDecimal subtotal;
    private BigDecimal impuesto;
    private BigDecimal total;
    private EstadoVenta estado;
    private List<DetalleVentaResponse> detalles;
}