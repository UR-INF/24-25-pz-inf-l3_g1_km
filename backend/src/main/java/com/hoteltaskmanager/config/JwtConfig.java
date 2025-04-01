package com.hoteltaskmanager.config;

import io.jsonwebtoken.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.util.Date;

/**
 * Konfiguracja JWT - generowanie i walidacja tokenów.
 */
@Configuration
public class JwtConfig {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expirationTime}")
    private long expirationTime;

    /**
     * Generuje token JWT dla podanego użytkownika.
     * @param username Nazwa użytkownika.
     * @return Wygenerowany token JWT.
     */
    public String generateToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationTime))
                .signWith(SignatureAlgorithm.HS256, secretKey)
                .compact();
    }

    /**
     * Waliduje token JWT i zwraca jego dane.
     * @param token Token JWT.
     * @return Informacje zapisane w tokenie.
     */
    public Claims validateToken(String token) {
        return Jwts.parser()
                .setSigningKey(secretKey)
                .parseClaimsJws(token)
                .getBody();
    }

    @Bean
    public String getSecretKey() {
        return secretKey;
    }
}
