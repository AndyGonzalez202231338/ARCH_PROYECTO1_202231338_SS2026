package com.minierp.backend.repository;

import com.minierp.backend.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmail(String email);

    boolean existsByEmail(String email);

    /**
     * Carga el usuario con su área ya inicializada en una sola consulta.
     * Se usa en el flujo de autenticación y en /api/usuarios/me.
     */
    @Query("SELECT u FROM Usuario u JOIN FETCH u.area WHERE u.email = :email")
    Optional<Usuario> findByEmailWithArea(@Param("email") String email);

    /**
     * Lista usuarios filtrando por área y/o activo.
     * Útil para el CRUD del módulo de Administración.
     */
    @Query("SELECT u FROM Usuario u JOIN FETCH u.area a " +
           "WHERE (:areaId IS NULL OR a.id = :areaId) " +
           "AND (:activo IS NULL OR u.activo = :activo) " +
           "ORDER BY u.nombre")
    List<Usuario> filtrar(@Param("areaId") Long areaId,
                          @Param("activo") Boolean activo);

    /**
     * Cuenta cuántos administradores activos hay.
     * Se usa para impedir desactivar al último admin.
     */
    @Query("SELECT COUNT(u) FROM Usuario u WHERE u.area.nombre = 'ADMINISTRACION' AND u.activo = true")
    long contarAdminsActivos();
}