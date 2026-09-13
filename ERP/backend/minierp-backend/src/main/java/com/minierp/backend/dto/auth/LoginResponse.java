package com.minierp.backend.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Respuesta que devolverá nuestra API después
 * de un login exitoso.
 */
@Getter
@AllArgsConstructor
public class LoginResponse {

    /**
     * Mensaje informativo.
     */
    private String message;

    /**
     * Correo del usuario autenticado.
     */
    private String email;

    private String rol;

    private String token;
}