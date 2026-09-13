package com.minierp.backend.dto.area;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AreaResponse {
    private Long id;
    private String nombre;
    private String descripcion;
}