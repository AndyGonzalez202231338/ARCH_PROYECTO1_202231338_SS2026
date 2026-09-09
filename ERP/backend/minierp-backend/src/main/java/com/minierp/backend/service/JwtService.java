package com.minierp.backend.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.function.Function;

/**
 * Esta clase se encarga de generar y validar tokens JWT.
 * JwtService
 */
@Service
public class JwtService {
    /*
     * Clave secreta para firmar los tokens JWT.
     */
    @Value("${jwt.secret}")
    private String secret;

    /*
     * Tiempo de expiración del token en milisegundos.
     */
    @Value("${jwt.expiration:3600000}")
    private long expiration;

    /*
     * Genera un token JWT para el usuario dado.
     */
    public String generateToken(UserDetails user) {
        Date now = new Date();
        return Jwts.builder().subject(user.getUsername()).issuedAt(now)
                .expiration(new Date(now.getTime() + expiration))
                .signWith(getSigningKey()).compact();
    }

    /*
     * Extrae el nombre de usuario del token JWT.
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /*
     * Verifica si el token JWT es válido para el usuario dado.
     */
    public boolean isTokenValid(String token, UserDetails user) {
        return user.getUsername().equals(extractUsername(token))
                && extractClaim(token, Claims::getExpiration).after(new Date());
    }

    /*
     * Extrae una reclamación del token JWT.
     */
    private <T> T extractClaim(String token, Function<Claims, T> resolver) {
        return resolver.apply(Jwts.parser().verifyWith(getSigningKey()).build()
                .parseSignedClaims(token).getPayload());
    }

    /*
     * Obtiene la clave de firma para el token JWT.
     */
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
    }
}