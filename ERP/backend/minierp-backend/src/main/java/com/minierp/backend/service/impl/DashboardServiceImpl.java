package com.minierp.backend.service.impl;

import com.minierp.backend.dto.compra.CompraResumenResponse;
import com.minierp.backend.dto.dashboard.DashboardResponse;
import com.minierp.backend.dto.venta.VentaResumenResponse;
import com.minierp.backend.repository.*;
import com.minierp.backend.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final ProductoRepository productoRepository;
    private final ProveedorRepository proveedorRepository;
    private final ClienteRepository clienteRepository;
    private final UsuarioRepository usuarioRepository;
    private final CompraRepository compraRepository;
    private final VentaRepository ventaRepository;

    @Override
    @Transactional(readOnly = true)
    public DashboardResponse obtenerResumen() {
        // Conteos generales
        long totalProductos = productoRepository.count();
        long totalProveedores = proveedorRepository.count();
        long totalClientes = clienteRepository.count();
        long totalUsuarios = usuarioRepository.count();
        long totalCompras = compraRepository.count();
        long totalVentas = ventaRepository.count();

        // Montos agregados
        BigDecimal montoCompras = compraRepository.findAll().stream()
                .map(c -> c.getTotal())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal montoVentas = ventaRepository.findAll().stream()
                .map(v -> v.getTotal())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Productos bajo stock
        long productosBajoStock = productoRepository.findProductosBajoStock(null).size();

        // Últimas 5 compras y ventas
        List<CompraResumenResponse> ultimasCompras = compraRepository
                .findAll(PageRequest.of(0, 5,
                        org.springframework.data.domain.Sort.by("fecha").descending()))
                .stream()
                .map(c -> new CompraResumenResponse(
                        c.getId(), c.getNumeroCompra(), c.getProveedor().getNombre(),
                        c.getFecha(), c.getTotal(), c.getEstado()))
                .toList();

        List<VentaResumenResponse> ultimasVentas = ventaRepository
                .findAll(PageRequest.of(0, 5,
                        org.springframework.data.domain.Sort.by("fecha").descending()))
                .stream()
                .map(v -> new VentaResumenResponse(
                        v.getId(), v.getNumeroVenta(), v.getCliente().getNombre(),
                        v.getFecha(), v.getTotal(), v.getEstado()))
                .toList();

        return DashboardResponse.builder()
                .totalProductos(totalProductos)
                .totalProveedores(totalProveedores)
                .totalClientes(totalClientes)
                .totalUsuarios(totalUsuarios)
                .totalCompras(totalCompras)
                .totalVentas(totalVentas)
                .montoTotalCompras(montoCompras)
                .montoTotalVentas(montoVentas)
                .productosBajoStock(productosBajoStock)
                .ultimas5Compras(ultimasCompras)
                .ultimas5Ventas(ultimasVentas)
                .build();
    }
}