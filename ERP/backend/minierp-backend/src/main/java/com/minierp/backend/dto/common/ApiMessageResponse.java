package com.minierp.backend.dto.common;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Respuesta simple para endpoints que solo confirman una acción
 * (ej. "Usuario desactivado correctamente").
 */
@Getter
@AllArgsConstructor
public class ApiMessageResponse {
    private final String message;
    private final boolean success;
}