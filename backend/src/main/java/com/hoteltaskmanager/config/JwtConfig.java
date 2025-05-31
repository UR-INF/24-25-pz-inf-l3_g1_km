package com.hoteltaskmanager.config;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.security.Key;

import java.nio.charset.StandardCharsets;
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
     * 
     * @param username Nazwa użytkownika.
     * @return Wygenerowany token JWT.
     */
    public String generateToken(String username) {
        Key key = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));

        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationTime))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Waliduje token JWT i zwraca jego dane.
     * 
     * @param token Token JWT.
     * @return Informacje zapisane w tokenie.
     */
    public Claims validateToken(String token) {
        Key key = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));

        JwtParser parser = Jwts.parserBuilder()
                .setSigningKey(key)
                .build();

        return parser
                .parseClaimsJws(token)
                .getBody();
    }

    @Bean
    public String getSecretKey() {
        return secretKey;
    }
}
