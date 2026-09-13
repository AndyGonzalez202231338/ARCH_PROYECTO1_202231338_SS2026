package com.minierp.backend.dto.cliente;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ClienteRequest {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 150)
    private String nombre;

    @NotBlank(message = "El tipo de documento es obligatorio")
    @Size(max = 10)
    private String tipoDocumento;

    @NotBlank(message = "El número de documento es obligatorio")
    @Size(max = 30)
    private String numeroDocumento;

    @Size(max = 30)
    private String telefono;

    @Email(message = "Formato de correo inválido")
    @Size(max = 150)
    private String email;

    @Size(max = 255)
    private String direccion;

    private Boolean activo;
}