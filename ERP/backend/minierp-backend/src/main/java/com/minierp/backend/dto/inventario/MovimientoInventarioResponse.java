package com.minierp.backend.dto.inventario;

import com.minierp.backend.entity.enums.ReferenciaTipo;
import com.minierp.backend.entity.enums.TipoMovimiento;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
@Builder
public class MovimientoInventarioResponse {
    private Long id;
    private Long productoId;
    private String productoCodigo;
    private String productoNombre;
    private TipoMovimiento tipoMovimiento;
    private Integer cantidad;
    private Integer saldoDisponible;
    private BigDecimal costoUnitario;
    private Integer stockAnterior;
    private Integer stockNuevo;
    private ReferenciaTipo referenciaTipo;
    private Long referenciaId;
    private Long usuarioId;
    private String usuarioNombre;
    private LocalDateTime fecha;
}