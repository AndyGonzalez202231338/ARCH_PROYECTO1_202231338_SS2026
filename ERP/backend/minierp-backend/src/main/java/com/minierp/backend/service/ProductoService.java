package com.minierp.backend.service;

import com.minierp.backend.dto.producto.ProductoRequest;
import com.minierp.backend.dto.producto.ProductoResponse;

import java.util.List;

public interface ProductoService {
    List<ProductoResponse> listar(Long categoriaId, Boolean activo, String texto);
    ProductoResponse obtener(Long id);
    ProductoResponse crear(ProductoRequest request);
    ProductoResponse actualizar(Long id, ProductoRequest request);
    void desactivar(Long id);
    void activar(Long id);
}