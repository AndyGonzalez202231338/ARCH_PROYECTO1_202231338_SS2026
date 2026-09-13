package com.minierp.backend.repository;

import com.minierp.backend.entity.LogAuditoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface LogAuditoriaRepository extends JpaRepository<LogAuditoria, Long> {

    /**
     * Filtro múltiple para el módulo de auditoría del administrador.
     * Todos los filtros son opcionales.
     */
    @Query("SELECT l FROM LogAuditoria l JOIN FETCH l.usuario u " +
           "WHERE (:fechaDesde IS NULL OR l.fecha >= :fechaDesde) " +
           "AND (:fechaHasta IS NULL OR l.fecha <= :fechaHasta) " +
           "AND (:usuarioId IS NULL OR u.id = :usuarioId) " +
           "AND (:modulo IS NULL OR LOWER(l.modulo) = LOWER(:modulo)) " +
           "AND (:tipoAccion IS NULL OR LOWER(l.tipoAccion) = LOWER(:tipoAccion)) " +
           "AND (:texto IS NULL OR LOWER(l.detalle) LIKE LOWER(CONCAT('%', :texto, '%'))) " +
           "ORDER BY l.fecha DESC")
    List<LogAuditoria> filtrar(@Param("fechaDesde") LocalDateTime fechaDesde,
                               @Param("fechaHasta") LocalDateTime fechaHasta,
                               @Param("usuarioId") Long usuarioId,
                               @Param("modulo") String modulo,
                               @Param("tipoAccion") String tipoAccion,
                               @Param("texto") String texto);

    /**
     * Últimos logs de un usuario específico.
     */
    List<LogAuditoria> findTop20ByUsuarioIdOrderByFechaDesc(Long usuarioId);
}