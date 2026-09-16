package com.minierp.backend.controller;

import com.minierp.backend.dto.reporte.*;
import com.minierp.backend.service.ReporteService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin/reportes")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMINISTRACION')")
public class ReporteController {

    private final ReporteService reporteService;

    // PRODUCTOS E INVENTARIO
    @GetMapping("/productos-mas-vendidos")
    public ResponseEntity<List<TopProductoResponse>> masVendidos(
            @RequestParam(defaultValue = "10") int top,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime desde,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime hasta) {
        return ResponseEntity.ok(reporteService.topProductosMasVendidos(desde, hasta, top));
    }

    @GetMapping("/productos-menor-existencia")
    public ResponseEntity<List<ProductoBajoStockResponse>> menorExistencia(
            @RequestParam(defaultValue = "10") int top) {
        return ResponseEntity.ok(reporteService.productosMenorExistencia(top));
    }

    @GetMapping("/productos-mas-movimientos")
    public ResponseEntity<List<TopProductoResponse>> masMovimientos(
            @RequestParam(defaultValue = "10") int top,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime desde,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime hasta) {
        return ResponseEntity.ok(reporteService.productosMasMovimientos(desde, hasta, top));
    }

    // COMPRAS Y PROVEEDORES
    @GetMapping("/top-proveedores")
    public ResponseEntity<List<TopProveedorResponse>> topProveedores(
            @RequestParam(defaultValue = "5") int top) {
    return ResponseEntity.ok(reporteService.topProveedores(top));
    }

    @GetMapping("/productos-mas-adquiridos")
    public ResponseEntity<List<TopProductoResponse>> masAdquiridos(
            @RequestParam(defaultValue = "10") int top) {
        return ResponseEntity.ok(reporteService.productosMasAdquiridos(top));
    }

    // VENTAS Y CLIENTES
    @GetMapping("/top-clientes")
    public ResponseEntity<List<TopClienteResponse>> topClientes(
            @RequestParam(defaultValue = "10") int top) {
        return ResponseEntity.ok(reporteService.topClientes(top));
    }

    @GetMapping("/productos-mayores-ingresos")
    public ResponseEntity<List<TopProductoResponse>> mayoresIngresos(
            @RequestParam(defaultValue = "10") int top) {
        return ResponseEntity.ok(reporteService.productosMayoresIngresos(top));
    }

    @GetMapping("/resumen-ventas")
    public ResponseEntity<List<ResumenVentasPeriodoResponse>> resumenVentas(
            @RequestParam(defaultValue = "MES") String agrupacion,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {

        LocalDateTime desdeDt = desde != null ? desde.atStartOfDay() : null;
        LocalDateTime hastaDt = hasta != null ? hasta.atTime(23, 59, 59) : null;

        return ResponseEntity.ok(reporteService.resumenVentas(agrupacion, desdeDt, hastaDt));
    }
}