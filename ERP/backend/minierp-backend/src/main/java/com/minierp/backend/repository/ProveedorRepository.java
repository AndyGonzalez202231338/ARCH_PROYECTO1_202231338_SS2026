package com.minierp.backend.repository;

import com.minierp.backend.entity.Proveedor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProveedorRepository extends JpaRepository<Proveedor, Long> {

    Optional<Proveedor> findByNit(String nit);

    boolean existsByNit(String nit);

    @Query("SELECT p FROM Proveedor p " +
       "WHERE (:activo IS NULL OR p.activo = :activo) " +
       "AND (LOWER(p.nombre) LIKE LOWER(CONCAT('%', CAST(:texto AS string), '%')) " +
       "     OR LOWER(p.nit) LIKE LOWER(CONCAT('%', CAST(:texto AS string), '%'))) " +
       "ORDER BY p.nombre")
       List<Proveedor> filtrar(@Param("activo") Boolean activo, @Param("texto") String texto);
}