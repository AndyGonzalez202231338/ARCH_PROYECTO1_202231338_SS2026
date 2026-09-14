package com.minierp.backend.service;

import com.minierp.backend.dto.inventario.MovimientoInventarioResponse;
import com.minierp.backend.dto.inventario.StockProductoResponse;
import com.minierp.backend.entity.Producto;
import com.minierp.backend.entity.Usuario;

import java.math.BigDecimal;
import java.util.List;

public interface InventarioService {

    /**
     * Registra una ENTRADA de inventario desde una compra recibida.
     * El costo unitario es el precio de compra.
     *
     * @return el movimiento creado
     */
    MovimientoInventarioResponse registrarEntrada(
            Producto producto,
            int cantidad,
            BigDecimal costoUnitario,
            Long compraId,
            Usuario usuario
    );

    /**
     * Registra una SALIDA de inventario desde una venta completada.
     * Aplica UEPS o PEPS según la paridad del ID del usuario.
     *
     * Este método:
     *   1. Valida que hay stock suficiente.
     *   2. Selecciona y consume lotes según el método.
     *   3. Calcula el costo total de la salida.
     *   4. Actualiza el stock del producto.
     *   5. Crea UN movimiento SALIDA con el costo calculado.
     *   6. Descuenta los saldos_disponibles de los lotes consumidos.
     *
     * @return el movimiento creado
     */
    MovimientoInventarioResponse registrarSalida(
            Producto producto,
            int cantidad,
            Long ventaId,
            Usuario usuario
    );

    /**
     * Calcula el stock actual de un producto sumando saldos disponibles.
     * Útil para validaciones previas.
     */
    int calcularStockActual(Long productoId);

    /**
     * Verifica si hay stock suficiente para una venta.
     */
    boolean hayStockSuficiente(Long productoId, int cantidad);

    /**
     * Devuelve el stock actual de todos los productos.
     */
    List<StockProductoResponse> listarStockActual();

    /**
     * Historial de movimientos de un producto.
     */
    List<MovimientoInventarioResponse> historialDeProducto(Long productoId);

    /**
     * Lista productos con stock <= umbral.
     */
    List<StockProductoResponse> productosBajoStock(Integer umbral);
}