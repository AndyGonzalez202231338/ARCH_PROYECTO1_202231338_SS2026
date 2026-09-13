package com.minierp.backend.repository;

import com.minierp.backend.entity.Compra;
import com.minierp.backend.entity.enums.EstadoCompra;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface CompraRepository extends JpaRepository<Compra, Long> {

    Optional<Compra> findByNumeroCompra(String numeroCompra);

    boolean existsByNumeroCompra(String numeroCompra);

    /**
     * Carga una compra con sus detalles y las relaciones necesarias
     * para mostrarla (proveedor y usuario).
     */
    @Query("SELECT DISTINCT c FROM Compra c " +
           "JOIN FETCH c.proveedor " +
           "JOIN FETCH c.usuario " +
           "LEFT JOIN FETCH c.detalles d " +
           "LEFT JOIN FETCH d.producto " +
           "WHERE c.id = :id")
    Optional<Compra> findByIdConDetalles(@Param("id") Long id);

    /**
     * Filtro por rango de fechas, proveedor y estado.
     */
    @Query("SELECT c FROM Compra c JOIN FETCH c.proveedor " +
           "WHERE (:fechaDesde IS NULL OR c.fecha >= :fechaDesde) " +
           "AND (:fechaHasta IS NULL OR c.fecha <= :fechaHasta) " +
           "AND (:proveedorId IS NULL OR c.proveedor.id = :proveedorId) " +
           "AND (:estado IS NULL OR c.estado = :estado) " +
           "ORDER BY c.fecha DESC")
    List<Compra> filtrar(@Param("fechaDesde") LocalDateTime fechaDesde,
                         @Param("fechaHasta") LocalDateTime fechaHasta,
                         @Param("proveedorId") Long proveedorId,
                         @Param("estado") EstadoCompra estado);

    /**
     * Top N proveedores con mayor monto acumulado de compras.
     * Devuelve pares [proveedorId, nombre, totalCompras].
     */
    @Query("SELECT c.proveedor.id, c.proveedor.nombre, SUM(c.total) " +
           "FROM Compra c " +
           "WHERE c.estado = 'RECIBIDA' " +
           "GROUP BY c.proveedor.id, c.proveedor.nombre " +
           "ORDER BY SUM(c.total) DESC")
    List<Object[]> findTopProveedoresPorMonto(org.springframework.data.domain.Pageable pageable);
}