package com.minierp.backend.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
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
    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "El correo no tiene un formato válido")
    private String email;

    /**
     * Contraseña SIN encriptar.
     *
     * Esto únicamente existe durante la petición.
     *
     * NO se guarda directamente en PostgreSQL.
     */
    @NotBlank(message = "La contraseña es obligatoria")
    private String password;
}