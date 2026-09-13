package com.minierp.backend.entity.enums;
 
/**
 * Tipo de movimiento de inventario.
 *
 * ENTRADA : aumenta el stock (compra recibida, ajuste manual positivo,
 *            devolución de un cliente).
 * SALIDA  : disminuye el stock (venta completada, ajuste manual
 *            negativo, producto dañado/dado de baja).
 */
public enum TipoMovimiento {
    ENTRADA,
    SALIDA
}