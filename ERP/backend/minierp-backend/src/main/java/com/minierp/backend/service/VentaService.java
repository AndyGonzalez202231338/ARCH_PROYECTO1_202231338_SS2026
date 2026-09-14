package com.minierp.backend.service;

import com.minierp.backend.dto.venta.VentaRequest;
import com.minierp.backend.dto.venta.VentaResponse;
import com.minierp.backend.dto.venta.VentaResumenResponse;

import java.time.LocalDateTime;
import java.util.List;

public interface VentaService {
    VentaResponse registrar(VentaRequest request);
    VentaResponse obtener(Long id);
    List<VentaResumenResponse> listar(LocalDateTime desde, LocalDateTime hasta, Long clienteId);
    byte[] generarFacturaPdf(Long ventaId);
}