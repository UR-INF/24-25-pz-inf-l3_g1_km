package com.hoteltaskmanager.util;

import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.nio.file.*;

/**
 * Inicjalizator zdjęć profilowych użytkowników.
 * <p>
 * Klasa odpowiedzialna za automatyczne kopiowanie domyślnych plików zdjęć profilowych
 * z zasobów aplikacji (`resources/avatars/`) do katalogu roboczego
 * na potrzeby serwowania ich z systemu plików (np. `uploads/avatars`).
 * <p>
 * Wykonywana automatycznie po uruchomieniu aplikacji dzięki adnotacji {@link PostConstruct}.
 * Jeśli plik już istnieje w docelowej lokalizacji, kopiowanie jest pomijane.
 */
@Component
public class AvatarInitializer {

    /**
     * Lista nazw plików zdjęć profilowych do skopiowania z zasobów.
     */
    private static final String[] AVATARS = {
        "example1.png",
        "example2.png",
        "example3.png",
        "example4.png",
        "default.png"
    };

    /**
     * Kopiuje domyślne zdjęcia profilowe z katalogu `resources/avatars/`
     * do folderu docelowego `uploads/avatars`, jeśli nie istnieją.
     */
    @PostConstruct
    public void initAvatars() {
        Path targetDir = Paths.get("uploads", "avatars");
        try {
            if (Files.notExists(targetDir)) {
                Files.createDirectories(targetDir);
            }

            for (String avatar : AVATARS) {
                Path avatarPath = targetDir.resolve(avatar);
                if (Files.notExists(avatarPath)) {
                    try (InputStream in = getClass().getResourceAsStream("/avatars/" + avatar)) {
                        if (in != null) {
                            Files.copy(in, avatarPath, StandardCopyOption.REPLACE_EXISTING);
                            System.out.println("Skopiowano zdjęcie profilowe: " + avatar);
                        } else {
                            System.err.println("Nie znaleziono zasobu: " + avatar);
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Błąd przy kopiowaniu zdjęć profilowych: " + e.getMessage());
        }
    }
}
