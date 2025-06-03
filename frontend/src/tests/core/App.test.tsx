import React from "react";
import { render, screen } from "@testing-library/react";
import App from "../../App";
import { useAuth } from "../../contexts/auth";
import { useUser } from "../../contexts/user";
import { MemoryRouter } from "react-router";

// Mock kontekstów
jest.mock("../../contexts/auth", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../../contexts/user", () => ({
  useUser: jest.fn(),
}));

// Mock komponentów z react-router
jest.mock("react-router", () => {
  return {
    ...jest.requireActual("react-router"),
    Navigate: () => <div data-testid="navigate">Navigate</div>,
    useNavigate: () => jest.fn(),
  };
});

// Mock komponentów widoków
jest.mock("../../views/LoginView", () => () => <div data-testid="login-view">Login View</div>);
jest.mock("../../layouts/DashboardLayout", () => ({ children }: { children: React.ReactNode }) => (
  <div data-testid="dashboard-layout">{children}</div>
));

describe("App", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("pokazuje ladowanie gdy auth lub user jest w stanie loading", () => {
    (useAuth as jest.Mock).mockReturnValue({ state: { loading: true, loggedIn: false } });
    (useUser as jest.Mock).mockReturnValue({ loading: false });
    render(<App />);
    expect(screen.getByText("Ładowanie aplikacji...")).toBeInTheDocument();
  });

  test("pokazuje LoginView gdy uzytkownik nie jest zalogowany", () => {
    (useAuth as jest.Mock).mockReturnValue({ state: { loading: false, loggedIn: false } });
    (useUser as jest.Mock).mockReturnValue({ loading: false });

    // Testujemy bezposrednio sciezke /login zamiast polegac na przekierowaniu
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("login-view")).toBeInTheDocument();
  });

  test("przekierowuje do /login gdy uzytkownik probuje dostac sie do chronionej sciezki bez logowania", () => {
    (useAuth as jest.Mock).mockReturnValue({ state: { loading: false, loggedIn: false } });
    (useUser as jest.Mock).mockReturnValue({ loading: false });

    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );

    // Sprawdzamy czy nastapilo przekierowanie do strony logowania
    expect(screen.getByTestId("navigate")).toBeInTheDocument();
  });

  test("pokazuje DashboardLayout gdy uzytkownik jest zalogowany", () => {
    (useAuth as jest.Mock).mockReturnValue({ state: { loading: false, loggedIn: true } });
    (useUser as jest.Mock).mockReturnValue({ loading: false, userRoleName: "RECEPTIONIST" });
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("dashboard-layout")).toBeInTheDocument();
  });
});
