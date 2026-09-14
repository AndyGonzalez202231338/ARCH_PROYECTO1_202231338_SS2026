package com.minierp.backend.service.impl;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.minierp.backend.entity.DetalleVenta;
import com.minierp.backend.entity.Venta;
import com.minierp.backend.service.PdfService;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

@Service
public class PdfServiceImpl implements PdfService {

    private static final DateTimeFormatter FMT =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    @Override
    public byte[] generarFactura(Venta venta) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        try (PdfWriter writer = new PdfWriter(baos);
             PdfDocument pdf = new PdfDocument(writer);
             Document doc = new Document(pdf)) {

            // ---- Encabezado ----
            doc.add(new Paragraph("MINI ERP")
                    .setBold().setFontSize(20)
                    .setTextAlignment(TextAlignment.CENTER));
            doc.add(new Paragraph("Factura de Venta")
                    .setFontSize(14)
                    .setTextAlignment(TextAlignment.CENTER));
            doc.add(new Paragraph(" "));

            // ---- Datos de la venta y del cliente ----
            doc.add(new Paragraph("Número: " + venta.getNumeroVenta()));
            doc.add(new Paragraph("Fecha: " + venta.getFecha().format(FMT)));
            doc.add(new Paragraph("Cliente: " + venta.getCliente().getNombre()));
            doc.add(new Paragraph("Documento: " + venta.getCliente().getNumeroDocumento()));
            doc.add(new Paragraph("Dirección: "
                    + (venta.getCliente().getDireccion() != null
                        ? venta.getCliente().getDireccion() : "-")));
            doc.add(new Paragraph(" "));

            // ---- Tabla de productos ----
            Table tabla = new Table(new float[]{4, 1, 2, 2});
            tabla.setWidth(com.itextpdf.layout.properties.UnitValue.createPercentValue(100));

            tabla.addHeaderCell(new Cell().add(new Paragraph("Producto").setBold()));
            tabla.addHeaderCell(new Cell().add(new Paragraph("Cant.").setBold()));
            tabla.addHeaderCell(new Cell().add(new Paragraph("Precio Unit.").setBold()));
            tabla.addHeaderCell(new Cell().add(new Paragraph("Subtotal").setBold()));

            for (DetalleVenta d : venta.getDetalles()) {
                tabla.addCell(d.getProducto().getNombre());
                tabla.addCell(String.valueOf(d.getCantidad()));
                tabla.addCell("Q " + d.getPrecioUnitario());
                tabla.addCell("Q " + d.getSubtotal());
            }

            doc.add(tabla);
            doc.add(new Paragraph(" "));

            // ---- Totales ----
            doc.add(new Paragraph("Subtotal: Q " + venta.getSubtotal())
                    .setTextAlignment(TextAlignment.RIGHT));
            doc.add(new Paragraph("IVA (19%): Q " + venta.getImpuesto())
                    .setTextAlignment(TextAlignment.RIGHT));
            doc.add(new Paragraph("TOTAL: Q " + venta.getTotal())
                    .setBold().setFontSize(14)
                    .setTextAlignment(TextAlignment.RIGHT));

        } catch (Exception e) {
            throw new RuntimeException("Error al generar la factura PDF", e);
        }

        return baos.toByteArray();
    }
}