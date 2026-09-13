package com.minierp.backend.entity.enums;
 
/**
 * Estados posibles del ciclo de vida de una Venta.
 *
 * PENDIENTE : se registró pero aún no se entrega/cobra por completo.
 * COMPLETADA : la venta se concretó; el stock del producto ya se
 *               descontó.
 * CANCELADA : la venta no se concretó; no afecta el stock.
 */
public enum EstadoVenta {
    COMPLETADA,
    PENDIENTE,
    ANULADA
}