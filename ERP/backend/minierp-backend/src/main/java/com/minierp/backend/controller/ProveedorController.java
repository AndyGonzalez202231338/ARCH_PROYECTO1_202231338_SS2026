package com.minierp.backend.controller;

import com.minierp.backend.dto.common.ApiMessageResponse;
import com.minierp.backend.dto.proveedor.ProveedorRequest;
import com.minierp.backend.dto.proveedor.ProveedorResponse;
import com.minierp.backend.service.ProveedorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/proveedores")
@RequiredArgsConstructor
public class ProveedorController {

    private final ProveedorService proveedorService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMINISTRACION','ROLE_COMPRAS')")
    public ResponseEntity<List<ProveedorResponse>> listar(
            @RequestParam(required = false) Boolean activo,
            @RequestParam(required = false) String texto) {
        return ResponseEntity.ok(proveedorService.listar(activo, texto));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMINISTRACION','ROLE_COMPRAS')")
    public ResponseEntity<ProveedorResponse> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(proveedorService.obtener(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMINISTRACION','ROLE_COMPRAS')")
    public ResponseEntity<ProveedorResponse> crear(
            @Valid @RequestBody ProveedorRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(proveedorService.crear(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMINISTRACION','ROLE_COMPRAS')")
    public ResponseEntity<ProveedorResponse> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody ProveedorRequest request) {
        return ResponseEntity.ok(proveedorService.actualizar(id, request));
    }

    @PatchMapping("/{id}/activar")
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRACION')")
    public ResponseEntity<ApiMessageResponse> activar(@PathVariable Long id) {
        proveedorService.activar(id);
        return ResponseEntity.ok(new ApiMessageResponse("Proveedor activado", true));
    }

    @PatchMapping("/{id}/desactivar")
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRACION')")
    public ResponseEntity<ApiMessageResponse> desactivar(@PathVariable Long id) {
        proveedorService.desactivar(id);
        return ResponseEntity.ok(new ApiMessageResponse("Proveedor desactivado", true));
    }
}