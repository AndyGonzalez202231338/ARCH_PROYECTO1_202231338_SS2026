package com.minierp.backend.repository;

import com.minierp.backend.entity.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    Optional<Cliente> findByNumeroDocumento(String numeroDocumento);

    boolean existsByNumeroDocumento(String numeroDocumento);

    @Query("SELECT c FROM Cliente c " +
           "WHERE (:activo IS NULL OR c.activo = :activo) " +
           "AND (:texto IS NULL OR LOWER(c.nombre) LIKE LOWER(CONCAT('%', :texto, '%')) " +
           "                     OR LOWER(c.numeroDocumento) LIKE LOWER(CONCAT('%', :texto, '%'))) " +
           "ORDER BY c.nombre")
    List<Cliente> filtrar(@Param("activo") Boolean activo,
                          @Param("texto") String texto);
}