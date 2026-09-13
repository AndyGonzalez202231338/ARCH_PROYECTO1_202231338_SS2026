package com.minierp.backend.repository;

import com.minierp.backend.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmail(String email);

    /**
     * Carga el usuario con su área ya inicializada en una sola consulta.
     * Se usa en el flujo de autenticación para evitar el LazyInitializationException.
     */
    @Query("SELECT u FROM Usuario u JOIN FETCH u.area WHERE u.email = :email")
    Optional<Usuario> findByEmailWithArea(@Param("email") String email);
}