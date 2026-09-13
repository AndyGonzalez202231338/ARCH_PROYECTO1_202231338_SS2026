package com.minierp.backend.repository;

import com.minierp.backend.entity.DetalleCompra;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DetalleCompraRepository extends JpaRepository<DetalleCompra, Long> {

    List<DetalleCompra> findByCompraId(Long compraId);

    /**
     * Productos adquiridos con mayor frecuencia (cantidad de veces
     * que aparecen en compras), no por cantidad total.
     * Para el reporte "Productos adquiridos con mayor frecuencia".
     */
    @Query("SELECT d.producto.id, d.producto.nombre, COUNT(d) " +
           "FROM DetalleCompra d " +
           "GROUP BY d.producto.id, d.producto.nombre " +
           "ORDER BY COUNT(d) DESC")
    List<Object[]> findProductosMasAdquiridos(org.springframework.data.domain.Pageable pageable);
}