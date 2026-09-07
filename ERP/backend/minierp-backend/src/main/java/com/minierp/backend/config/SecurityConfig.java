package com.minierp.backend.config;

import com.minierp.backend.service.UsuarioDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Configuración principal de Spring Security.
 */
@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final UsuarioDetailsService usuarioDetailsService;

    /**
     * Creamos el PasswordEncoder.
     *
     * BCrypt se encargará de convertir:
     *
     * Ese resultado es el que se almacena
     * en la columna password_hash.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * AuthenticationManager es el componente que
     * finalmente verifica:
     *
     * correo + contraseña
     *
     * contra:
     *
     * usuario + hash BCrypt.
     */
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration
    ) throws Exception {

        return configuration.getAuthenticationManager();
    }

    /**
     * Configuración de las rutas HTTP.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http

            /**
             * Como estamos haciendo una API REST y no utilizaremos
             * formularios HTML de Spring Security,
             * desactivamos CSRF por ahora.
             *
             * Más adelante revisaremos esta decisión dependiendo
             * de si utilizamos JWT o sesiones.
             */
            .csrf(csrf -> csrf.disable())

            /**
             * Permisos de las rutas.
             */
            .authorizeHttpRequests(auth -> auth

                /**
                 * El login debe poder utilizarse
                 * sin estar autenticado previamente.
                 */
                .requestMatchers("/api/auth/login").permitAll()

                /**
                 * Todo lo demás queda protegido.
                 */
                .anyRequest().authenticated()
            );

        return http.build();
    }
}