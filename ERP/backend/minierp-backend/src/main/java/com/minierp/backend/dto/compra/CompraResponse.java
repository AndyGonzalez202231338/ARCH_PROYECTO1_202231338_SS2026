package com.minierp.backend.dto.compra;

import com.minierp.backend.entity.enums.EstadoCompra;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@AllArgsConstructor
@Builder
public class CompraResponse {
    private Long id;
    private String numeroCompra;
    private Long proveedorId;
    private String proveedorNombre;
    private Long usuarioId;
    private String usuarioNombre;
    private LocalDateTime fecha;
    private BigDecimal subtotal;
    private BigDecimal impuesto;
    private BigDecimal total;
    private EstadoCompra estado;
    private List<DetalleCompraResponse> detalles;
}