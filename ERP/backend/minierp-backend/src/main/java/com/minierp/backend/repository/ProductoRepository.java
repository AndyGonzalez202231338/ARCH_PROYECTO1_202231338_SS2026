package com.minierp.backend.repository;

import com.minierp.backend.entity.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductoRepository extends JpaRepository<Producto, Long> {

    Optional<Producto> findByCodigo(String codigo);

    boolean existsByCodigo(String codigo);

    /**
     * Lista productos filtrando por categoría, activo y texto libre
     * en nombre o código.
     */
    @Query("SELECT p FROM Producto p JOIN FETCH p.categoria c " +
       "WHERE (:categoriaId IS NULL OR c.id = :categoriaId) " +
       "AND (:activo IS NULL OR p.activo = :activo) " +
       "AND (LOWER(p.nombre) LIKE LOWER(CONCAT('%', :texto, '%')) " +
       "     OR LOWER(p.codigo) LIKE LOWER(CONCAT('%', :texto, '%'))) " +
       "ORDER BY p.nombre")
List<Producto> filtrar(@Param("categoriaId") Long categoriaId,
                       @Param("activo") Boolean activo,
                       @Param("texto") String texto);

    /**
     * Productos con stock_actual <= stock_minimo (o un umbral dado).
     * Si umbral es null, usa el stock_minimo individual de cada producto.
     */
    @Query("SELECT p FROM Producto p " +
           "WHERE p.activo = true " +
           "AND p.stockActual <= COALESCE(:umbral, p.stockMinimo) " +
           "ORDER BY p.stockActual ASC")
    List<Producto> findProductosBajoStock(@Param("umbral") Integer umbral);

    /**
     * Top N productos con menor existencia disponible.
     * Para el reporte "Productos con menor existencia disponible".
     */
    @Query("SELECT p FROM Producto p " +
           "WHERE p.activo = true " +
           "ORDER BY p.stockActual ASC")
    List<Producto> findMenorExistencia(org.springframework.data.domain.Pageable pageable);

    /**
     * Verifica si existen productos asociados a una categoría.
     * Para la regla de negocio: no eliminar categoría con productos.
     */
    @Query("SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END "+
           "FROM Producto p WHERE p.categoria.id = :categoriaId")
    boolean existsByCategoriaId(@Param("categoriaId") Long categoriaId);
}