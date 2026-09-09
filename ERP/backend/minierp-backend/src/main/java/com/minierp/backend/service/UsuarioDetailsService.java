package com.minierp.backend.service;

import com.minierp.backend.entity.Usuario;
import com.minierp.backend.repository.UsuarioRepository;
import com.minierp.backend.repository.AreaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * Esta clase conecta nuestra tabla "usuarios" con Spring Security.
 *
 * Spring Security llama automáticamente a:
 *
 * loadUserByUsername(...)
 *
 * cuando necesita buscar un usuario.
 */
@Service
@RequiredArgsConstructor
public class UsuarioDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;
        private final AreaRepository areaRepository;

    /**
     * Busca el usuario por correo.
     *
     * Aunque el método se llama "username",
     * nosotros utilizaremos el email como identificador.
     */
    @Override
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {

        /**
         * Buscamos el usuario en PostgreSQL.
         */
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                "Usuario no encontrado"
                        )
                );

        /**
         * Convertimos nuestra entidad Usuario
         * al formato que entiende Spring Security.
         *
         * IMPORTANTE:
         *
         * password(...)
         *
         * recibe el HASH de BCrypt almacenado
         * en PostgreSQL, NO la contraseña original.
         */
        String role = areaRepository.findById(usuario.getAreaId())
                .map(area -> "ROLE_" + area.getNombre())
                .orElse("ROLE_USER");

        return User.builder()
                .username(usuario.getEmail())
                .password(usuario.getPasswordHash())

                /**
                 * Por ahora dejamos una autoridad básica.
                 *
                 * Más adelante podemos utilizar las áreas
                 * o implementar roles PERMISOS/ROLES.
                 */
                .authorities(role)

                /**
                 * Si activo = false,
                 * Spring Security impedirá iniciar sesión.
                 */
                .disabled(!usuario.getActivo())

                .build();
    }
}