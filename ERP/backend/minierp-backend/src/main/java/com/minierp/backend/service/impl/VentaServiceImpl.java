package com.minierp.backend.service.impl;

import com.minierp.backend.dto.venta.*;
import com.minierp.backend.entity.*;
import com.minierp.backend.entity.enums.EstadoVenta;
import com.minierp.backend.exception.RecursoNoEncontradoException;
import com.minierp.backend.exception.ReglaNegocioException;
import com.minierp.backend.repository.ClienteRepository;
import com.minierp.backend.repository.ProductoRepository;
import com.minierp.backend.repository.VentaRepository;
import com.minierp.backend.service.AuditoriaService;
import com.minierp.backend.service.InventarioService;
import com.minierp.backend.service.PdfService;
import com.minierp.backend.service.VentaService;
import com.minierp.backend.util.UsuarioAutenticadoHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VentaServiceImpl implements VentaService {

    private final VentaRepository ventaRepository;
    private final ClienteRepository clienteRepository;
    private final ProductoRepository productoRepository;
    private final InventarioService inventarioService;
    private final PdfService pdfService;
    private final AuditoriaService auditoriaService;
    private final UsuarioAutenticadoHelper usuarioHelper;

    private static final String MODULO = "VENTAS";

    @Override
    @Transactional
    public VentaResponse registrar(VentaRequest request) {
        Usuario usuario = usuarioHelper.getUsuarioActual();

        Cliente cliente = clienteRepository.findById(request.getClienteId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Cliente no encontrado"));

        Venta venta = Venta.builder()
                .numeroVenta(generarNumero())
                .cliente(cliente)
                .usuario(usuario)
                .estado(EstadoVenta.PENDIENTE)
                .build();

        // Armar los detalles
        for (DetalleVentaRequest d : request.getDetalles()) {
            Producto producto = productoRepository.findById(d.getProductoId())
                    .orElseThrow(() -> new RecursoNoEncontradoException(
                            "Producto no encontrado: " + d.getProductoId()));

            // Validación temprana de stock
            if (!inventarioService.hayStockSuficiente(producto.getId(), d.getCantidad())) {
                throw new ReglaNegocioException(
                        "Stock insuficiente para " + producto.getNombre()
                        + ". Disponible: " + inventarioService.calcularStockActual(producto.getId())
                        + ", solicitado: " + d.getCantidad());
            }

            // Precio: el que viene o el del producto
            BigDecimal precio = d.getPrecioUnitario() != null
                    ? d.getPrecioUnitario()
                    : producto.getPrecioVenta();

            DetalleVenta detalle = DetalleVenta.builder()
                    .producto(producto)
                    .cantidad(d.getCantidad())
                    .precioUnitario(precio)
                    .build();

            venta.addDetalle(detalle);
        }

        // Al registrar la venta ya se marca como COMPLETADA
        venta.setEstado(EstadoVenta.COMPLETADA);
        Venta guardada = ventaRepository.save(venta);

        // Aplicar salidas al inventario con UEPS/PEPS
        for (DetalleVenta det : guardada.getDetalles()) {
            inventarioService.registrarSalida(
                    det.getProducto(),
                    det.getCantidad(),
                    guardada.getId(),
                    usuario);
        }

        auditoriaService.registrar(usuario, MODULO, "CREAR",
                "Venta " + guardada.getNumeroVenta()
                + " por Q" + guardada.getTotal()
                + " con método " + (usuario.getId() % 2 == 0 ? "PEPS" : "UEPS"));

        return toResponse(guardada);
    }

    @Override
    @Transactional(readOnly = true)
    public VentaResponse obtener(Long id) {
        Venta v = ventaRepository.findByIdConDetalles(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Venta no encontrada"));
        return toResponse(v);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VentaResumenResponse> listar(LocalDateTime desde, LocalDateTime hasta,
                                             Long clienteId) {
        return ventaRepository.filtrar(desde, hasta, clienteId, null).stream()
                .map(v -> new VentaResumenResponse(
                        v.getId(), v.getNumeroVenta(), v.getCliente().getNombre(),
                        v.getFecha(), v.getTotal(), v.getEstado()))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] generarFacturaPdf(Long ventaId) {
        Venta venta = ventaRepository.findByIdConDetalles(ventaId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Venta no encontrada"));
        return pdfService.generarFactura(venta);
    }

    private String generarNumero() {
        long siguiente = ventaRepository.count() + 1;
        return String.format("VEN-%04d", siguiente);
    }

    private VentaResponse toResponse(Venta v) {
        List<DetalleVentaResponse> detalles = v.getDetalles().stream()
                .map(d -> DetalleVentaResponse.builder()
                        .id(d.getId())
                        .productoId(d.getProducto().getId())
                        .productoCodigo(d.getProducto().getCodigo())
                        .productoNombre(d.getProducto().getNombre())
                        .cantidad(d.getCantidad())
                        .precioUnitario(d.getPrecioUnitario())
                        .subtotal(d.getSubtotal())
                        .build())
                .toList();

        return VentaResponse.builder()
                .id(v.getId())
                .numeroVenta(v.getNumeroVenta())
                .clienteId(v.getCliente().getId())
                .clienteNombre(v.getCliente().getNombre())
                .usuarioId(v.getUsuario().getId())
                .usuarioNombre(v.getUsuario().getNombre())
                .fecha(v.getFecha())
                .subtotal(v.getSubtotal())
                .impuesto(v.getImpuesto())
                .total(v.getTotal())
                .estado(v.getEstado())
                .detalles(detalles)
                .build();
    }
}