package com.minierp.backend.repository;

import com.minierp.backend.entity.MovimientoInventario;
import com.minierp.backend.entity.enums.TipoMovimiento;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;
import java.time.LocalDateTime;
import java.util.List;

public interface MovimientoInventarioRepository extends JpaRepository<MovimientoInventario, Long> {

    // =========================================================
    // UEPS / PEPS — Lotes disponibles con bloqueo pesimista
    // =========================================================

    /**
     * Obtiene las ENTRADAS de un producto con saldo disponible > 0,
     * ordenadas por fecha ASCENDENTE (más antiguas primero).
     * Se usa para el método PEPS.
     *
     * El bloqueo PESSIMISTIC_WRITE evita que dos ventas concurrentes
     * consuman el mismo lote y generen stock negativo.
     * SOLO debe usarse dentro de una transacción (@Transactional).
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT m FROM MovimientoInventario m " +
           "WHERE m.producto.id = :productoId " +
           "AND m.tipoMovimiento = 'ENTRADA' " +
           "AND m.saldoDisponible > 0 " +
           "ORDER BY m.fecha ASC, m.id ASC")
    List<MovimientoInventario> findLotesDisponiblesPEPS(@Param("productoId") Long productoId);

    /**
     * Obtiene las ENTRADAS de un producto con saldo disponible > 0,
     * ordenadas por fecha DESCENDENTE (más recientes primero).
     * Se usa para el método UEPS.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT m FROM MovimientoInventario m " +
           "WHERE m.producto.id = :productoId " +
           "AND m.tipoMovimiento = 'ENTRADA' " +
           "AND m.saldoDisponible > 0 " +
           "ORDER BY m.fecha DESC, m.id DESC")
    List<MovimientoInventario> findLotesDisponiblesUEPS(@Param("productoId") Long productoId);

    // =========================================================
    // Stock actual (suma de saldos disponibles)
    // =========================================================

    /**
     * Stock actual de un producto: suma de saldos disponibles
     * de todas las entradas.
     * Devuelve 0 si no hay entradas (COALESCE evita null).
     */
    @Query("SELECT COALESCE(SUM(m.saldoDisponible), 0) " +
           "FROM MovimientoInventario m " +
           "WHERE m.producto.id = :productoId " +
           "AND m.tipoMovimiento = 'ENTRADA'")
    Integer sumSaldoDisponibleByProducto(@Param("productoId") Long productoId);

    /**
     * Historial COMPLETO de un producto (sin filtros de fecha).
     * Se usa cuando el frontend no envía ni desde ni hasta.
     * Incluye JOIN FETCH a usuario y producto para que el service
     * pueda acceder a sus campos sin LazyInitializationException.
     */
    @Query("SELECT m FROM MovimientoInventario m " +
           "JOIN FETCH m.usuario " +
           "JOIN FETCH m.producto " +
           "WHERE m.producto.id = :productoId " +
           "ORDER BY m.fecha DESC")
    List<MovimientoInventario> findHistorialByProducto(@Param("productoId") Long productoId);

    /**
     * Historial de un producto CON filtro de fechas.
     * Se usa cuando el frontend envía desde y/o hasta.
     * NUNCA recibe null: el service normaliza a valores por
     * defecto (1900-01-01 y hoy + 100 años) antes de llamar.
     *
     * Esto evita el error de PostgreSQL "could not determine
     * data type of parameter" que ocurre con parámetros null.
     */
    @Query("SELECT m FROM MovimientoInventario m " +
           "JOIN FETCH m.usuario " +
           "JOIN FETCH m.producto " +
           "WHERE m.producto.id = :productoId " +
           "AND m.fecha >= :fechaDesde " +
           "AND m.fecha <= :fechaHasta " +
           "ORDER BY m.fecha DESC")
    List<MovimientoInventario> findHistorialByProductoEnRango(
            @Param("productoId") Long productoId,
            @Param("fechaDesde") LocalDateTime fechaDesde,
            @Param("fechaHasta") LocalDateTime fechaHasta);


    /**
     * Top N productos con mayor cantidad de movimientos (sin rango de fechas).
     * Se usa cuando el reporte no filtra por fechas.
     */
    @Query("SELECT m.producto.id, m.producto.nombre, COUNT(m) " +
           "FROM MovimientoInventario m " +
           "GROUP BY m.producto.id, m.producto.nombre " +
           "ORDER BY COUNT(m) DESC")
    List<Object[]> findProductosConMasMovimientosSinFechas(Pageable pageable);

    /**
     * Top N productos con mayor cantidad de movimientos CON rango de fechas.
     * NUNCA recibe null: el service normaliza antes de llamar.
     */
    @Query("SELECT m.producto.id, m.producto.nombre, COUNT(m) " +
           "FROM MovimientoInventario m " +
           "WHERE m.fecha >= :fechaDesde " +
           "AND m.fecha <= :fechaHasta " +
           "GROUP BY m.producto.id, m.producto.nombre " +
           "ORDER BY COUNT(m) DESC")
    List<Object[]> findProductosConMasMovimientosEnRango(
            @Param("fechaDesde") LocalDateTime fechaDesde,
            @Param("fechaHasta") LocalDateTime fechaHasta,
            Pageable pageable);

    // =========================================================
    // Movimientos por tipo y por referencia
    // =========================================================

    /**
     * Movimientos de un tipo específico SIN rango de fechas.
     */
    @Query("SELECT m FROM MovimientoInventario m " +
           "JOIN FETCH m.producto " +
           "WHERE m.tipoMovimiento = :tipo " +
           "ORDER BY m.fecha DESC")
    List<MovimientoInventario> findByTipo(@Param("tipo") TipoMovimiento tipo);

    /**
     * Movimientos de un tipo específico CON rango de fechas.
     * NUNCA recibe null: el service normaliza antes de llamar.
     */
    @Query("SELECT m FROM MovimientoInventario m " +
           "JOIN FETCH m.producto " +
           "WHERE m.tipoMovimiento = :tipo " +
           "AND m.fecha >= :fechaDesde " +
           "AND m.fecha <= :fechaHasta " +
           "ORDER BY m.fecha DESC")
    List<MovimientoInventario> findByTipoEnRango(
            @Param("tipo") TipoMovimiento tipo,
            @Param("fechaDesde") LocalDateTime fechaDesde,
            @Param("fechaHasta") LocalDateTime fechaHasta);

    /**
     * Movimientos asociados a una compra o venta específica.
     * Se usa para auditar y para revertir movimientos si se cancela
     * una compra o venta.
     */
    List<MovimientoInventario> findByReferenciaTipoAndReferenciaId(
            String referenciaTipo, Long referenciaId);
}