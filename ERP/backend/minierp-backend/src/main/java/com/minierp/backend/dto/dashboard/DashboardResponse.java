package com.minierp.backend.dto.dashboard;

import com.minierp.backend.dto.compra.CompraResumenResponse;
import com.minierp.backend.dto.venta.VentaResumenResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@AllArgsConstructor
@Builder
public class DashboardResponse {
    private Long totalProductos;
    private Long totalProveedores;
    private Long totalClientes;
    private Long totalUsuarios;
    private Long totalCompras;
    private Long totalVentas;
    private BigDecimal montoTotalCompras;
    private BigDecimal montoTotalVentas;
    private Long productosBajoStock;
    private List<CompraResumenResponse> ultimas5Compras;
    private List<VentaResumenResponse> ultimas5Ventas;
}