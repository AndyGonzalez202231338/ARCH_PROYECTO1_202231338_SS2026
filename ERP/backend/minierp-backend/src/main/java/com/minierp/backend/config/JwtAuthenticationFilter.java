package com.minierp.backend.config;

import com.minierp.backend.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Filtro que se ejecuta una vez por petición HTTP.
 *
 * Extrae el JWT del header Authorization, valida su firma y expiración,
 * y — si es válido — coloca la autenticación en el SecurityContext.
 *
 * IMPORTANTE: este filtro YA NO consulta la base de datos.
 * El rol viene dentro del propio token (claim "role"), firmado por
 * el servidor. Esto elimina 1 SELECT por cada request autenticado.
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        // Sin token -> dejar pasar (el entry point se encargará del 401)
        if (header == null || !header.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String token = header.substring(7);

            // Solo validamos si aún no hay autenticación en el contexto
            if (SecurityContextHolder.getContext().getAuthentication() == null
                    && jwtService.isTokenValid(token)) {

                String email = jwtService.extractUsername(token);
                String role = jwtService.extractRole(token);

                if (email != null && role != null) {
                    var authorities = List.of(new SimpleGrantedAuthority(role));
                    var authentication = new UsernamePasswordAuthenticationToken(
                            email, null, authorities);
                    authentication.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        } catch (RuntimeException ignored) {
            // Token inválido, expirado o manipulado: limpiamos el contexto.
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
}