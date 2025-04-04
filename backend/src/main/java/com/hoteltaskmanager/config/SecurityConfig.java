package com.hoteltaskmanager.config;

import com.hoteltaskmanager.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Główna konfiguracja Spring Security.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    /**
     * Konfiguracja filtrów zabezpieczeń HTTP.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Wyłączenie CSRF (zalecane dla API z JWT)
            .csrf(csrf -> csrf.disable())

            // Konfiguracja żądań - które endpointy są dostępne bez autoryzacji
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**", "/reset-password.html").permitAll() // publiczne
                .anyRequest().authenticated() // reszta wymaga autoryzacji
            )

            // Ustawienie polityki sesji na stateless (bez sesji HTTP)
            .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // Wstawienie naszego filtra JWT przed UsernamePasswordAuthenticationFilter
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
