package com.minierp.backend.controller;

import com.minierp.backend.dto.inventario.MovimientoInventarioResponse;
import com.minierp.backend.dto.inventario.StockProductoResponse;
import com.minierp.backend.service.InventarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/inventario")
@RequiredArgsConstructor
public class InventarioController {

    private final InventarioService inventarioService;

    /** Stock actual de todos los productos. */
    @GetMapping("/stock")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<StockProductoResponse>> listarStock() {
        return ResponseEntity.ok(inventarioService.listarStockActual());
    }

    /** Productos con bajo stock (stock <= umbral o stock_minimo). */
    @GetMapping("/bajo-stock")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMINISTRACION','ROLE_INVENTARIO','ROLE_COMPRAS')")
    public ResponseEntity<List<StockProductoResponse>> bajoStock(
            @RequestParam(required = false) Integer umbral) {
        return ResponseEntity.ok(inventarioService.productosBajoStock(umbral));
    }

    /** Historial de movimientos de un producto. */
    @GetMapping("/movimientos/{productoId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMINISTRACION','ROLE_INVENTARIO')")
    public ResponseEntity<List<MovimientoInventarioResponse>> historial(
            @PathVariable Long productoId) {
        return ResponseEntity.ok(inventarioService.historialDeProducto(productoId));
    }
}