package com.minierp.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
/**
 * Esta clase representa la tabla "usuarios" de PostgreSQL.
 *
 * La entidad NO contiene la lógica de login.
 * Su responsabilidad principal es representar los datos
 * almacenados en la base de datos.
 */
@Entity
@Table(name = "usuarios")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {
    /**
     * ID del usuario.
     *
     * En PostgreSQL corresponde a:
     * id BIGSERIAL PRIMARY KEY
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Nombre completo del usuario.
     */
    @Column(nullable = false, length = 100)
    private String nombre;

    /**
     * Correo utilizado para iniciar sesión.
     *
     * En la base de datos es UNIQUE.
     */
    @Column(nullable = false, unique = true, length = 150)
    private String email;

    /**
     * Guardamos únicamente el hash generado con BCrypt.
     */
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    /**
     * ID del área a la que pertenece el usuario.
     *
     * Por ahora lo manejamos como Long para mantener
     * sencillo el módulo de autenticación.
     *
     * Posteriormente podemos relacionarlo con Area.java
     * mediante @ManyToOne.
     */
    @Column(name = "area_id", nullable = false)
    private Long areaId;

    /**
     * Indica si el usuario puede utilizar el sistema.
     */
    @Column(nullable = false)
    private Boolean activo;
}
