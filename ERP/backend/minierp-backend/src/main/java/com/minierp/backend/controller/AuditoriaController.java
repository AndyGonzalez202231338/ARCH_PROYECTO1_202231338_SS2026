package com.minierp.backend.controller;

import com.minierp.backend.dto.auditoria.LogAuditoriaResponse;
import com.minierp.backend.service.AuditoriaService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin/auditoria")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMINISTRACION')")
public class AuditoriaController {

    private final AuditoriaService auditoriaService;

    @GetMapping
    public ResponseEntity<List<LogAuditoriaResponse>> listar(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta,
            @RequestParam(required = false) Long usuarioId,
            @RequestParam(required = false) String modulo,
            @RequestParam(required = false) String tipoAccion,
            @RequestParam(required = false) String texto) {

        LocalDateTime desdeDt = desde != null ? desde.atStartOfDay() : null;
        LocalDateTime hastaDt = hasta != null ? hasta.atTime(23, 59, 59) : null;

        return ResponseEntity.ok(auditoriaService.buscar(
                desdeDt, hastaDt, usuarioId, modulo, tipoAccion, texto));
    }
}