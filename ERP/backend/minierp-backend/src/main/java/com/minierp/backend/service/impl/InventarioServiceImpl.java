package com.minierp.backend.service.impl;

import com.minierp.backend.dto.inventario.MovimientoInventarioResponse;
import com.minierp.backend.dto.inventario.StockProductoResponse;
import com.minierp.backend.entity.MovimientoInventario;
import com.minierp.backend.entity.Producto;
import com.minierp.backend.entity.Usuario;
import com.minierp.backend.entity.enums.ReferenciaTipo;
import com.minierp.backend.entity.enums.TipoMovimiento;
import com.minierp.backend.exception.ReglaNegocioException;
import com.minierp.backend.exception.RecursoNoEncontradoException;
import com.minierp.backend.repository.MovimientoInventarioRepository;
import com.minierp.backend.repository.ProductoRepository;
import com.minierp.backend.service.InventarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InventarioServiceImpl implements InventarioService {

    private final MovimientoInventarioRepository movimientoRepository;
    private final ProductoRepository productoRepository;

    /**
     *  REGISTRAR ENTRADA (desde compra)
     * Una entrada representa un LOTE que entra al inventario.
     * Se guarda saldo_disponible = cantidad porque aún no se ha
     * vendido ninguna unidad de este lote.
     *
     * El costo_unitario es el precio de compra real de este lote.
     * Este dato es crítico para que UEPS/PEPS puedan calcular el
     * costo de las ventas futuras.
     */
    @Override
    @Transactional
    public MovimientoInventarioResponse registrarEntrada(
            Producto producto,
            int cantidad,
            BigDecimal costoUnitario,
            Long compraId,
            Usuario usuario) {

        if (cantidad <= 0) {
            throw new ReglaNegocioException("La cantidad debe ser mayor a cero");
        }
        if (costoUnitario == null || costoUnitario.signum() < 0) {
            throw new ReglaNegocioException("El costo unitario no puede ser negativo");
        }

        int stockAnterior = producto.getStockActual();
        int stockNuevo = stockAnterior + cantidad;

        MovimientoInventario mov = MovimientoInventario.builder()
                .producto(producto)
                .tipoMovimiento(TipoMovimiento.ENTRADA)
                .cantidad(cantidad)
                .saldoDisponible(cantidad)   // lote completo disponible
                .costoUnitario(costoUnitario)
                .stockAnterior(stockAnterior)
                .stockNuevo(stockNuevo)
                .referenciaTipo(ReferenciaTipo.COMPRA)
                .referenciaId(compraId)
                .usuario(usuario)
                .build();

        MovimientoInventario guardado = movimientoRepository.save(mov);

        // Actualizar stock desnormalizado del producto
        producto.setStockActual(stockNuevo);
        productoRepository.save(producto);

        return toResponse(guardado);
    }

    /**
     * REGISTRAR SALIDA (desde venta) UEPS / PEPS
     * Este es el método más importante del sistema.
     *
     * PASOS:
     *   1. Validar que el stock total del producto alcance.
     *   2. Elegir el método (UEPS o PEPS) según la paridad del ID del usuario.
     *   3. Obtener los lotes disponibles ordenados según el método.
     *      Se obtienen con PESSIMISTIC_WRITE para bloquear las filas
     *      y evitar que dos ventas concurrentes consuman el mismo lote.
     *   4. Iterar los lotes consumiendo la cantidad necesaria.
     *   5. Acumular el costo real de la salida.
     *   6. Crear UN movimiento SALIDA con el costo total.
     *   7. Actualizar stock desnormalizado del producto.
     */
    @Override
    @Transactional
    public MovimientoInventarioResponse registrarSalida(
            Producto producto,
            int cantidad,
            Long ventaId,
            Usuario usuario) {

        if (cantidad <= 0) {
            throw new ReglaNegocioException("La cantidad debe ser mayor a cero");
        }

        // Validar stock 
        int stockTotal = calcularStockActual(producto.getId());
        if (stockTotal < cantidad) {
            throw new ReglaNegocioException(
                    "Stock insuficiente para " + producto.getNombre()
                    + ". Disponible: " + stockTotal + ", solicitado: " + cantidad);
        }

        // Determinar método 
        // Paridad del ID del usuario que registra la venta
        boolean usaPEPS = usuario.getId() % 2 == 0;
        String metodo = usaPEPS ? "PEPS" : "UEPS";

        // Obtener lotes bloqueados
        // El repositorio usa @Lock(PESSIMISTIC_WRITE) para bloquear
        // las filas y evitar condiciones de carrera.
        List<MovimientoInventario> lotes = usaPEPS
                ? movimientoRepository.findLotesDisponiblesPEPS(producto.getId())
                : movimientoRepository.findLotesDisponiblesUEPS(producto.getId());

        // Consumir lotes y acumular costo
        int restante = cantidad;
        BigDecimal costoTotal = BigDecimal.ZERO;
        List<MovimientoInventario> lotesModificados = new ArrayList<>();

        for (MovimientoInventario lote : lotes) {
            if (restante == 0) break;

            int disponibleEnLote = lote.getSaldoDisponible();
            int aConsumir = Math.min(disponibleEnLote, restante);

            // Acumular costo real de esta porción
            costoTotal = costoTotal.add(
                    lote.getCostoUnitario().multiply(BigDecimal.valueOf(aConsumir)));

            // Actualizar saldo del lote
            lote.setSaldoDisponible(disponibleEnLote - aConsumir);
            lotesModificados.add(lote);

            restante -= aConsumir;
        }

        if (restante > 0) {
            // Esto no debería pasar porque validamos antes, pero por seguridad
            throw new ReglaNegocioException(
                    "Error de consistencia: no se pudo cubrir la cantidad solicitada");
        }

        // Guardar los lotes modificados
        movimientoRepository.saveAll(lotesModificados);

        // Crear movimiento de SALIDA 
        // Costo unitario promedio ponderado de la salida
        BigDecimal costoUnitarioPromedio = costoTotal
                .divide(BigDecimal.valueOf(cantidad), 2, RoundingMode.HALF_UP);

        int stockAnterior = producto.getStockActual();
        int stockNuevo = stockAnterior - cantidad;

        MovimientoInventario salida = MovimientoInventario.builder()
                .producto(producto)
                .tipoMovimiento(TipoMovimiento.SALIDA)
                .cantidad(cantidad)
                .saldoDisponible(0)   // las salidas no tienen saldo
                .costoUnitario(costoUnitarioPromedio)
                .stockAnterior(stockAnterior)
                .stockNuevo(stockNuevo)
                .referenciaTipo(ReferenciaTipo.VENTA)
                .referenciaId(ventaId)
                .usuario(usuario)
                .build();

        MovimientoInventario guardado = movimientoRepository.save(salida);

        // -Actualizar stock desnormalizado
        producto.setStockActual(stockNuevo);
        productoRepository.save(producto);

        return toResponse(guardado);
    }

    // CONSULTAS
    @Override
    @Transactional(readOnly = true)
    public int calcularStockActual(Long productoId) {
        Integer total = movimientoRepository.sumSaldoDisponibleByProducto(productoId);
        return total == null ? 0 : total;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hayStockSuficiente(Long productoId, int cantidad) {
        return calcularStockActual(productoId) >= cantidad;
    }

    @Override
    @Transactional(readOnly = true)
    public List<StockProductoResponse> listarStockActual() {
        return productoRepository.findAll().stream()
                .map(p -> new StockProductoResponse(
                        p.getId(),
                        p.getCodigo(),
                        p.getNombre(),
                        p.getCategoria().getNombre(),
                        p.getStockActual(),
                        p.getStockMinimo(),
                        p.tieneBajoStock()))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<MovimientoInventarioResponse> historialDeProducto(Long productoId) {
        return movimientoRepository
                .findHistorialByProducto(productoId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<StockProductoResponse> productosBajoStock(Integer umbral) {
        return productoRepository.findProductosBajoStock(umbral).stream()
                .map(p -> new StockProductoResponse(
                        p.getId(),
                        p.getCodigo(),
                        p.getNombre(),
                        p.getCategoria().getNombre(),
                        p.getStockActual(),
                        p.getStockMinimo(),
                        true))
                .toList();
    }

    // MAPPER
    private MovimientoInventarioResponse toResponse(MovimientoInventario m) {
        return MovimientoInventarioResponse.builder()
                .id(m.getId())
                .productoId(m.getProducto().getId())
                .productoCodigo(m.getProducto().getCodigo())
                .productoNombre(m.getProducto().getNombre())
                .tipoMovimiento(m.getTipoMovimiento())
                .cantidad(m.getCantidad())
                .saldoDisponible(m.getSaldoDisponible())
                .costoUnitario(m.getCostoUnitario())
                .stockAnterior(m.getStockAnterior())
                .stockNuevo(m.getStockNuevo())
                .referenciaTipo(m.getReferenciaTipo())
                .referenciaId(m.getReferenciaId())
                .usuarioId(m.getUsuario().getId())
                .usuarioNombre(m.getUsuario().getNombre())
                .fecha(m.getFecha())
                .build();
    }
}