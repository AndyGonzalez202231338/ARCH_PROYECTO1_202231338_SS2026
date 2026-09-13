package com.minierp.backend.util;

import com.minierp.backend.entity.Usuario;
import com.minierp.backend.exception.RecursoNoEncontradoException;
import com.minierp.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UsuarioAutenticadoHelper {

    private final UsuarioRepository usuarioRepository;

    /**
     * Devuelve el usuario autenticado en el contexto actual.
     * Útil para pasar como referencia en compras, ventas y auditoría.
     */
    public Usuario getUsuarioActual() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return usuarioRepository.findByEmailWithArea(email)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Usuario autenticado no encontrado"));
    }

    /**
     * Devuelve el ID del usuario autenticado.
     * Más liviano cuando solo necesitas el ID para auditoría.
     */
    public Long getUsuarioActualId() {
        return getUsuarioActual().getId();
    }
}