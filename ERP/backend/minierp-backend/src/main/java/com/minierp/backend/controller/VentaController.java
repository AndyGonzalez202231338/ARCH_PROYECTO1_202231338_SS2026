package com.minierp.backend.controller;

import com.minierp.backend.dto.venta.VentaRequest;
import com.minierp.backend.dto.venta.VentaResponse;
import com.minierp.backend.dto.venta.VentaResumenResponse;
import com.minierp.backend.service.VentaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin/ventas")
@RequiredArgsConstructor
public class VentaController {

    private final VentaService ventaService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMINISTRACION','ROLE_VENTAS')")
    public ResponseEntity<List<VentaResumenResponse>> listar(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime desde,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime hasta,
            @RequestParam(required = false) Long clienteId) {
        return ResponseEntity.ok(ventaService.listar(desde, hasta, clienteId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMINISTRACION','ROLE_VENTAS')")
    public ResponseEntity<VentaResponse> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(ventaService.obtener(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_VENTAS')")
    public ResponseEntity<VentaResponse> registrar(
            @Valid @RequestBody VentaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ventaService.registrar(request));
    }

    /**
     * Descargar la factura PDF de una venta.
     * Devuelve el archivo binario con headers para descarga.
     */
    @GetMapping("/{id}/factura")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMINISTRACION','ROLE_VENTAS')")
    public ResponseEntity<byte[]> descargarFactura(@PathVariable Long id) {
        byte[] pdf = ventaService.generarFacturaPdf(id);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "factura_" + id + ".pdf");
        headers.setContentLength(pdf.length);

        return new ResponseEntity<>(pdf, headers, HttpStatus.OK);
    }
}