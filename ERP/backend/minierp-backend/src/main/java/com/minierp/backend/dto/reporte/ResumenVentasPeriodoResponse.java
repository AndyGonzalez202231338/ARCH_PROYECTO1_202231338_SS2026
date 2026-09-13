package com.minierp.backend.dto.reporte;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class ResumenVentasPeriodoResponse {
    private String periodo;         // "2026-06-21", "2026-06", "2026"
    private Long cantidadVentas;
    private BigDecimal totalVentas;
}