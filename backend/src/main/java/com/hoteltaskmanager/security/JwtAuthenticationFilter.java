package com.hoteltaskmanager.security;

import com.hoteltaskmanager.config.JwtConfig;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureException;
import io.jsonwebtoken.UnsupportedJwtException;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.io.IOException;

/**
 * Filtr JWT do autoryzacji żądań HTTP.
 */
@WebFilter
@Component
public class JwtAuthenticationFilter implements Filter {

    @Autowired
    private JwtConfig jwtConfig;

    /**
     * Filtruje żądania HTTP w celu sprawdzenia tokenu JWT.
     * @param request Żądanie HTTP.
     * @param response Odpowiedź HTTP.
     * @param chain Łańcuch filtrów.
     * @throws IOException Jeśli wystąpi błąd wejścia/wyjścia.
     * @throws ServletException Jeśli wystąpi błąd serwletu.
     */
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        String token = httpRequest.getHeader("Authorization");

        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
            try {
                Claims claims = jwtConfig.validateToken(token);
                httpRequest.setAttribute("user", claims.getSubject());
            } catch (ExpiredJwtException e) {
                httpResponse.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token expired");
                return;
            } catch (UnsupportedJwtException | MalformedJwtException | SignatureException e) {
                httpResponse.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid token");
                return;
            } catch (Exception e) {
                httpResponse.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token validation error");
                return;
            }
        }
        
        chain.doFilter(request, response);
    }
}