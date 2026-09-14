package com.minierp.backend.service;

import com.minierp.backend.dto.reporte.*;

import java.time.LocalDateTime;
import java.util.List;

public interface ReporteService {
    List<TopProductoResponse> topProductosMasVendidos(LocalDateTime desde, LocalDateTime hasta, int top);
    List<ProductoBajoStockResponse> productosMenorExistencia(int top);
    List<TopProductoResponse> productosMasMovimientos(LocalDateTime desde, LocalDateTime hasta, int top);
    List<TopProveedorResponse> topProveedores(int top);
    List<TopProductoResponse> productosMasAdquiridos(int top);
    List<TopClienteResponse> topClientes(int top);
    List<TopProductoResponse> productosMayoresIngresos(int top);
    List<ResumenVentasPeriodoResponse> resumenVentas(String agrupacion, LocalDateTime desde, LocalDateTime hasta);
}