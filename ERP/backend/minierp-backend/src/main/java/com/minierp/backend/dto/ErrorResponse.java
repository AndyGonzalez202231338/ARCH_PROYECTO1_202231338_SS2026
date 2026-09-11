package com.minierp.backend.dto;

import lombok.Getter;

import java.time.Instant;

/**
 * Estructura estándar de error que devuelve la API.
 * El frontend puede leer directamente `message` para mostrarlo al usuario.
 *
 * Ejemplo JSON:
 * {
 *   "timestamp": "2026-09-10T15:32:00Z",
 *   "status": 401,
 *   "error": "Unauthorized",
 *   "message": "Correo o contraseña incorrectos",
 *   "path": "/api/auth/login"
 * }
 */
@Getter
public class ErrorResponse {

    private final Instant timestamp = Instant.now();
    private final int status;
    private final String error;
    private final String message;
    private final String path;

    public ErrorResponse(int status, String error, String message, String path) {
        this.status = status;
        this.error = error;
        this.message = message;
        this.path = path;
    }
}