package com.minierp.backend.dto.compra;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class DetalleCompraRequest {

    @NotNull(message = "El producto es obligatorio")
    private Long productoId;

    @NotNull
    @Min(value = 1, message = "La cantidad debe ser mayor a 0")
    private Integer cantidad;

    @NotNull
    @DecimalMin(value = "0.00", message = "El precio no puede ser negativo")
    private BigDecimal precioUnitario;
}