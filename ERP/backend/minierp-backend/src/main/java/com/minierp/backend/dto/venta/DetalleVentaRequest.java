package com.minierp.backend.dto.venta;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class DetalleVentaRequest {

    @NotNull(message = "El producto es obligatorio")
    private Long productoId;

    @NotNull
    @Min(value = 1, message = "La cantidad debe ser mayor a 0")
    private Integer cantidad;

    /** Opcional: si no se envía, se usa el precio_venta del producto. */
    @DecimalMin(value = "0.00")
    private BigDecimal precioUnitario;
}