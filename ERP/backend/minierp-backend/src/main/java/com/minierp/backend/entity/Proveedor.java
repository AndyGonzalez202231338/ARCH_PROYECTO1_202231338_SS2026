package com.minierp.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

/**
 * Representa la tabla "proveedores" de PostgreSQL.
 *
 * Un proveedor es una empresa o persona que suministra productos
 * a la empresa. Un mismo producto puede ser adquirido a varios
 * proveedores (relación M:N resuelta a través de COMPRA).
 */
@Entity
@Table(
    name = "proveedores",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_proveedores_nit", columnNames = "nit")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Proveedor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotBlank
    @Size(max = 150)
    @Column(name = "nombre", nullable = false, length = 150)
    private String nombre;

    /**
     * NIT (Número de Identificación Tributaria).
     * Es único para cada proveedor.
     */
    @NotBlank
    @Size(max = 30)
    @Column(name = "nit", nullable = false, unique = true, length = 30)
    private String nit;

    @Size(max = 30)
    @Column(name = "telefono", length = 30)
    private String telefono;

    @Email
    @Size(max = 150)
    @Column(name = "email", length = 150)
    private String email;

    @Size(max = 255)
    @Column(name = "direccion", length = 255)
    private String direccion;

    /**
     * Indica si el proveedor sigue activo.
     * Se usa para soft delete: no se eliminan proveedores con
     * historial de compras para no perder trazabilidad.
     */
    @Column(name = "activo", nullable = false)
    @Builder.Default
    private Boolean activo = true;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Proveedor)) return false;
        Proveedor that = (Proveedor) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}