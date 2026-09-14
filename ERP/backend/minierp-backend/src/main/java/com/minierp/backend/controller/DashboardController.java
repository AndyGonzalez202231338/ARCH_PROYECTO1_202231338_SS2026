package com.minierp.backend.controller;

import com.minierp.backend.dto.dashboard.DashboardResponse;
import com.minierp.backend.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/resumen")
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRACION')")
    public ResponseEntity<DashboardResponse> resumen() {
        return ResponseEntity.ok(dashboardService.obtenerResumen());
    }
}