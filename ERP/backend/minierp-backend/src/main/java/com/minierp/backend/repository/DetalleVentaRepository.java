package com.minierp.backend.repository;

import com.minierp.backend.entity.DetalleVenta;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface DetalleVentaRepository extends JpaRepository<DetalleVenta, Long> {

    List<DetalleVenta> findByVentaId(Long ventaId);

    /**
     * Top N productos más vendidos SIN filtro de fechas.
     * Se usa cuando el frontend no envía desde/hasta.
     */
    @Query("SELECT d.producto.id, d.producto.nombre, SUM(d.cantidad) " +
           "FROM DetalleVenta d " +
           "WHERE d.venta.estado = 'COMPLETADA' " +
           "GROUP BY d.producto.id, d.producto.nombre " +
           "ORDER BY SUM(d.cantidad) DESC")
    List<Object[]> findTopProductosMasVendidosSinFechas(Pageable pageable);

    /**
     * Top N productos más vendidos CON rango de fechas.
     * NUNCA recibe null: el service normaliza a valores por defecto.
     */
    @Query("SELECT d.producto.id, d.producto.nombre, SUM(d.cantidad) " +
           "FROM DetalleVenta d " +
           "WHERE d.venta.estado = 'COMPLETADA' " +
           "AND d.venta.fecha >= :fechaDesde " +
           "AND d.venta.fecha <= :fechaHasta " +
           "GROUP BY d.producto.id, d.producto.nombre " +
           "ORDER BY SUM(d.cantidad) DESC")
    List<Object[]> findTopProductosMasVendidosEnRango(
            @Param("fechaDesde") LocalDateTime fechaDesde,
            @Param("fechaHasta") LocalDateTime fechaHasta,
            Pageable pageable);

    /**
     * Top N productos que han generado mayores ingresos.
     * No usa fechas, así que no hay problema de nulls.
     */
    @Query("SELECT d.producto.id, d.producto.nombre, SUM(d.subtotal) " +
           "FROM DetalleVenta d " +
           "WHERE d.venta.estado = 'COMPLETADA' " +
           "GROUP BY d.producto.id, d.producto.nombre " +
           "ORDER BY SUM(d.subtotal) DESC")
    List<Object[]> findTopProductosPorIngresos(Pageable pageable);
}