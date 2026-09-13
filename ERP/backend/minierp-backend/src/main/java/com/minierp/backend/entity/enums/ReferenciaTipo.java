package com.minierp.backend.entity.enums;

/**
 * Tipo de documento que origina un movimiento de inventario.
 *
 * COMPRA : el movimiento viene de una compra recibida.
 * VENTA  : el movimiento viene de una venta completada.
 *
 * Coincide con el CHECK de la columna referencia_tipo en
 * la tabla movimientos_inventario.
 */
public enum ReferenciaTipo {
    COMPRA,
    VENTA
}