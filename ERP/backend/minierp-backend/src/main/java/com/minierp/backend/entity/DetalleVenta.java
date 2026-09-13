package com.minierp.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * Representa la tabla "detalle_ventas" de PostgreSQL.
 *
 * Cada fila representa una línea de una venta: qué producto,
 * en qué cantidad y a qué precio unitario se vendió.
 *
 * El campo subtotal = cantidad * precioUnitario.
 *
 * El precioUnitario se guarda tal cual estaba en el momento
 * de la venta. Así los reportes históricos no se ven afectados
 * si el precio del producto cambia después.
 */
@Entity
@Table(
    name = "detalle_ventas",
    indexes = {
        @Index(name = "idx_detalle_ventas_venta", columnList = "venta_id"),
        @Index(name = "idx_detalle_ventas_producto", columnList = "producto_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DetalleVenta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    /**
     * Venta a la que pertenece este detalle.
     * Relación N:1. FK: venta_id.
     */
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "venta_id",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_detalle_ventas_venta")
    )
    private Venta venta;

    /**
     * Producto vendido.
     * Relación N:1 con Producto. FK: producto_id.
     */
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "producto_id",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_detalle_ventas_producto")
    )
    private Producto producto;

    @NotNull
    @Min(value = 1, message = "La cantidad debe ser mayor a 0")
    @Column(name = "cantidad", nullable = false)
    private Integer cantidad;

    @NotNull
    @DecimalMin("0.00")
    @Digits(integer = 10, fraction = 2)
    @Column(name = "precio_unitario", nullable = false, precision = 12, scale = 2)
    private BigDecimal precioUnitario;

    @NotNull
    @DecimalMin("0.00")
    @Digits(integer = 12, fraction = 2)
    @Column(name = "subtotal", nullable = false, precision = 14, scale = 2)
    private BigDecimal subtotal;

    // CALLBACKS JPA

    /**
     * Calcula el subtotal antes de insertar o actualizar.
     * Si cantidad y precioUnitario están seteados, el subtotal
     * se calcula solo.
     */
    @PrePersist
    @PreUpdate
    public void calcularSubtotal() {
        if (cantidad != null && precioUnitario != null) {
            this.subtotal = precioUnitario.multiply(BigDecimal.valueOf(cantidad));
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof DetalleVenta)) return false;
        DetalleVenta that = (DetalleVenta) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}