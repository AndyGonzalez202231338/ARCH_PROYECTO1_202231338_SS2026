package com.minierp.backend.service;

import com.minierp.backend.dto.compra.CompraRequest;
import com.minierp.backend.dto.compra.CompraResponse;
import com.minierp.backend.dto.compra.CompraResumenResponse;
import com.minierp.backend.entity.enums.EstadoCompra;

import java.time.LocalDateTime;
import java.util.List;

public interface CompraService {
    CompraResponse registrar(CompraRequest request);
    CompraResponse obtener(Long id);
    List<CompraResumenResponse> listar(LocalDateTime desde, LocalDateTime hasta, Long proveedorId);
    CompraResponse cambiarEstado(Long id, EstadoCompra nuevoEstado);
}