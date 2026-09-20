package com.minierp.backend.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * Servicio responsable de generar y validar tokens JWT.
 *
 * El token incluye:
 *  - subject  : email del usuario
 *  - role     : autoridad principal (ej. "ROLE_ADMINISTRACION")
 *  - iat      : fecha de emisión
 *  - exp      : fecha de expiración
 *
 * Gracias al claim "role", el filtro JWT puede autenticar peticiones
 * sin necesidad de consultar la base de datos en cada request.
 */
@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration-ms:3600000}")   // 1 hora por defecto
    private long expirationMs;

    // GENERACIÓN DEL TOKEN
    public String generateToken(UserDetails user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", extraerRolPrincipal(user));
        return buildToken(claims, user.getUsername());
    }

    private String buildToken(Map<String, Object> claims, String subject) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(now)
                .setExpiration(exp)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Devuelve la primera autoridad del usuario. En este sistema
     * cada usuario tiene exactamente una authority ("ROLE_XXX"),
     * así que tomamos la primera.
     */
    private String extraerRolPrincipal(UserDetails user) {
        return user.getAuthorities().stream()
                .findFirst()
                .map(GrantedAuthority::getAuthority)
                .orElse("ROLE_USER");
    }

    // EXTRACCIÓN DE CLAIMS
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String extractRole(String token) {
        return extractClaim(token, claims -> claims.get("role", String.class));
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> resolver) {
        Claims claims = extractAllClaims(token);
        return resolver.apply(claims);
    }

        private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())   // Reemplaza a setSigningKey()
                .build()
                .parseSignedClaims(token)      // Reemplaza a parseClaimsJws()
                .getPayload();                 // Reemplaza a getBody()
    }

    // VALIDACIÓN
    public boolean isTokenValid(String token, UserDetails user) {
        try {
            final String username = extractUsername(token);
            return username.equals(user.getUsername()) && !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Variante que no requiere un UserDetails (útil en el filtro JWT,
     * donde solo queremos validar firma y expiración).
     */
    public boolean isTokenValid(String token) {
        try {
            return !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }
}