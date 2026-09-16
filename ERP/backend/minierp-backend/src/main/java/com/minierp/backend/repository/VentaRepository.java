package com.minierp.backend.repository;

import com.minierp.backend.entity.Venta;
import com.minierp.backend.entity.enums.EstadoVenta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface VentaRepository extends JpaRepository<Venta, Long> {

    Optional<Venta> findByNumeroVenta(String numeroVenta);

    boolean existsByNumeroVenta(String numeroVenta);

    /**
     * Carga una venta con sus detalles, cliente, usuario y productos.
     * Para "Ver detalle de venta" y generación de factura PDF.
     */
    @Query("SELECT DISTINCT v FROM Venta v " +
           "JOIN FETCH v.cliente " +
           "JOIN FETCH v.usuario " +
           "LEFT JOIN FETCH v.detalles d " +
           "LEFT JOIN FETCH d.producto " +
           "WHERE v.id = :id")
    Optional<Venta> findByIdConDetalles(@Param("id") Long id);

    /**
     * Filtro por rango de fechas, cliente y estado.
     */
    @Query("SELECT v FROM Venta v JOIN FETCH v.cliente " +
       "WHERE (:clienteId IS NULL OR v.cliente.id = :clienteId) " +
       "AND (:estado IS NULL OR v.estado = :estado) " +
              "ORDER BY v.fecha DESC")
       List<Venta> filtrarSinFechas(@Param("clienteId") Long clienteId,
                                   @Param("estado") EstadoVenta estado);

       @Query("SELECT v FROM Venta v JOIN FETCH v.cliente " +
              "WHERE v.fecha >= :fechaDesde " +
              "AND v.fecha <= :fechaHasta " +
              "AND (:clienteId IS NULL OR v.cliente.id = :clienteId) " +
              "AND (:estado IS NULL OR v.estado = :estado) " +
              "ORDER BY v.fecha DESC")
       List<Venta> filtrarEnRango(@Param("fechaDesde") LocalDateTime fechaDesde,
                            @Param("fechaHasta") LocalDateTime fechaHasta,
                            @Param("clienteId") Long clienteId,
                            @Param("estado") EstadoVenta estado);

    /**
     * Top N clientes con mayor monto acumulado de compras (ventas).
     */
    @Query("SELECT v.cliente.id, v.cliente.nombre, COUNT(v.id), SUM(v.total) " +
       "FROM Venta v " +
       "GROUP BY v.cliente.id, v.cliente.nombre " +
       "ORDER BY SUM(v.total) DESC")
       List<Object[]> findTopClientesPorMonto(org.springframework.data.domain.Pageable pageable);

    /**
     * Resumen de ventas agrupado por día, mes o año.
     * agrupacion = 'DIA' | 'MES' | 'ANIO'
     * Devuelve [periodo (String), cantidadVentas, totalVentas]
     */
       @Query(value =
              "SELECT TO_CHAR(v.fecha, 'YYYY-MM-DD') AS periodo, " +
              "       COUNT(v.id) AS cantidad, " +
              "       SUM(v.total) AS total " +
              "FROM ventas v " +
              "WHERE v.estado = 'COMPLETADA' " +
              "  AND v.fecha >= :fechaDesde " +
              "  AND v.fecha <= :fechaHasta " +
              "GROUP BY periodo " +
              "ORDER BY periodo DESC",
              nativeQuery = true)
       List<Object[]> resumenVentasPorDia(@Param("fechaDesde") LocalDateTime fechaDesde,
                                          @Param("fechaHasta") LocalDateTime fechaHasta);

       @Query(value =
              "SELECT TO_CHAR(v.fecha, 'YYYY-MM') AS periodo, " +
              "       COUNT(v.id) AS cantidad, " +
              "       SUM(v.total) AS total " +
              "FROM ventas v " +
              "WHERE v.estado = 'COMPLETADA' " +
              "  AND v.fecha >= :fechaDesde " +
              "  AND v.fecha <= :fechaHasta " +
              "GROUP BY periodo " +
              "ORDER BY periodo DESC",
              nativeQuery = true)
       List<Object[]> resumenVentasPorMes(@Param("fechaDesde") LocalDateTime fechaDesde,
                                          @Param("fechaHasta") LocalDateTime fechaHasta);

       @Query(value =
              "SELECT TO_CHAR(v.fecha, 'YYYY') AS periodo, " +
              "       COUNT(v.id) AS cantidad, " +
              "       SUM(v.total) AS total " +
              "FROM ventas v " +
              "WHERE v.estado = 'COMPLETADA' " +
              "  AND v.fecha >= :fechaDesde " +
              "  AND v.fecha <= :fechaHasta " +
              "GROUP BY periodo " +
              "ORDER BY periodo DESC",
              nativeQuery = true)
       List<Object[]> resumenVentasPorAnio(@Param("fechaDesde") LocalDateTime fechaDesde,
                                          @Param("fechaHasta") LocalDateTime fechaHasta);
}