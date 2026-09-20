package com.minierp.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(
    name = "productos",
    uniqueConstraints = @UniqueConstraint(name = "uk_productos_codigo", columnNames = "codigo"),
    indexes = {
        @Index(name = "idx_productos_categoria", columnList = "categoria_id"),
        @Index(name = "idx_productos_nombre", columnList = "nombre")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 20)
    @Column(nullable = false, unique = true, length = 20)
    private String codigo;

    @NotBlank
    @Size(max = 150)
    @Column(nullable = false, length = 150)
    private String nombre;

    @Size(max = 500)
    @Column(length = 500)
    private String descripcion;

    /**
     * Relación N:1 con Categoria (FK categoria_id).
     */
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "categoria_id",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_productos_categoria")
    )
    private Categoria categoria;

    @NotNull
    @DecimalMin("0.00")
    @Digits(integer = 10, fraction = 2)
    @Column(name = "precio_compra", nullable = false, precision = 12, scale = 2)
    private BigDecimal precioCompra;

    @NotNull
    @DecimalMin("0.00")
    @Digits(integer = 10, fraction = 2)
    @Column(name = "precio_venta", nullable = false, precision = 12, scale = 2)
    private BigDecimal precioVenta;

    @NotBlank
    @Size(max = 20)
    @Column(name = "unidad_medida", nullable = false, length = 20)
    @Builder.Default
    private String unidadMedida = "UND";

    @NotNull
    @Min(0)
    @Column(name = "stock_actual", nullable = false)
    @Builder.Default
    private Integer stockActual = 0;

    @NotNull
    @Min(0)
    @Column(name = "stock_minimo", nullable = false)
    @Builder.Default
    private Integer stockMinimo = 5;

    @NotNull
    @Column(nullable = false)
    @Builder.Default
    private Boolean activo = true;

    // ------- métodos auxiliares (no persistidos) -------

    @Transient
    public boolean tieneBajoStock() {
        return stockActual != null && stockMinimo != null && stockActual <= stockMinimo;
    }

    @Transient
    public boolean tieneStockSuficiente(int cantidad) {
        return stockActual != null && stockActual >= cantidad;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Producto)) return false;
        Producto that = (Producto) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}