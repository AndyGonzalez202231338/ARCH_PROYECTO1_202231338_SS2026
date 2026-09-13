package com.minierp.backend.dto.proveedor;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProveedorRequest {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 150)
    private String nombre;

    @NotBlank(message = "El NIT es obligatorio")
    @Size(max = 30)
    private String nit;

    @Size(max = 30)
    private String telefono;

    @Email(message = "Formato de correo inválido")
    @Size(max = 150)
    private String email;

    @Size(max = 255)
    private String direccion;

    private Boolean activo;
}