package com.minierp.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Representa la tabla "clientes" de PostgreSQL.
 *
 * Un cliente es una persona o empresa a la que se le comercializan
 * los productos. Cada venta está asociada a un único cliente.
 */
@Entity
@Table(
    name = "clientes",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_clientes_numero_documento", columnNames = "numero_documento")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotBlank
    @Size(max = 150)
    @Column(name = "nombre", nullable = false, length = 150)
    private String nombre;

    /**
     * Tipo de documento del cliente.
     * Valores comunes: CC, NIT, CE, PAS.
     */
    @NotBlank
    @Size(max = 10)
    @Column(name = "tipo_documento", nullable = false, length = 10)
    @Builder.Default
    private String tipoDocumento = "CC";

    /**
     * Número de documento único por cliente.
     */
    @NotBlank
    @Size(max = 30)
    @Column(name = "numero_documento", nullable = false, unique = true, length = 30)
    private String numeroDocumento;

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
     * Indica si el cliente sigue activo.
     * Se usa para soft delete: no se eliminan clientes con
     * historial de ventas para no perder trazabilidad.
     */
    @Column(name = "activo", nullable = false)
    @Builder.Default
    private Boolean activo = true;

    /**
     * Fecha y hora de creación del registro.
     * Se genera automáticamente al insertar.
     * Se marca como updatable = false para que no cambie tras la creación.
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Callback de JPA para asignar la fecha automáticamente
     * antes de insertar el registro.
     */
    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Cliente)) return false;
        Cliente that = (Cliente) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}