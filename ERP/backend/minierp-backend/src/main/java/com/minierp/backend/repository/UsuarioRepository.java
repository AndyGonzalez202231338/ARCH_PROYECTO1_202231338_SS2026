package com.minierp.backend.repository;

import com.minierp.backend.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
/**
 * Repository encargado de comunicarse con la tabla usuarios.
 *
 * JpaRepository ya nos proporciona métodos como:
 *
 * findAll()
 * findById()
 * save()
 * delete()
 *
 * Nosotros solamente agregamos las consultas
 * específicas que necesitamos.
 */
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    /**
     * Busca un usuario utilizando su correo.
     *
     * Spring Data JPA genera automáticamente
     * la consulta SQL correspondiente.
     */
    Optional<Usuario> findByEmail(String email);
}