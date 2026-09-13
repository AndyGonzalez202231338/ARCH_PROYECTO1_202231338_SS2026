package com.minierp.backend.controller;

import com.minierp.backend.dto.area.AreaResponse;
import com.minierp.backend.service.AreaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/areas")
@RequiredArgsConstructor
public class AreaController {

    private final AreaService areaService;

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRACION')")
    public ResponseEntity<List<AreaResponse>> listar() {
        return ResponseEntity.ok(areaService.listarTodas());
    }
}