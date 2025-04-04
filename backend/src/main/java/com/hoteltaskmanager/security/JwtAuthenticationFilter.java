package com.hoteltaskmanager.security;

import com.hoteltaskmanager.config.JwtConfig;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.List;

/**
 * Filtr JWT - przechwytuje każde żądanie HTTP i sprawdza poprawność tokenu JWT.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtConfig jwtConfig;

    // Wstrzyknięcie komponentu konfiguracyjnego JWT
    public JwtAuthenticationFilter(JwtConfig jwtConfig) {
        this.jwtConfig = jwtConfig;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        // 1. Pobranie tokenu z nagłówka Authorization
        String token = extractTokenFromRequest(request);

        // 2. Jeśli token istnieje, sprawdź jego poprawność
        if (token != null) {
            try {
                Claims claims = jwtConfig.validateToken(token);
                String email = claims.getSubject();

                // 3. Jeśli użytkownik nie jest jeszcze uwierzytelniony
                if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                    // Tworzymy obiekt uwierzytelnienia
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    email,
                                    null,
                                    List.of(new SimpleGrantedAuthority("ROLE_USER"))
                            );

                    // Szczegóły requestu, np. adres IP
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    // 4. Ustawiamy użytkownika jako zalogowanego w kontekście bezpieczeństwa
                    SecurityContextHolder.getContext().setAuthentication(authentication);

                    // System.out.println(">>> Zalogowano użytkownika: " + email);
                }

            } catch (Exception ex) {
                // Obsługa nieprawidłowego tokenu, nie przerywamy żądania
                System.out.println("Błąd podczas walidacji JWT: " + ex.getMessage());
            }
        }

        // 5. Kontynuujemy filtrację dalej
        filterChain.doFilter(request, response);
    }

    /**
     * Ekstrakcja tokenu JWT z nagłówka Authorization.
     */
    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");

        // Sprawdzamy czy nagłówek istnieje i zaczyna się od "Bearer "
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7); // usunięcie "Bearer " z przodu
        }
        return null;
    }
}
