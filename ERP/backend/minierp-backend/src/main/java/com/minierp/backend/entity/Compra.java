package com.minierp.backend.entity;

import com.minierp.backend.entity.enums.EstadoCompra;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Representa la tabla "compras" de PostgreSQL.
 *
 * Una compra es la adquisición de uno o varios productos a un
 * proveedor. Cada compra genera movimientos de inventario de
 * tipo ENTRADA cuando su estado pasa a RECIBIDA.
 *
 * Reglas de negocio:
 *  - numero_compra es único.
 *  - subtotal + impuesto = total.
 *  - Cada compra tiene al menos un detalle.
 *  - Solo cuando el estado = RECIBIDA se afecta el inventario.
 *  - No se puede eliminar una compra: usar estado CANCELADA.
 */
@Entity
@Table(
    name = "compras",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_compras_numero_compra",
        columnNames = "numero_compra"
    ),
    indexes = {
        @Index(name = "idx_compras_proveedor", columnList = "proveedor_id"),
        @Index(name = "idx_compras_usuario", columnList = "usuario_id"),
        @Index(name = "idx_compras_fecha", columnList = "fecha")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Compra {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotBlank
    @Size(max = 20)
    @Column(name = "numero_compra", nullable = false, unique = true, length = 20)
    private String numeroCompra;

    /**
     * Proveedor al que se le realizó la compra.
     * Relación N:1 con Proveedor. FK: proveedor_id.
     */
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "proveedor_id",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_compras_proveedor")
    )
    private Proveedor proveedor;

    /**
     * Usuario del área de Compras que registró la operación.
     * Relación N:1 con Usuario. FK: usuario_id.
     */
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "usuario_id",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_compras_usuario")
    )
    private Usuario usuario;

    /**
     * Fecha y hora de la compra.
     * Se asigna automáticamente antes de persistir.
     */
    @Column(name = "fecha", nullable = false, updatable = false)
    private LocalDateTime fecha;

    @NotNull
    @DecimalMin("0.00")
    @Digits(integer = 12, fraction = 2)
    @Column(name = "subtotal", nullable = false, precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal subtotal = BigDecimal.ZERO;

    @NotNull
    @DecimalMin("0.00")
    @Digits(integer = 12, fraction = 2)
    @Column(name = "impuesto", nullable = false, precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal impuesto = BigDecimal.ZERO;

    @NotNull
    @DecimalMin("0.00")
    @Digits(integer = 12, fraction = 2)
    @Column(name = "total", nullable = false, precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal total = BigDecimal.ZERO;

    /**
     * Estado de la compra.
     * Al pasar a RECIBIDA, se debe cargar el inventario.
     * Al pasar a CANCELADA, no se afecta el inventario.
     */
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 20)
    @Builder.Default
    private EstadoCompra estado = EstadoCompra.PENDIENTE;

    /**
     * Detalles de la compra (líneas de producto).
     * Relación 1:N con DetalleCompra.
     * cascade = ALL + orphanRemoval = true para que al guardar
     * la compra se guarden sus detalles automáticamente.
     */
    @OneToMany(
        mappedBy = "compra",
        cascade = CascadeType.ALL,
        orphanRemoval = true,
        fetch = FetchType.LAZY
    )
    @Builder.Default
    private List<DetalleCompra> detalles = new ArrayList<>();

    // CALLBACKS JPA

    @PrePersist
    public void prePersist() {
        if (fecha == null) {
            fecha = LocalDateTime.now();
        }
        recalcularTotales();
    }

    @PreUpdate
    public void preUpdate() {
        recalcularTotales();
    }

    // MÉTODOS DE UTILIDAD

    /**
     * Agrega un detalle y mantiene la relación bidireccional.
     */
    public void addDetalle(DetalleCompra detalle) {
        detalles.add(detalle);
        detalle.setCompra(this);
    }

    /**
     * Quita un detalle y rompe la relación bidireccional.
     */
    public void removeDetalle(DetalleCompra detalle) {
        detalles.remove(detalle);
        detalle.setCompra(null);
    }

    /**
     * Recalcula subtotal, impuesto (19%) y total a partir
     * de los detalles. Se llama antes de guardar.
     */
    public void recalcularTotales() {
        BigDecimal nuevoSubtotal = detalles.stream()
                .map(DetalleCompra::getSubtotal)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        this.subtotal = nuevoSubtotal;
        this.impuesto = nuevoSubtotal.multiply(new BigDecimal("0.19"));
        this.total = this.subtotal.add(this.impuesto);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Compra)) return false;
        Compra that = (Compra) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}