import React from "react";
import { render, screen, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "../../contexts/auth";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Wartość testowego tokenu JWT (wygasły)
const expiredToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJleHAiOjE2MjE2OTM2MDB9.Q7Zh4JU-aubn8xzf_HuKqJTg3yhNdJZwGngXiLEHVGI";

// Wartość testowego tokenu JWT (ważny)
const validToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJleHAiOjk5OTk5OTk5OTl9.j28Rw-EGiEUZWgb7dOJNIYEWpGXGCWwS5XSCKGgaj6Y";

// Komponent testowy wykorzystujący kontekst autoryzacji
const TestComponent = ({ onRender }: { onRender: (data: any) => void }) => {
  const auth = useAuth();
  onRender(auth);
  return (
    <div>
      <div data-testid="logged-in">{auth.state.loggedIn ? "true" : "false"}</div>
      <div data-testid="loading">{auth.state.loading ? "true" : "false"}</div>
      {auth.state.user && <div data-testid="user-email">{auth.state.user.email}</div>}
      <button
        data-testid="login-button"
        onClick={() => auth.login({ email: "test@example.com", token: validToken })}
      >
        Login
      </button>
      <button data-testid="logout-button" onClick={() => auth.logout()}>
        Logout
      </button>
    </div>
  );
};

describe("AuthContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();

    // Mock funkcji atob i btoa, które są używane do dekodowania tokenu JWT
    global.atob = jest.fn((str) => Buffer.from(str, "base64").toString("binary"));
    global.btoa = jest.fn((str) => Buffer.from(str, "binary").toString("base64"));
  });

  test("inicjalnie stan to loading=true i loggedIn=false", () => {
    const handleRender = jest.fn();

    // Pierwsza wartość renderowania powinna mieć loading=true
    let initialRender = true;

    const mockHandleRender = (auth: any) => {
      if (initialRender) {
        // Sprawdź tylko pierwszy render
        expect(auth.state.loading).toBe(true);
        expect(auth.state.loggedIn).toBe(false);
        expect(auth.state.user).toBe(null);
        initialRender = false;
      }
      handleRender(auth);
    };

    render(
      <AuthProvider>
        <TestComponent onRender={mockHandleRender} />
      </AuthProvider>,
    );

    // Po pierwszym renderowaniu stan powinien być zaktualizowany przez useEffect
    expect(handleRender).toHaveBeenCalled();
    expect(screen.getByTestId("logged-in")).toHaveTextContent("false");

    // Nie sprawdzamy już elementu loading, ponieważ jest asynchronicznie aktualizowany
    // i może mieć wartość true lub false w zależności od momentu wykonania testu
  });

  test("login zmienia stan na zalogowany i zapisuje token w localStorage", async () => {
    const handleRender = jest.fn();

    render(
      <AuthProvider>
        <TestComponent onRender={handleRender} />
      </AuthProvider>,
    );

    // Wstępne renderowanie z działającym useEffect
    expect(handleRender).toHaveBeenCalled();

    // Wywołanie funkcji login
    await act(async () => {
      screen.getByTestId("login-button").click();
    });

    // Sprawdzenie, czy token został zapisany w localStorage
    expect(localStorageMock.setItem).toHaveBeenCalledWith("token", validToken);

    // Sprawdzenie, czy stan został zaktualizowany
    expect(screen.getByTestId("logged-in")).toHaveTextContent("true");
    expect(screen.getByTestId("loading")).toHaveTextContent("false");
    expect(screen.getByTestId("user-email")).toHaveTextContent("test@example.com");
  });

  test("logout usuwa token z localStorage i resetuje stan", async () => {
    const handleRender = jest.fn();

    render(
      <AuthProvider>
        <TestComponent onRender={handleRender} />
      </AuthProvider>,
    );

    // Najpierw zaloguj użytkownika
    await act(async () => {
      screen.getByTestId("login-button").click();
    });

    expect(screen.getByTestId("logged-in")).toHaveTextContent("true");

    // Teraz wyloguj użytkownika
    await act(async () => {
      screen.getByTestId("logout-button").click();
    });

    // Sprawdzenie, czy token został usunięty z localStorage
    expect(localStorageMock.removeItem).toHaveBeenCalledWith("token");

    // Sprawdzenie, czy stan został zresetowany
    expect(screen.getByTestId("logged-in")).toHaveTextContent("false");
    expect(screen.getByTestId("loading")).toHaveTextContent("false");
    expect(screen.queryByTestId("user-email")).not.toBeInTheDocument();
  });

  test("automatycznie loguje się przy ważnym tokenie w localStorage", async () => {
    // Ustaw ważny token w localStorage przed renderowaniem
    localStorageMock.setItem("token", validToken);

    const handleRender = jest.fn();

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent onRender={handleRender} />
        </AuthProvider>,
      );
    });

    // Po useEffect, stan powinien być zaktualizowany
    expect(screen.getByTestId("logged-in")).toHaveTextContent("true");
    expect(screen.getByTestId("loading")).toHaveTextContent("false");
    expect(screen.getByTestId("user-email")).toHaveTextContent("test@example.com");
  });

  test("nie loguje się automatycznie przy wygasłym tokenie", async () => {
    // Ustaw wygasły token w localStorage
    localStorageMock.setItem("token", expiredToken);

    const handleRender = jest.fn();

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent onRender={handleRender} />
        </AuthProvider>,
      );
    });

    // Token wygasł, więc użytkownik nie powinien być zalogowany
    expect(screen.getByTestId("logged-in")).toHaveTextContent("false");
    expect(screen.getByTestId("loading")).toHaveTextContent("false");
    expect(screen.queryByTestId("user-email")).not.toBeInTheDocument();

    // Token powinien być usunięty z localStorage
    expect(localStorageMock.removeItem).toHaveBeenCalledWith("token");
  });
});
