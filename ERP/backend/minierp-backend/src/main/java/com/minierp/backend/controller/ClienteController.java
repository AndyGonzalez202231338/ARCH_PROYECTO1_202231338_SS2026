package com.minierp.backend.controller;

import com.minierp.backend.dto.cliente.ClienteRequest;
import com.minierp.backend.dto.cliente.ClienteResponse;
import com.minierp.backend.dto.common.ApiMessageResponse;
import com.minierp.backend.service.ClienteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/clientes")
@RequiredArgsConstructor
public class ClienteController {

    private final ClienteService clienteService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMINISTRACION','ROLE_VENTAS')")
    public ResponseEntity<List<ClienteResponse>> listar(
            @RequestParam(required = false) Boolean activo,
            @RequestParam(required = false) String texto) {
        return ResponseEntity.ok(clienteService.listar(activo, texto));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMINISTRACION','ROLE_VENTAS')")
    public ResponseEntity<ClienteResponse> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(clienteService.obtener(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMINISTRACION','ROLE_VENTAS')")
    public ResponseEntity<ClienteResponse> crear(
            @Valid @RequestBody ClienteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(clienteService.crear(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMINISTRACION','ROLE_VENTAS')")
    public ResponseEntity<ClienteResponse> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody ClienteRequest request) {
        return ResponseEntity.ok(clienteService.actualizar(id, request));
    }

    @PatchMapping("/{id}/activar")
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRACION')")
    public ResponseEntity<ApiMessageResponse> activar(@PathVariable Long id) {
        clienteService.activar(id);
        return ResponseEntity.ok(new ApiMessageResponse("Cliente activado", true));
    }

    @PatchMapping("/{id}/desactivar")
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRACION')")
    public ResponseEntity<ApiMessageResponse> desactivar(@PathVariable Long id) {
        clienteService.desactivar(id);
        return ResponseEntity.ok(new ApiMessageResponse("Cliente desactivado", true));
    }
}