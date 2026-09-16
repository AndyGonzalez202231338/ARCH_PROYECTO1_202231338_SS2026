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
     * Top N proveedores con mayor monto acumulado de compras.
     * Devuelve pares [proveedorId, nombre, totalCompras].
     */
    @Query("SELECT c.proveedor.id, c.proveedor.nombre, COUNT(c.id), SUM(c.total) " +
       "FROM Compra c " +
       "GROUP BY c.proveedor.id, c.proveedor.nombre " +
       "ORDER BY SUM(c.total) DESC")
       List<Object[]> findTopProveedoresPorMonto(org.springframework.data.domain.Pageable pageable);

       /**
        * Compras SIN filtro de fechas (solo proveedor y estado).
        */
       @Query("SELECT c FROM Compra c JOIN FETCH c.proveedor " +
              "WHERE (:proveedorId IS NULL OR c.proveedor.id = :proveedorId) " +
              "AND (:estado IS NULL OR c.estado = :estado) " +
              "ORDER BY c.fecha DESC")
       List<Compra> filtrarSinFechas(@Param("proveedorId") Long proveedorId,
                                   @Param("estado") EstadoCompra estado);

       /**
        * Compras CON filtro de fechas.
        * NUNCA recibe null: el service normaliza antes de llamar.
        */
       @Query("SELECT c FROM Compra c JOIN FETCH c.proveedor " +
              "WHERE c.fecha >= :fechaDesde " +
              "AND c.fecha <= :fechaHasta " +
              "AND (:proveedorId IS NULL OR c.proveedor.id = :proveedorId) " +
              "AND (:estado IS NULL OR c.estado = :estado) " +
              "ORDER BY c.fecha DESC")
       List<Compra> filtrarEnRango(@Param("fechaDesde") LocalDateTime fechaDesde,
                                   @Param("fechaHasta") LocalDateTime fechaHasta,
                                   @Param("proveedorId") Long proveedorId,
                                   @Param("estado") EstadoCompra estado);
}