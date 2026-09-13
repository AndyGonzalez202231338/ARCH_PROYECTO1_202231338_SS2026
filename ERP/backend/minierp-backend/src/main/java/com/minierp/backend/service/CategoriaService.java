package com.minierp.backend.service;

import com.minierp.backend.dto.categoria.CategoriaRequest;
import com.minierp.backend.dto.categoria.CategoriaResponse;

import java.util.List;

public interface CategoriaService {
    List<CategoriaResponse> listar();
    CategoriaResponse obtener(Long id);
    CategoriaResponse crear(CategoriaRequest request);
    CategoriaResponse actualizar(Long id, CategoriaRequest request);
    void eliminar(Long id);
}