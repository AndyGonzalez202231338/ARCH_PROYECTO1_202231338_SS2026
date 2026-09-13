package com.minierp.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

/**
 * Representa la tabla "areas" de PostgreSQL.
 * Es un catálogo de roles del sistema: ADMINISTRACION, COMPRAS, VENTAS, INVENTARIO.
 */
@Entity
@Table(name = "areas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Area {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 30)
    @Column(nullable = false, unique = true, length = 30)
    private String nombre;

    @Size(max = 255)
    @Column(length = 255)
    private String descripcion;

    // Si luego quieres navegar desde Area hacia Usuarios:
    // @OneToMany(mappedBy = "area", fetch = FetchType.LAZY)
    // @Builder.Default
    // private List<Usuario> usuarios = new ArrayList<>();

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Area)) return false;
        Area that = (Area) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}