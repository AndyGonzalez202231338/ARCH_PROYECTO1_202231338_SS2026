package com.minierp.backend.service.impl;

import com.minierp.backend.dto.compra.*;
import com.minierp.backend.entity.*;
import com.minierp.backend.entity.enums.EstadoCompra;
import com.minierp.backend.exception.RecursoNoEncontradoException;
import com.minierp.backend.exception.ReglaNegocioException;
import com.minierp.backend.repository.CompraRepository;
import com.minierp.backend.repository.ProductoRepository;
import com.minierp.backend.repository.ProveedorRepository;
import com.minierp.backend.service.AuditoriaService;
import com.minierp.backend.service.CompraService;
import com.minierp.backend.service.InventarioService;
import com.minierp.backend.util.UsuarioAutenticadoHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CompraServiceImpl implements CompraService {

    private final CompraRepository compraRepository;
    private final ProveedorRepository proveedorRepository;
    private final ProductoRepository productoRepository;
    private final InventarioService inventarioService;
    private final AuditoriaService auditoriaService;
    private final UsuarioAutenticadoHelper usuarioHelper;

    private static final String MODULO = "COMPRAS";

    @Override
    @Transactional
    public CompraResponse registrar(CompraRequest request) {
        Usuario usuario = usuarioHelper.getUsuarioActual();

        Proveedor proveedor = proveedorRepository.findById(request.getProveedorId())
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Proveedor no encontrado"));

        Compra compra = Compra.builder()
                .numeroCompra(generarNumero())
                .proveedor(proveedor)
                .usuario(usuario)
                .estado(request.getEstado() != null ? request.getEstado() : EstadoCompra.PENDIENTE)
                .build();

        // Agregar detalles y calcular totales
        for (DetalleCompraRequest d : request.getDetalles()) {
            Producto producto = productoRepository.findById(d.getProductoId())
                    .orElseThrow(() -> new RecursoNoEncontradoException(
                            "Producto no encontrado: " + d.getProductoId()));

            DetalleCompra detalle = DetalleCompra.builder()
                    .producto(producto)
                    .cantidad(d.getCantidad())
                    .precioUnitario(d.getPrecioUnitario())
                    .build();

            compra.addDetalle(detalle);
        }

        Compra guardada = compraRepository.save(compra);


        // Si el estado es COMPLETADA, se cargan los movimientos de entrada
        if (EstadoCompra.COMPLETADA.equals(guardada.getEstado())) {
            aplicarEntradasAlInventario(guardada, usuario);
        }

        auditoriaService.registrar(usuario, MODULO, "CREAR",
                "Compra " + guardada.getNumeroCompra() + " por Q" + guardada.getTotal());

        return toResponse(guardada);
    }

    @Override
    @Transactional
    public CompraResponse cambiarEstado(Long id, EstadoCompra nuevoEstado) {
        Usuario usuario = usuarioHelper.getUsuarioActual();

        Compra compra = compraRepository.findByIdConDetalles(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Compra no encontrada"));

        EstadoCompra anterior = compra.getEstado();

        if (EstadoCompra.COMPLETADA.equals(anterior)) {
            throw new ReglaNegocioException(
                    "No se puede cambiar el estado de una compra ya recibida");
        }

        compra.setEstado(nuevoEstado);
        Compra guardada = compraRepository.save(compra);


        // Si pasa a COMPLETADA, se aplican las entradas
        if (EstadoCompra.COMPLETADA.equals(nuevoEstado)) {
            aplicarEntradasAlInventario(guardada, usuario);
        }

        auditoriaService.registrar(usuario, MODULO, "CAMBIO_ESTADO",
                "Compra " + guardada.getNumeroCompra() + ": " + anterior + " -> " + nuevoEstado);

        return toResponse(guardada);
    }

    /**
     * Recorre los detalles de la compra y crea un movimiento de ENTRADA
     * por cada uno. El costo unitario es el precio de compra.
     */
    private void aplicarEntradasAlInventario(Compra compra, Usuario usuario) {
        for (DetalleCompra det : compra.getDetalles()) {
            inventarioService.registrarEntrada(
                    det.getProducto(),
                    det.getCantidad(),
                    det.getPrecioUnitario(),
                    compra.getId(),
                    usuario);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public CompraResponse obtener(Long id) {
        Compra c = compraRepository.findByIdConDetalles(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Compra no encontrada"));
        return toResponse(c);
    }

    @Override
        @Transactional(readOnly = true)
        public List<CompraResumenResponse> listar(LocalDateTime desde, LocalDateTime hasta,
                                                Long proveedorId) {
        List<Compra> compras;

        if (desde == null && hasta == null) {
                compras = compraRepository.filtrarSinFechas(proveedorId, null);
        } else {
                LocalDateTime d = desde != null ? desde : LocalDateTime.of(1900, 1, 1, 0, 0);
                LocalDateTime h = hasta != null ? hasta : LocalDateTime.now().plusYears(100);
                compras = compraRepository.filtrarEnRango(d, h, proveedorId, null);
        }

        return compras.stream()
                .map(c -> new CompraResumenResponse(
                        c.getId(), c.getNumeroCompra(), c.getProveedor().getNombre(),
                        c.getFecha(), c.getTotal(), c.getEstado()))
                .toList();
        }

    private String generarNumero() {
        long siguiente = compraRepository.count() + 1;
        return String.format("COM-%04d", siguiente);
    }

    private CompraResponse toResponse(Compra c) {
        List<DetalleCompraResponse> detalles = c.getDetalles().stream()
                .map(d -> DetalleCompraResponse.builder()
                        .id(d.getId())
                        .productoId(d.getProducto().getId())
                        .productoCodigo(d.getProducto().getCodigo())
                        .productoNombre(d.getProducto().getNombre())
                        .cantidad(d.getCantidad())
                        .precioUnitario(d.getPrecioUnitario())
                        .subtotal(d.getSubtotal())
                        .build())
                .toList();

        return CompraResponse.builder()
                .id(c.getId())
                .numeroCompra(c.getNumeroCompra())
                .proveedorId(c.getProveedor().getId())
                .proveedorNombre(c.getProveedor().getNombre())
                .usuarioId(c.getUsuario().getId())
                .usuarioNombre(c.getUsuario().getNombre())
                .fecha(c.getFecha())
                .subtotal(c.getSubtotal())
                .impuesto(c.getImpuesto())
                .total(c.getTotal())
                .estado(c.getEstado())
                .detalles(detalles)
                .build();
    }
}