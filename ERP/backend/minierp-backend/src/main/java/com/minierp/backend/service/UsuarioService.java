package com.minierp.backend.service;

import com.minierp.backend.dto.usuario.UsuarioRequest;
import com.minierp.backend.dto.usuario.UsuarioResponse;

import java.util.List;

public interface UsuarioService {
    List<UsuarioResponse> listar(Long areaId, Boolean activo, String texto);
    UsuarioResponse obtener(Long id);
    UsuarioResponse crear(UsuarioRequest request);
    UsuarioResponse actualizar(Long id, UsuarioRequest request);
    void cambiarPassword(Long id, String nuevaPassword);
    void activar(Long id);
    void desactivar(Long id, Long usuarioActualId);
}