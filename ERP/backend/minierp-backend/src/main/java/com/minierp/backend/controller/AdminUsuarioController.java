package com.minierp.backend.controller;

import com.minierp.backend.dto.common.ApiMessageResponse;
import com.minierp.backend.dto.usuario.UsuarioRequest;
import com.minierp.backend.dto.usuario.UsuarioResponse;
import com.minierp.backend.service.UsuarioService;
import com.minierp.backend.util.UsuarioAutenticadoHelper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller del módulo de Usuarios para el panel de Administración.
 * Solo accesible para usuarios con rol ADMINISTRACION.
 */
@RestController
@RequestMapping("/api/admin/usuarios")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMINISTRACION')")
public class AdminUsuarioController {

    private final UsuarioService usuarioService;
    private final UsuarioAutenticadoHelper usuarioActualHelper;

    @GetMapping
    public ResponseEntity<List<UsuarioResponse>> listar(
            @RequestParam(required = false) Long areaId,
            @RequestParam(required = false) Boolean activo,
            @RequestParam(required = false) String texto) {
        return ResponseEntity.ok(usuarioService.listar(areaId, activo, texto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponse> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.obtener(id));
    }

    @PostMapping
    public ResponseEntity<UsuarioResponse> crear(
            @Valid @RequestBody UsuarioRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(usuarioService.crear(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UsuarioResponse> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody UsuarioRequest request) {
        return ResponseEntity.ok(usuarioService.actualizar(id, request));
    }

    @PutMapping("/{id}/password")
    public ResponseEntity<ApiMessageResponse> cambiarPassword(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        usuarioService.cambiarPassword(id, body.get("password"));
        return ResponseEntity.ok(new ApiMessageResponse(
                "Contraseña actualizada correctamente", true));
    }

    @PatchMapping("/{id}/activar")
    public ResponseEntity<ApiMessageResponse> activar(@PathVariable Long id) {
        usuarioService.activar(id);
        return ResponseEntity.ok(new ApiMessageResponse(
                "Usuario activado correctamente", true));
    }

    @PatchMapping("/{id}/desactivar")
    public ResponseEntity<ApiMessageResponse> desactivar(@PathVariable Long id) {
        Long usuarioActualId = usuarioActualHelper.getUsuarioActualId();
        usuarioService.desactivar(id, usuarioActualId);
        return ResponseEntity.ok(new ApiMessageResponse(
                "Usuario desactivado correctamente", true));
    }
}