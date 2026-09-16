package com.minierp.backend.repository;

import com.minierp.backend.entity.LogAuditoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface LogAuditoriaRepository extends JpaRepository<LogAuditoria, Long> {

    /**
     * Logs SIN filtro de fechas.
     * Los strings llegan normalizados a "" o valor real (nunca null).
     */
    @Query("SELECT l FROM LogAuditoria l JOIN FETCH l.usuario u " +
        "WHERE (:usuarioId IS NULL OR u.id = :usuarioId) " +
        "AND (:modulo = '' OR LOWER(l.modulo) = LOWER(:modulo)) " +
        "AND (:tipoAccion = '' OR LOWER(l.tipoAccion) = LOWER(:tipoAccion)) " +
        "AND (:texto = '' OR LOWER(l.detalle) LIKE LOWER(CONCAT('%', :texto, '%'))) " +
        "ORDER BY l.fecha DESC")
    List<LogAuditoria> filtrarSinFechas(@Param("usuarioId") Long usuarioId,
                                        @Param("modulo") String modulo,
                                        @Param("tipoAccion") String tipoAccion,
                                        @Param("texto") String texto);

    /**
     * Logs CON filtro de fechas.
     * NUNCA recibe null en fechas: el service normaliza antes de llamar.
     */
    @Query("SELECT l FROM LogAuditoria l JOIN FETCH l.usuario u " +
        "WHERE l.fecha >= :fechaDesde " +
        "AND l.fecha <= :fechaHasta " +
        "AND (:usuarioId IS NULL OR u.id = :usuarioId) " +
        "AND (:modulo = '' OR LOWER(l.modulo) = LOWER(:modulo)) " +
        "AND (:tipoAccion = '' OR LOWER(l.tipoAccion) = LOWER(:tipoAccion)) " +
        "AND (:texto = '' OR LOWER(l.detalle) LIKE LOWER(CONCAT('%', :texto, '%'))) " +
        "ORDER BY l.fecha DESC")
    List<LogAuditoria> filtrarEnRango(@Param("fechaDesde") LocalDateTime fechaDesde,
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