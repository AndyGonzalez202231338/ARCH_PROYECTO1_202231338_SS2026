package com.minierp.backend.controller;

import com.minierp.backend.dto.LoginRequest;
import com.minierp.backend.dto.LoginResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * Controller responsable de la autenticación.
 *
 * Aquí exponemos los endpoints relacionados
 * con login/logout/autenticación.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    /**
     * AuthenticationManager es quien coordina
     * todo el proceso de autenticación.
     */
    private final AuthenticationManager authenticationManager;

    /**
     * Endpoint de login.
     *
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public LoginResponse login(
            @RequestBody LoginRequest request
    ) {

        /**
         * Creamos un objeto que contiene:
         *
         * username = email
         * password = contraseña enviada
         */
        UsernamePasswordAuthenticationToken authenticationToken =
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                );

        /**
         * Aquí ocurre realmente la autenticación.
         *
         * Spring Security:
         *
         * 1. Busca el usuario mediante UserDetailsService.
         * 2. Obtiene el hash BCrypt de PostgreSQL.
         * 3. Compara la contraseña recibida.
         * 4. Verifica que el usuario esté activo.
         *
         * Si algo falla:
         * AuthenticationException
         */
        Authentication authentication =
                authenticationManager.authenticate(authenticationToken);

        /**
         * Si llegamos hasta aquí,
         * las credenciales son correctas.
         */
        return new LoginResponse(
                "Login exitoso",
                authentication.getName()
        );
    }
}