package com.minierp.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

/**
 * Representa la tabla "usuarios" de PostgreSQL.
 *
 * La entidad NO contiene la lógica de login.
 * Solo representa los datos almacenados en la base de datos.
 */
@Entity
@Table(
    name = "usuarios",
    uniqueConstraints = @UniqueConstraint(name = "uk_usuarios_email", columnNames = "email")
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 120)
    @Column(nullable = false, length = 120)
    private String nombre;

    @NotBlank
    @Email
    @Size(max = 150)
    @Column(nullable = false, unique = true, length = 150)
    private String email;

    /**
     * Hash de la contraseña generado con BCrypt.
     * Nunca se expone al cliente.
     */
    @NotBlank
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    /**
     * Área/rol del usuario.
     * Relación N:1 con Area. FK: area_id.
     */
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "area_id",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_usuarios_area")
    )
    private Area area;

    @NotNull
    @Column(nullable = false)
    @Builder.Default
    private Boolean activo = true;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Usuario)) return false;
        Usuario that = (Usuario) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}