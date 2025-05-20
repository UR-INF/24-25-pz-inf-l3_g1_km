/**
 * Plik konfiguracyjny dla test�w, wykonywany przed wszystkimi testami
 * Definiuje globalne polyfille i ustawienia dla �rodowiska testowego
 */
import { TextEncoder, TextDecoder } from "util";
import "@testing-library/jest-dom";

// Polyfill dla TextEncoder/TextDecoder - potrzebne dla test�w w Node.js
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Mo�na tu doda� wi�cej globalnych ustawie� dla test�w
