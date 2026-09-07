package com.minierp.backend.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * DTO utilizado para recibir las credenciales
 * enviadas al endpoint de login.
 *
 * Ejemplo JSON:
 *
 * {
 *     "email": "ana.compras@minierp.com",
 *     "password": "password123"
 * }
 */
@Getter
@Setter
public class LoginRequest {

    /**
     * Correo del usuario.
     */
    private String email;

    /**
     * Contraseña SIN encriptar.
     *
     * Esto únicamente existe durante la petición.
     *
     * NO se guarda directamente en PostgreSQL.
     */
    private String password;
}