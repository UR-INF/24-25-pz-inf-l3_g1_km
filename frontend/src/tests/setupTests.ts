/**
 * Plik konfiguracyjny dla testów, wykonywany przed wszystkimi testami
 * Definiuje globalne polyfille i ustawienia dla środowiska testowego
 */
import { TextEncoder, TextDecoder } from "util";
import "@testing-library/jest-dom";

// Polyfill dla TextEncoder/TextDecoder - potrzebne dla testów w Node.js
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Można tu dodać więcej globalnych ustawień dla testów
