package com.minierp.backend.service;

import com.minierp.backend.dto.proveedor.ProveedorRequest;
import com.minierp.backend.dto.proveedor.ProveedorResponse;

import java.util.List;

public interface ProveedorService {
    List<ProveedorResponse> listar(Boolean activo, String texto);
    ProveedorResponse obtener(Long id);
    ProveedorResponse crear(ProveedorRequest request);
    ProveedorResponse actualizar(Long id, ProveedorRequest request);
    void desactivar(Long id);
    void activar(Long id);
}