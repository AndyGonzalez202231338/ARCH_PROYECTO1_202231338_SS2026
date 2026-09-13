package com.minierp.backend.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Lo que devuelve GET /api/usuarios/me: los datos del usuario
 * autenticado actualmente (extraídos del JWT + la tabla usuarios).
 */
@Getter
@AllArgsConstructor
public class UsuarioMeResponse {
    private final String nombre;
    private final String email;
    private final String rol;
}