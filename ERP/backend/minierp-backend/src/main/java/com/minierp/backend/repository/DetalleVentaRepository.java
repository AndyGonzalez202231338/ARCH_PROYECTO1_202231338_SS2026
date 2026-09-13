package com.minierp.backend.repository;

import com.minierp.backend.entity.DetalleVenta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface DetalleVentaRepository extends JpaRepository<DetalleVenta, Long> {

    List<DetalleVenta> findByVentaId(Long ventaId);

    /**
     * Top N productos más vendidos (por cantidad de unidades).
     * Para el reporte "Top 10 productos más vendidos".
     */
    @Query("SELECT d.producto.id, d.producto.nombre, SUM(d.cantidad) " +
           "FROM DetalleVenta d " +
           "WHERE d.venta.estado = 'COMPLETADA' " +
           "AND (:fechaDesde IS NULL OR d.venta.fecha >= :fechaDesde) " +
           "AND (:fechaHasta IS NULL OR d.venta.fecha <= :fechaHasta) " +
           "GROUP BY d.producto.id, d.producto.nombre " +
           "ORDER BY SUM(d.cantidad) DESC")
    List<Object[]> findTopProductosMasVendidos(@Param("fechaDesde") LocalDateTime fechaDesde,
                                               @Param("fechaHasta") LocalDateTime fechaHasta,
                                               org.springframework.data.domain.Pageable pageable);

    /**
     * Top N productos que han generado mayores ingresos.
     * Para el reporte "Top 10 productos que han generado mayores ingresos".
     */
    @Query("SELECT d.producto.id, d.producto.nombre, SUM(d.subtotal) " +
           "FROM DetalleVenta d " +
           "WHERE d.venta.estado = 'COMPLETADA' " +
           "GROUP BY d.producto.id, d.producto.nombre " +
           "ORDER BY SUM(d.subtotal) DESC")
    List<Object[]> findTopProductosPorIngresos(org.springframework.data.domain.Pageable pageable);
}