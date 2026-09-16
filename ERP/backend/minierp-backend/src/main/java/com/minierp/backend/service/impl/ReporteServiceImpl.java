package com.minierp.backend.service.impl;

import com.minierp.backend.dto.reporte.*;
import com.minierp.backend.repository.*;
import com.minierp.backend.service.ReporteService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReporteServiceImpl implements ReporteService {

    private final DetalleVentaRepository detalleVentaRepository;
    private final DetalleCompraRepository detalleCompraRepository;
    private final CompraRepository compraRepository;
    private final VentaRepository ventaRepository;
    private final MovimientoInventarioRepository movimientoRepository;
    private final ProductoRepository productoRepository;

    @Override
        @Transactional(readOnly = true)
        public List<TopProductoResponse> topProductosMasVendidos(
                LocalDateTime desde, LocalDateTime hasta, int top) {

        Pageable limit = PageRequest.of(0, top);
        List<Object[]> resultados;

        if (desde == null && hasta == null) {
                resultados = detalleVentaRepository.findTopProductosMasVendidosSinFechas(limit);
        } else {
                LocalDateTime d = desde != null ? desde : LocalDateTime.of(1900, 1, 1, 0, 0);
                LocalDateTime h = hasta != null ? hasta : LocalDateTime.now().plusYears(100);
                resultados = detalleVentaRepository.findTopProductosMasVendidosEnRango(d, h, limit);
        }

        return resultados.stream()
                .map(r -> new TopProductoResponse(
                        (Long) r[0],
                        (String) r[1],
                        BigDecimal.valueOf(((Number) r[2]).longValue())))
                .toList();
        }

    @Override
    @Transactional(readOnly = true)
    public List<ProductoBajoStockResponse> productosMenorExistencia(int top) {
        Pageable limit = PageRequest.of(0, top);
        return productoRepository.findMenorExistencia(limit).stream()
                .map(p -> new ProductoBajoStockResponse(
                        p.getId(), p.getCodigo(), p.getNombre(),
                        p.getStockActual(), p.getStockMinimo()))
                .toList();
    }

        @Override
        @Transactional(readOnly = true)
        public List<TopProductoResponse> productosMasMovimientos(
                LocalDateTime desde, LocalDateTime hasta, int top) {

        Pageable limit = PageRequest.of(0, top);

        List<Object[]> resultados;

        // Si no hay filtros de fecha, usar el método sin fechas.
        // Si hay al menos uno, normalizar a un rango válido para evitar nulls.
        if (desde == null && hasta == null) {
                resultados = movimientoRepository.findProductosConMasMovimientosSinFechas(limit);
        } else {
                LocalDateTime d = desde != null ? desde : LocalDateTime.of(1900, 1, 1, 0, 0);
                LocalDateTime h = hasta != null ? hasta : LocalDateTime.now().plusYears(100);
                resultados = movimientoRepository.findProductosConMasMovimientosEnRango(d, h, limit);
        }

        return resultados.stream()
                .map(r -> new TopProductoResponse(
                        (Long) r[0],
                        (String) r[1],
                        BigDecimal.valueOf(((Number) r[2]).longValue())))
                .toList();
        }

    @Override
        @Transactional(readOnly = true)
        public List<TopProveedorResponse> topProveedores(int top) {
        Pageable limit = PageRequest.of(0, top);
        return compraRepository.findTopProveedoresPorMonto(limit).stream()
                .map(r -> new TopProveedorResponse(
                        ((Number) r[0]).longValue(),
                        (String) r[1],
                        ((Number) r[2]).longValue(),          // cantidadCompras real
                        r[3] instanceof BigDecimal b
                                ? b
                                : BigDecimal.valueOf(((Number) r[3]).doubleValue())))
                .toList();
        }

    @Override
    @Transactional(readOnly = true)
    public List<TopProductoResponse> productosMasAdquiridos(int top) {
        Pageable limit = PageRequest.of(0, top);
        return detalleCompraRepository.findProductosMasAdquiridos(limit).stream()
                .map(r -> new TopProductoResponse(
                        (Long) r[0], (String) r[1],
                        BigDecimal.valueOf(((Number) r[2]).longValue())))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TopClienteResponse> topClientes(int top) {
        Pageable limit = PageRequest.of(0, top);
        return ventaRepository.findTopClientesPorMonto(limit).stream()
                .map(r -> new TopClienteResponse(
                        (Long) r[0], (String) r[1], 0L,
                        (BigDecimal) r[2]))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TopProductoResponse> productosMayoresIngresos(int top) {
        Pageable limit = PageRequest.of(0, top);
        return detalleVentaRepository.findTopProductosPorIngresos(limit).stream()
                .map(r -> new TopProductoResponse(
                        (Long) r[0], (String) r[1], (BigDecimal) r[2]))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ResumenVentasPeriodoResponse> resumenVentas(
            String agrupacion, LocalDateTime desde, LocalDateTime hasta) {
        return ventaRepository.resumenVentasPorPeriodo(agrupacion, desde, hasta).stream()
                .map(r -> new ResumenVentasPeriodoResponse(
                        (String) r[0],
                        ((Number) r[1]).longValue(),
                        (BigDecimal) r[2]))
                .toList();
    }
}