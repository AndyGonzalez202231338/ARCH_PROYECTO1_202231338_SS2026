package com.minierp.backend.repository;

import com.minierp.backend.entity.MovimientoInventario;
import com.minierp.backend.entity.enums.TipoMovimiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;
import java.time.LocalDateTime;
import java.util.List;

public interface MovimientoInventarioRepository extends JpaRepository<MovimientoInventario, Long> {

    /**
     * Obtiene las ENTRADAS de un producto con saldo disponible > 0,
     * ordenadas según el método UEPS o PEPS.
     *
     * Se usa un bloqueo PESSIMISTIC_WRITE para evitar que dos
     * ventas concurrentes consuman el mismo lote.
     *
     * El llamador decide el orden:
     *   - PEPS: ORDER BY fecha ASC
     *   - UEPS: ORDER BY fecha DESC
     *
     * Como JPQL no permite ORDER BY dinámico, se ofrecen dos métodos.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT m FROM MovimientoInventario m " +
           "WHERE m.producto.id = :productoId " +
           "AND m.tipoMovimiento = 'ENTRADA' " +
           "AND m.saldoDisponible > 0 " +
           "ORDER BY m.fecha ASC, m.id ASC")
    List<MovimientoInventario> findLotesDisponiblesPEPS(@Param("productoId") Long productoId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT m FROM MovimientoInventario m " +
           "WHERE m.producto.id = :productoId " +
           "AND m.tipoMovimiento = 'ENTRADA' " +
           "AND m.saldoDisponible > 0 " +
           "ORDER BY m.fecha DESC, m.id DESC")
    List<MovimientoInventario> findLotesDisponiblesUEPS(@Param("productoId") Long productoId);

    /**
     * Stock actual de un producto (suma de saldos disponibles
     * de todas las entradas).
     */
    @Query("SELECT COALESCE(SUM(m.saldoDisponible), 0) " +
           "FROM MovimientoInventario m " +
           "WHERE m.producto.id = :productoId " +
           "AND m.tipoMovimiento = 'ENTRADA'")
    Integer sumSaldoDisponibleByProducto(@Param("productoId") Long productoId);

    /**
     * Historial de movimientos de un producto con filtros de fecha.
     */
    @Query("SELECT m FROM MovimientoInventario m " +
           "JOIN FETCH m.usuario u " +
           "WHERE m.producto.id = :productoId " +
           "AND (:fechaDesde IS NULL OR m.fecha >= :fechaDesde) " +
           "AND (:fechaHasta IS NULL OR m.fecha <= :fechaHasta) " +
           "ORDER BY m.fecha DESC")
    List<MovimientoInventario> findHistorialByProducto(@Param("productoId") Long productoId,
                                                       @Param("fechaDesde") LocalDateTime fechaDesde,
                                                       @Param("fechaHasta") LocalDateTime fechaHasta);

    /**
     * Top N productos con mayor cantidad de movimientos.
     * Para el reporte "Productos con mayor cantidad de movimientos".
     */
    @Query("SELECT m.producto.id, m.producto.nombre, COUNT(m) " +
           "FROM MovimientoInventario m " +
           "WHERE (:fechaDesde IS NULL OR m.fecha >= :fechaDesde) " +
           "AND (:fechaHasta IS NULL OR m.fecha <= :fechaHasta) " +
           "GROUP BY m.producto.id, m.producto.nombre " +
           "ORDER BY COUNT(m) DESC")
    List<Object[]> findProductosConMasMovimientos(@Param("fechaDesde") LocalDateTime fechaDesde,
                                                  @Param("fechaHasta") LocalDateTime fechaHasta,
                                                  org.springframework.data.domain.Pageable pageable);

    /**
     * Movimientos por referencia (para auditar y eliminar en cascada
     * si se cancela una compra/venta).
     */
    List<MovimientoInventario> findByReferenciaTipoAndReferenciaId(String referenciaTipo, Long referenciaId);

    /**
     * Movimientos de un tipo específico en un rango de fechas.
     */
    @Query("SELECT m FROM MovimientoInventario m " +
           "WHERE m.tipoMovimiento = :tipo " +
           "AND (:fechaDesde IS NULL OR m.fecha >= :fechaDesde) " +
           "AND (:fechaHasta IS NULL OR m.fecha <= :fechaHasta) " +
           "ORDER BY m.fecha DESC")
    List<MovimientoInventario> findByTipoAndRango(@Param("tipo") TipoMovimiento tipo,
                                                  @Param("fechaDesde") LocalDateTime fechaDesde,
                                                  @Param("fechaHasta") LocalDateTime fechaHasta);
}