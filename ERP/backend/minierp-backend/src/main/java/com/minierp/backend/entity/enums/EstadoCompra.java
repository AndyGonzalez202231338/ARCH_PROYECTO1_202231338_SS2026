package com.minierp.backend.entity.enums;

/**
 * Estados posibles del ciclo de vida de una Compra.
 * EstadoCompra
 * PENDIENTE : se registró pero aún no se recibe/paga por completo.
 * COMPLETADA : la compra se concretó; el stock del producto ya se
 *               aumentó.
 * ANULADA : la compra no se concretó; no afecta el stock.
 */
public enum EstadoCompra {
    PENDIENTE,
    COMPLETADA,
    ANULADA
}