package com.hoteltaskmanager.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Konfiguracja CORS (Cross-Origin Resource Sharing) dla aplikacji.
 *
 * Umożliwia frontendowi (np. działającemu na porcie 3000) dostęp do zasobów backendu.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    /**
     * Rejestracja reguł CORS dla wszystkich endpointów.
     *
     * @param registry obiekt konfiguracji CORS.
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*");
                //.allowCredentials(false); // Nie zezwalaj na wysyłanie ciasteczek, nagłówków autoryzacyjnych ani poświadczeń w żądaniach cross-origin (CORS)
    }
}
