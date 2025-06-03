package com.hoteltaskmanager.util;

import com.itextpdf.text.BaseColor;
import com.itextpdf.text.Font;
import com.itextpdf.text.FontFactory;
import com.itextpdf.text.pdf.BaseFont;
import org.springframework.stereotype.Component;

/**
 * Konfiguracja czcionek PDF wykorzystywanych w generowanych dokumentach.
 * Używa czcionki Times Roman z kodowaniem CP1250 w celu poprawnej obsługi polskich znaków.
 */
@Component
public class PdfFontConfig {
    /** Bazowy rozmiar czcionki (domyślnie 12pt) */
    private static final float BASE_FONT_SIZE = 12f;

    private Font normalFont;
    private Font boldFont;
    private Font italicFont;
    private Font titleFont;
    private Font subtitleFont;
    private Font sectionFont;
    private Font headerFont;

    private BaseFont baseFont;

    /**
     * Inicjalizuje czcionki wykorzystywane w raportach PDF z uwzględnieniem obsługi polskich znaków.
     * Czcionki są tworzone na podstawie BaseFont z kodowaniem CP1250.
     */
    public PdfFontConfig() {
        try {
            FontFactory.registerDirectories();

            baseFont = BaseFont.createFont(BaseFont.TIMES_ROMAN, BaseFont.CP1250, BaseFont.EMBEDDED);

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

    /**
     * Zwraca czcionkę podstawową.
     * @return Czcionka normalna
     */
    public Font getNormalFont() {
        return normalFont;
    }

    /**
     * Zwraca czcionkę pogrubioną.
     * @return Czcionka pogrubiona
     */
    public Font getBoldFont() {
        return boldFont;
    }

    /**
     * Zwraca czcionkę pochyloną.
     * @return Czcionka italic
     */
    public Font getItalicFont() {
        return italicFont;
    }

    /**
     * Zwraca czcionkę dla tytułów.
     * @return Czcionka tytułu
     */
    public Font getTitleFont() {
        return titleFont;
    }

    /**
     * Zwraca czcionkę dla podtytułów.
     * @return Czcionka podtytułu
     */
    public Font getSubtitleFont() {
        return subtitleFont;
    }

    /**
     * Zwraca czcionkę dla nagłówków sekcji.
     * @return Czcionka sekcji
     */
    public Font getSectionFont() {
        return sectionFont;
    }

    /**
     * Zwraca czcionkę nagłówka tabeli.
     * @return Czcionka nagłówka
     */
    public Font getHeaderFont() {
        return headerFont;
    }

    /**
     * Zwraca podstawowy font (BaseFont), wykorzystywany do tworzenia innych czcionek.
     * @return BaseFont
     */
    public BaseFont getBaseFont() {
        return baseFont;
    }

    /**
     * Zwraca kolor tła nagłówka tabeli.
     * @return Kolor nagłówka (niebieski)
     */
    public BaseColor getHeaderBackgroundColor() {
        return new BaseColor(66, 139, 202);
    }
}
