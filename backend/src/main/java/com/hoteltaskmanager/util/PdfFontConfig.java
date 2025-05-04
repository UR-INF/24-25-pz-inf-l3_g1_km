package com.hoteltaskmanager.util;

import com.itextpdf.text.BaseColor;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.Font;
import com.itextpdf.text.FontFactory;
import com.itextpdf.text.pdf.BaseFont;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class PdfFontConfig {
    // Bazowy rozmiar fontu ustawiony na 12pt (mniejszy dla lepszej czytelności w tabelach)
    private static final float BASE_FONT_SIZE = 12f;

    // Czcionki dla różnych elementów raportów
    private Font normalFont;
    private Font boldFont;
    private Font italicFont;
    private Font titleFont;
    private Font subtitleFont;
    private Font sectionFont;
    private Font headerFont;

    // Użycie BaseFont dla lepszej obsługi polskich znaków
    private BaseFont baseFont;

    public PdfFontConfig() {
        try {
            // Rejestracja czcionek z obsługą polskich znaków
            FontFactory.registerDirectories();


            // Można też użyć wbudowanej czcionki z obsługą Unicode
            baseFont = BaseFont.createFont(BaseFont.TIMES_ROMAN, BaseFont.CP1250, BaseFont.EMBEDDED);

            // Konfiguracja fontów z kodowaniem CP1250
            normalFont = new Font(baseFont, BASE_FONT_SIZE, Font.NORMAL, BaseColor.BLACK);
            boldFont = new Font(baseFont, BASE_FONT_SIZE, Font.BOLD, BaseColor.BLACK);
            italicFont = new Font(baseFont, BASE_FONT_SIZE, Font.ITALIC, BaseColor.BLACK);
            titleFont = new Font(baseFont, BASE_FONT_SIZE + 8, Font.BOLD, BaseColor.BLACK);
            subtitleFont = new Font(baseFont, BASE_FONT_SIZE + 2, Font.ITALIC, BaseColor.DARK_GRAY);
            sectionFont = new Font(baseFont, BASE_FONT_SIZE + 4, Font.BOLD, BaseColor.BLACK);
            headerFont = new Font(baseFont, BASE_FONT_SIZE, Font.BOLD, BaseColor.WHITE);

        } catch (Exception e) {
            throw new RuntimeException("Błąd przy inicjalizacji fontów PDF: " + e.getMessage(), e);
        }
    }

    // Gettery dla wszystkich fontów
    public Font getNormalFont() {
        return normalFont;
    }

    public Font getBoldFont() {
        return boldFont;
    }

    public Font getItalicFont() {
        return italicFont;
    }

    public Font getTitleFont() {
        return titleFont;
    }

    public Font getSubtitleFont() {
        return subtitleFont;
    }

    public Font getSectionFont() {
        return sectionFont;
    }

    public Font getHeaderFont() {
        return headerFont;
    }

    public BaseFont getBaseFont() {
        return baseFont;
    }

    // Metoda dla koloru tła nagłówków
    public BaseColor getHeaderBackgroundColor() {
        return new BaseColor(66, 139, 202); // Niebieski
    }
}