package com.minierp.backend.service;

import com.minierp.backend.dto.auditoria.LogAuditoriaResponse;
import com.minierp.backend.entity.Usuario;

import java.time.LocalDateTime;
import java.util.List;

public interface AuditoriaService {

    /**
     * Registra una acción en el log de auditoría.
     * Se llama desde otros services después de operaciones de escritura.
     */
    void registrar(Usuario usuario, String modulo, String tipoAccion, String detalle);

    /**
     * Variante que obtiene la IP del request actual (opcional).
     */
    void registrarConIp(Usuario usuario, String modulo, String tipoAccion,
                        String detalle, String ipOrigen);

    /**
     * Consulta filtrada para el módulo de administración.
     */
    List<LogAuditoriaResponse> buscar(LocalDateTime fechaDesde,
                                      LocalDateTime fechaHasta,
                                      Long usuarioId,
                                      String modulo,
                                      String tipoAccion,
                                      String texto);
}

