package com.minierp.backend.service;

import com.minierp.backend.dto.cliente.ClienteRequest;
import com.minierp.backend.dto.cliente.ClienteResponse;

import java.util.List;

public interface ClienteService {
    List<ClienteResponse> listar(Boolean activo, String texto);
    ClienteResponse obtener(Long id);
    ClienteResponse crear(ClienteRequest request);
    ClienteResponse actualizar(Long id, ClienteRequest request);
    void desactivar(Long id);
    void activar(Long id);
}