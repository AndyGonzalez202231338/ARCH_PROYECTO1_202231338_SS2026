package com.minierp.backend.service;

import com.minierp.backend.entity.Venta;

public interface PdfService {
    byte[] generarFactura(Venta venta);
}