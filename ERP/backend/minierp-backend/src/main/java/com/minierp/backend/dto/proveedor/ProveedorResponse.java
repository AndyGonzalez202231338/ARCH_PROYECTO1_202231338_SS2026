package com.minierp.backend.dto.proveedor;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ProveedorResponse {
    private Long id;
    private String nombre;
    private String nit;
    private String telefono;
    private String email;
    private String direccion;
    private Boolean activo;
}