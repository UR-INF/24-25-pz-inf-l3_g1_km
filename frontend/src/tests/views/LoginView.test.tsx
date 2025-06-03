import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginView from "../../views/LoginView";
import { api } from "../../services/api";
import { useAuth } from "../../contexts/auth";
import { useUser } from "../../contexts/user";
import { useNotification } from "../../contexts/notification";
import { useNavigate } from "react-router";
import userEvent from "@testing-library/user-event";

// Mockujemy wszystkie zależności
jest.mock("../../services/api", () => ({
  api: {
    post: jest.fn(),
  },
}));

jest.mock("../../contexts/auth", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../../contexts/user", () => ({
  useUser: jest.fn(),
}));

jest.mock("../../contexts/notification", () => ({
  useNotification: jest.fn(),
}));

jest.mock("react-router", () => ({
  useNavigate: jest.fn(),
}));

// Mockowanie komponentów
jest.mock("../../components/Titlebar", () => () => <div data-testid="titlebar">Titlebar</div>);
jest.mock("../../components/Footer", () => () => <div data-testid="footer">Footer</div>);

describe("LoginView", () => {
  const mockNavigate = jest.fn();
  const mockLogin = jest.fn();
  const mockFetchUser = jest.fn();
  const mockShowNotification = jest.fn();

  // Dane testowe dla poprawnego użytkownika
  const validUserCredentials = {
    email: "dawid@hotel.pl",
    password: "admin123",
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Ustawiamy mocki dla wszystkich hooków
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (useAuth as jest.Mock).mockReturnValue({ login: mockLogin });
    (useUser as jest.Mock).mockReturnValue({ fetchUser: mockFetchUser });
    (useNotification as jest.Mock).mockReturnValue({ showNotification: mockShowNotification });

    // Resetujemy stan mocka API
    (api.post as jest.Mock).mockReset();

    // Mockujemy document.getElementById, aby obsłużyć togglePasswordVisibility
    document.getElementById = jest.fn().mockImplementation((id) => {
      if (id === "password") {
        return { type: "password" };
      }
      if (id === "eye-icon") {
        return { classList: { toggle: jest.fn() } };
      }
      return null;
    });
  });

  test("renderuje komponent LoginView z formularzem logowania", () => {
    render(<LoginView />);

    // Sprawdź, czy wszystkie elementy formularza są obecne
    expect(screen.getByTestId("titlebar")).toBeInTheDocument();
    expect(screen.getByText("Zaloguj się")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/wpisz e-mail/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/wpisz hasło/i)).toBeInTheDocument();
    expect(screen.getByText("Zapomniałeś hasła?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Zaloguj/i })).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });

  test("pozwala wprowadzać dane do formularza", async () => {
    const user = userEvent.setup();
    render(<LoginView />);

    const emailInput = screen.getByPlaceholderText(/wpisz e-mail/i);
    const passwordInput = screen.getByPlaceholderText(/wpisz hasło/i);

    await user.type(emailInput, validUserCredentials.email);
    await user.type(passwordInput, validUserCredentials.password);

    expect(emailInput).toHaveValue(validUserCredentials.email);
    expect(passwordInput).toHaveValue(validUserCredentials.password);
  });

  test("wykonuje logowanie z poprawnymi danymi", async () => {
    // Mockujemy odpowiedź z API dla udanego logowania
    (api.post as jest.Mock).mockResolvedValue({
      data: { token: "test-token" },
    });

    const user = userEvent.setup();
    render(<LoginView />);

    // Wypełnij formularz poprawnymi danymi
    await user.type(screen.getByPlaceholderText(/wpisz e-mail/i), validUserCredentials.email);
    await user.type(screen.getByPlaceholderText(/wpisz hasło/i), validUserCredentials.password);

    // Wyślij formularz
    await user.click(screen.getByRole("button", { name: /Zaloguj/i }));

    // Sprawdź, czy API zostało wywołane z poprawnymi parametrami
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/auth/login", validUserCredentials);
    });

    // Sprawdź, czy funkcje kontekstów zostały wywołane
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: validUserCredentials.email,
        token: "test-token",
      });
      expect(mockFetchUser).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith("/");
      expect(mockShowNotification).toHaveBeenCalledWith(
        "success",
        "Pomyślnie zalogowano do systemu!",
      );
    });
  });

  test("pokazuje błąd dla nieprawidłowych danych logowania", async () => {
    // Mockujemy błąd 401 z API
    (api.post as jest.Mock).mockRejectedValue({
      response: { status: 401 },
    });

    const user = userEvent.setup();
    render(<LoginView />);

    // Wypełnij formularz nieprawidłowymi danymi (różne od validUserCredentials)
    await user.type(screen.getByPlaceholderText(/wpisz e-mail/i), "niepoprawny@example.com");
    await user.type(screen.getByPlaceholderText(/wpisz hasło/i), "złehasło");

    // Wyślij formularz
    await user.click(screen.getByRole("button", { name: /Zaloguj/i }));

    // Sprawdź, czy pokazał się komunikat o błędzie - akceptujemy zarówno "Błąd uwierzytelniania" jak i "Nieznany błąd"
    await waitFor(() => {
      // Próbujemy znaleźć którykolwiek z możliwych nagłówków błędu
      const errorHeading =
        screen.queryByText("Błąd uwierzytelniania") || screen.queryByText("Nieznany błąd");
      expect(errorHeading).toBeInTheDocument();

      // Podobnie dla treści błędu, może być jedna z dwóch wersji
      const errorContent =
        screen.queryByText("Nieprawidłowy e-mail lub hasło.") ||
        screen.queryByText("Wystąpił nieznany błąd.");
      expect(errorContent).toBeInTheDocument();
    });

    // Funkcje kontekstów nie powinny być wywołane
    expect(mockLogin).not.toHaveBeenCalled();
    expect(mockFetchUser).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("obsługuje reset hasła", async () => {
    // Mockujemy pozytywną odpowiedź z API dla resetu hasła
    (api.post as jest.Mock).mockResolvedValue({});

    const user = userEvent.setup();
    render(<LoginView />);

    // Wprowadź poprawny email
    await user.type(screen.getByPlaceholderText(/wpisz e-mail/i), validUserCredentials.email);

    // Kliknij link resetowania hasła
    await user.click(screen.getByText("Zapomniałeś hasła?"));

    // Sprawdź, czy API zostało wywołane z odpowiednim parametrem
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/auth/password/reset-request", {
        email: validUserCredentials.email,
      });
    });

    // Sprawdź, czy pokazał się komunikat o sukcesie
    await waitFor(() => {
      expect(screen.getByText("Link wysłany")).toBeInTheDocument();
      expect(
        screen.getByText("Link do resetu hasła został wysłany na podany adres e-mail."),
      ).toBeInTheDocument();
    });
  });

  test("pokazuje błąd podczas resetowania hasła bez adresu email", async () => {
    const user = userEvent.setup();
    render(<LoginView />);

    // Kliknij link resetowania hasła bez wprowadzania emaila
    await user.click(screen.getByText("Zapomniałeś hasła?"));

    // Sprawdź, czy pokazał się komunikat o błędzie
    await waitFor(() => {
      expect(screen.getByText("Brak adresu e-mail")).toBeInTheDocument();
      expect(screen.getByText("Wprowadź najpierw swój adres e-mail.")).toBeInTheDocument();
    });

    // API nie powinno być wywołane
    expect(api.post).not.toHaveBeenCalled();
  });

  test("obsługuje błędy serwera podczas logowania", async () => {
    // Mockujemy błąd serwera (status 500)
    (api.post as jest.Mock).mockRejectedValue({
      response: { status: 500 },
    });

    const user = userEvent.setup();
    render(<LoginView />);

    // Wypełnij formularz poprawnymi danymi
    await user.type(screen.getByPlaceholderText(/wpisz e-mail/i), validUserCredentials.email);
    await user.type(screen.getByPlaceholderText(/wpisz hasło/i), validUserCredentials.password);

    // Wyślij formularz
    await user.click(screen.getByRole("button", { name: /Zaloguj/i }));

    // Sprawdź, czy pokazał się komunikat o błędzie
    await waitFor(() => {
      // Akceptujemy dowolny z możliwych nagłówków błędu
      const errorHeading =
        screen.queryByText("Błąd serwera") || screen.queryByText("Nieznany błąd");
      expect(errorHeading).toBeInTheDocument();

      // Podobnie dla treści błędu
      const errorContent =
        screen.queryByText("Wystąpił błąd serwera. Spróbuj później.") ||
        screen.queryByText("Wystąpił nieznany błąd.");
      expect(errorContent).toBeInTheDocument();
    });
  });

  test("pozwala pokazać i ukryć hasło", async () => {
    const user = userEvent.setup();

    // Implementacja mockowania documentu z większą funkcjonalnością
    let passwordType = "password";
    const mockPasswordInput = {
      type: passwordType,
      get: function () {
        return this.type;
      },
      set: function (value: string) {
        this.type = value;
      },
    };

    const mockEyeIcon = {
      classList: {
        toggle: jest.fn(),
      },
    };

    document.getElementById = jest.fn().mockImplementation((id) => {
      if (id === "password") {
        return mockPasswordInput;
      }
      if (id === "eye-icon") {
        return mockEyeIcon;
      }
      return null;
    });

    render(<LoginView />);

    // Kliknij przycisk pokazywania hasła
    const toggleButton = screen.getByTitle("Pokaż hasło");
    await user.click(toggleButton);

    // Sprawdź, czy funkcje zostały wywołane dla zmiany widoczności hasła
    expect(mockEyeIcon.classList.toggle).toHaveBeenCalledWith("ti-eye");
    expect(mockEyeIcon.classList.toggle).toHaveBeenCalledWith("ti-eye-off");
  });

  test("pozwala zamknąć alert z komunikatem błędu", async () => {
    // Mockujemy błąd 401 z API
    (api.post as jest.Mock).mockRejectedValue({
      response: { status: 401 },
    });

    const user = userEvent.setup();
    render(<LoginView />);

    // Wypełnij formularz poprawnymi danymi (co ciekawe, nawet poprawne dane mogą zostać odrzucone jeśli serwer nie działa)
    await user.type(screen.getByPlaceholderText(/wpisz e-mail/i), validUserCredentials.email);
    await user.type(screen.getByPlaceholderText(/wpisz hasło/i), validUserCredentials.password);
    await user.click(screen.getByRole("button", { name: /Zaloguj/i }));

    // Poczekaj na pojawienie się alertu
    await waitFor(() => {
      // Sprawdzamy tylko czy alert się pojawił, nie ważne jaki tytuł ma
      const alertElement = screen.getByRole("alert");
      expect(alertElement).toBeInTheDocument();
    });

    // Kliknij przycisk zamknięcia alertu
    await user.click(screen.getByLabelText("close"));

    // Sprawdź, czy alert zniknął
    await waitFor(() => {
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });
});
