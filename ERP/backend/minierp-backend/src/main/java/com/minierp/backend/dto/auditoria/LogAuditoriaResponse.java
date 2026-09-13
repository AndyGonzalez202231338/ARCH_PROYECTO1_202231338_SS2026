package com.minierp.backend.dto.auditoria;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class LogAuditoriaResponse {
    private Long id;
    private Long usuarioId;
    private String usuarioNombre;
    private LocalDateTime fecha;
    private String modulo;
    private String tipoAccion;
    private String detalle;
    private String ipOrigen;
}