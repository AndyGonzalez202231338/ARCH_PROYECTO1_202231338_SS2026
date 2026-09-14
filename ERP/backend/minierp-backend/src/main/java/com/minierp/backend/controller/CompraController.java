package com.minierp.backend.controller;

import com.minierp.backend.dto.compra.CompraRequest;
import com.minierp.backend.dto.compra.CompraResponse;
import com.minierp.backend.dto.compra.CompraResumenResponse;
import com.minierp.backend.entity.enums.EstadoCompra;
import com.minierp.backend.service.CompraService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/compras")
@RequiredArgsConstructor
public class CompraController {

    private final CompraService compraService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMINISTRACION','ROLE_COMPRAS')")
    public ResponseEntity<List<CompraResumenResponse>> listar(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime desde,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime hasta,
            @RequestParam(required = false) Long proveedorId) {
        return ResponseEntity.ok(compraService.listar(desde, hasta, proveedorId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMINISTRACION','ROLE_COMPRAS')")
    public ResponseEntity<CompraResponse> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(compraService.obtener(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_COMPRAS')")
    public ResponseEntity<CompraResponse> registrar(
            @Valid @RequestBody CompraRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(compraService.registrar(request));
    }

    /**
     * Cambiar el estado de una compra (ej. PENDIENTE -> RECIBIDA).
     * Al pasar a RECIBIDA se aplican las entradas al inventario.
     * Body: { "estado": "RECIBIDA" }
     */
    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasAuthority('ROLE_COMPRAS')")
    public ResponseEntity<CompraResponse> cambiarEstado(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        EstadoCompra nuevoEstado = EstadoCompra.valueOf(body.get("estado").toUpperCase());
        return ResponseEntity.ok(compraService.cambiarEstado(id, nuevoEstado));
    }
}