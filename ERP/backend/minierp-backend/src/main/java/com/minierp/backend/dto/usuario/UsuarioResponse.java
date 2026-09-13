package com.minierp.backend.dto.usuario;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Builder
public class UsuarioResponse {
    private Long id;
    private String nombre;
    private String email;
    private Long areaId;
    private String areaNombre;
    private Boolean activo;
}