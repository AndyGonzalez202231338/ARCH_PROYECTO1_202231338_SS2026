package com.minierp.backend.dto.compra;

import com.minierp.backend.entity.enums.EstadoCompra;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CompraRequest {

    /** Opcional: si no se envía, el backend genera uno (COM-XXXX). */
    private String numeroCompra;

    @NotNull(message = "El proveedor es obligatorio")
    private Long proveedorId;

    /** Opcional: por defecto PENDIENTE. */
    private EstadoCompra estado;

    @NotEmpty(message = "La compra debe tener al menos un producto")
    @Valid
    private List<DetalleCompraRequest> detalles;
}