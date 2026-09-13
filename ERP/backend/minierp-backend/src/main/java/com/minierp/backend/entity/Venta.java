package com.minierp.backend.entity;

import com.minierp.backend.entity.enums.EstadoVenta;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Representa la tabla "ventas" de PostgreSQL.
 *
 * Una venta es la comercialización de uno o varios productos a un
 * cliente. Cada venta genera movimientos de inventario de tipo
 * SALIDA cuando su estado pasa a COMPLETADA.
 *
 * Reglas de negocio asociadas:
 *  - numero_venta es único.
 *  - subtotal + impuesto = total.
 *  - Cada venta tiene al menos un detalle.
 *  - Antes de confirmar la venta se debe validar stock suficiente.
 *  - Al pasar a COMPLETADA se genera factura PDF y se descuenta
 *    el inventario (aplicando UEPS o PEPS según la paridad del
 *    id del usuario que registra).
 *  - No se eliminan ventas: solo se cancelan (estado CANCELADA).
 */
@Entity
@Table(
    name = "ventas",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_ventas_numero_venta",
        columnNames = "numero_venta"
    ),
    indexes = {
        @Index(name = "idx_ventas_cliente", columnList = "cliente_id"),
        @Index(name = "idx_ventas_usuario", columnList = "usuario_id"),
        @Index(name = "idx_ventas_fecha", columnList = "fecha")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Venta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotBlank
    @Size(max = 20)
    @Column(name = "numero_venta", nullable = false, unique = true, length = 20)
    private String numeroVenta;

    /**
     * Cliente al que se le realizó la venta.
     * Relación N:1 con Cliente. FK: cliente_id.
     */
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "cliente_id",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_ventas_cliente")
    )
    private Cliente cliente;

    /**
     * Usuario del área de Ventas que registró la operación.
     * La paridad de su id determina el método de valoración
     * de inventario aplicado (impar -> UEPS, par -> PEPS).
     */
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "usuario_id",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_ventas_usuario")
    )
    private Usuario usuario;

    /**
     * Fecha y hora de la venta.
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
     * Estado de la venta.
     * Al pasar a COMPLETADA se descuenta stock y se emite factura.
     * Al pasar a CANCELADA no se afecta el inventario.
     */
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 20)
    @Builder.Default
    private EstadoVenta estado = EstadoVenta.PENDIENTE;

    /**
     * Detalles de la venta (líneas de producto).
     * Relación 1:N con DetalleVenta.
     * cascade = ALL + orphanRemoval = true para que al guardar
     * la venta se guarden sus detalles automáticamente.
     */
    @OneToMany(
        mappedBy = "venta",
        cascade = CascadeType.ALL,
        orphanRemoval = true,
        fetch = FetchType.LAZY
    )
    @Builder.Default
    private List<DetalleVenta> detalles = new ArrayList<>();

    // =========================================================
    // CALLBACKS JPA
    // =========================================================

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

    // =========================================================
    // MÉTODOS DE UTILIDAD
    // =========================================================

    /**
     * Agrega un detalle manteniendo la relación bidireccional.
     */
    public void addDetalle(DetalleVenta detalle) {
        detalles.add(detalle);
        detalle.setVenta(this);
    }

    /**
     * Quita un detalle rompiendo la relación bidireccional.
     */
    public void removeDetalle(DetalleVenta detalle) {
        detalles.remove(detalle);
        detalle.setVenta(null);
    }

    /**
     * Recalcula subtotal, impuesto (19%) y total a partir
     * de los detalles. Se ejecuta antes de cada save.
     */
    public void recalcularTotales() {
        BigDecimal nuevoSubtotal = detalles.stream()
                .map(DetalleVenta::getSubtotal)
                .filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        this.subtotal = nuevoSubtotal;
        this.impuesto = nuevoSubtotal.multiply(new BigDecimal("0.19"));
        this.total = this.subtotal.add(this.impuesto);
    }

    /**
     * Indica si la venta ya fue completada.
     * Se usa para bloquear modificaciones posteriores.
     */
    @Transient
    public boolean estaCompletada() {
        return EstadoVenta.COMPLETADA.equals(this.estado);
    }

    /**
     * Indica si la venta fue cancelada.
     */
    @Transient
    public boolean estaCancelada() {
        return EstadoVenta.ANULADA.equals(this.estado);
    }

    // =========================================================
    // equals y hashCode
    // =========================================================
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Venta)) return false;
        Venta that = (Venta) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}