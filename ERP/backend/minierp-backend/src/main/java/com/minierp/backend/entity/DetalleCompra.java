package com.minierp.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * Representa la tabla "detalle_compras" de PostgreSQL.
 *
 * Cada fila representa una línea de una compra: qué producto,
 * en qué cantidad y a qué precio unitario se adquirió.
 *
 * El campo subtotal = cantidad * precioUnitario.
 */
@Entity
@Table(
    name = "detalle_compras",
    indexes = {
        @Index(name = "idx_detalle_compras_compra", columnList = "compra_id"),
        @Index(name = "idx_detalle_compras_producto", columnList = "producto_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DetalleCompra {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    /**
     * Compra a la que pertenece este detalle.
     * Relación N:1. FK: compra_id.
     */
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "compra_id",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_detalle_compras_compra")
    )
    private Compra compra;

    /**
     * Producto adquirido.
     * Relación N:1 con Producto. FK: producto_id.
     */
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "producto_id",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_detalle_compras_producto")
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
     * Si el usuario asigna cantidad y precioUnitario, el subtotal
     * se calcula solo.
     */
    @PrePersist
    @PreUpdate
    public void calcularSubtotal() {
        if (cantidad != null && precioUnitario != null) {
            this.subtotal = precioUnitario.multiply(BigDecimal.valueOf(cantidad))
                    .setScale(2, java.math.RoundingMode.HALF_UP);
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof DetalleCompra)) return false;
        DetalleCompra that = (DetalleCompra) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}