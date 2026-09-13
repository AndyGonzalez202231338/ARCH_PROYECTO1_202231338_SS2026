package com.minierp.backend.entity;

import com.minierp.backend.entity.enums.ReferenciaTipo;
import com.minierp.backend.entity.enums.TipoMovimiento;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Representa la tabla "movimientos_inventario" de PostgreSQL.
 *
 * Es el CORAZÓN de la trazabilidad del inventario. Cada vez que
 * un producto entra (compra recibida) o sale (venta completada),
 * se inserta una fila aquí.
 *
 * Permite:
 *  1. Calcular el stock actual de un producto sumando entradas
 *     y restando salidas (aunque productos.stock_actual se
 *     mantiene desnormalizado para consultas rápidas).
 *  2. Aplicar los métodos UEPS y PEPS mediante:
 *       - saldo_disponible (para ENTRADAS: cuánto queda del lote).
 *       - costo_unitario  (costo por unidad en ese movimiento).
 *  3. Auditar el origen de cada movimiento (referencia_tipo +
 *     referencia_id apuntan a la compra o venta que lo generó).
 *
 * Reglas de negocio:
 *  - No se puede generar un movimiento que deje stock negativo.
 *  - Para movimientos tipo ENTRADA, saldo_disponible = cantidad
 *    al momento de la inserción.
 *  - Para movimientos tipo SALIDA, saldo_disponible = 0.
 *  - El costo_unitario se calcula:
 *      * ENTRADA : precio de compra del producto en ese momento.
 *      * SALIDA  : costo calculado por UEPS/PEPS.
 */
@Entity
@Table(
    name = "movimientos_inventario",
    indexes = {
        @Index(name = "idx_movimientos_producto", columnList = "producto_id"),
        @Index(name = "idx_movimientos_referencia", columnList = "referencia_tipo, referencia_id"),
        @Index(name = "idx_movimientos_fecha", columnList = "fecha")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovimientoInventario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    /**
     * Producto afectado por el movimiento.
     * Relación N:1 con Producto. FK: producto_id.
     */
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "producto_id",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_movimientos_producto")
    )
    private Producto producto;

    /**
     * Tipo de movimiento: ENTRADA o SALIDA.
     */
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_movimiento", nullable = false, length = 10)
    private TipoMovimiento tipoMovimiento;

    @NotNull
    @Min(value = 1, message = "La cantidad debe ser mayor a 0")
    @Column(name = "cantidad", nullable = false)
    private Integer cantidad;

    /**
     * Para ENTRADAS: cantidad del lote que aún no se ha vendido.
     * Para SALIDAS: siempre 0.
     *
     * Este campo es esencial para aplicar UEPS/PEPS correctamente
     * al consumir lotes.
     */
    @NotNull
    @Min(value = 0)
    @Column(name = "saldo_disponible", nullable = false)
    @Builder.Default
    private Integer saldoDisponible = 0;

    /**
     * Costo por unidad en este movimiento.
     *  - ENTRADA : precio de compra del producto en ese momento.
     *  - SALIDA  : costo calculado por UEPS/PEPS.
     */
    @NotNull
    @DecimalMin("0.00")
    @Digits(integer = 10, fraction = 2)
    @Column(name = "costo_unitario", nullable = false, precision = 12, scale = 2)
    private BigDecimal costoUnitario;

    /**
     * Stock global del producto ANTES del movimiento.
     * Se guarda para auditoría histórica.
     */
    @NotNull
    @Min(value = 0)
    @Column(name = "stock_anterior", nullable = false)
    private Integer stockAnterior;

    /**
     * Stock global del producto DESPUÉS del movimiento.
     * Se guarda para auditoría histórica.
     */
    @NotNull
    @Min(value = 0)
    @Column(name = "stock_nuevo", nullable = false)
    private Integer stockNuevo;

    /**
     * Tipo de documento que origina el movimiento.
     * Relación polimórfica (no FK real) resuelta en el servicio.
     */
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "referencia_tipo", nullable = false, length = 10)
    private ReferenciaTipo referenciaTipo;

    /**
     * ID de la compra o venta que origina el movimiento.
     * No se mapea con @ManyToOne porque puede apuntar a
     * diferentes tablas según el referenciaTipo.
     */
    @NotNull
    @Column(name = "referencia_id", nullable = false)
    private Long referenciaId;

    /**
     * Usuario que registró el movimiento.
     * Relación N:1 con Usuario. FK: usuario_id.
     */
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "usuario_id",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_movimientos_usuario")
    )
    private Usuario usuario;

    /**
     * Fecha y hora del movimiento.
     * Se asigna automáticamente antes de persistir.
     */
    @Column(name = "fecha", nullable = false, updatable = false)
    private LocalDateTime fecha;

    // CALLBACKS JPA

    @PrePersist
    public void prePersist() {
        if (fecha == null) {
            fecha = LocalDateTime.now();
        }
    }

    /**
     * Indica si este movimiento corresponde a una entrada
     * proveniente de una compra.
     */
    @Transient
    public boolean esEntradaDeCompra() {
        return TipoMovimiento.ENTRADA.equals(tipoMovimiento)
                && ReferenciaTipo.COMPRA.equals(referenciaTipo);
    }

    /**
     * Indica si este movimiento corresponde a una salida
     * proveniente de una venta.
     */
    @Transient
    public boolean esSalidaDeVenta() {
        return TipoMovimiento.SALIDA.equals(tipoMovimiento)
                && ReferenciaTipo.VENTA.equals(referenciaTipo);
    }

    /**
     * Calcula el valor total del movimiento (cantidad * costoUnitario).
     * Útil para valorizaciones de inventario.
     */
    @Transient
    public BigDecimal getValorTotal() {
        if (cantidad == null || costoUnitario == null) {
            return BigDecimal.ZERO;
        }
        return costoUnitario.multiply(BigDecimal.valueOf(cantidad));
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof MovimientoInventario)) return false;
        MovimientoInventario that = (MovimientoInventario) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}