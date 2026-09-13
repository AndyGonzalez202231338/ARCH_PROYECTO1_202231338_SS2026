package com.minierp.backend.dto.cliente;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class ClienteResponse {
    private Long id;
    private String nombre;
    private String tipoDocumento;
    private String numeroDocumento;
    private String telefono;
    private String email;
    private String direccion;
    private Boolean activo;
    private LocalDateTime createdAt;
}