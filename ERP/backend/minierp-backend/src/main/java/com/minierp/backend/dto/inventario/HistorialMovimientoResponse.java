package com.minierp.backend.dto.inventario;

import com.minierp.backend.entity.enums.ReferenciaTipo;
import com.minierp.backend.entity.enums.TipoMovimiento;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Versión resumida para el historial de un producto.
 * No incluye stock_anterior/nuevo para aligerar la respuesta.
 */
@Getter
@AllArgsConstructor
public class HistorialMovimientoResponse {
    private LocalDateTime fecha;
    private TipoMovimiento tipoMovimiento;
    private Integer cantidad;
    private BigDecimal costoUnitario;
    private ReferenciaTipo referenciaTipo;
    private Long referenciaId;
    private String usuarioNombre;
}