import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import ManagerDashboard from "../../../views/Manager/ManagerDashboard";

// Mockujemy wszystkie komponenty używane w ManagerDashboard
jest.mock("../../../components/ReservationCard", () => ({
  __esModule: true,
  default: () => <div data-testid="reservation-card">Reservation Card</div>,
}));

jest.mock("../../../components/RoomsCard", () => ({
  __esModule: true,
  default: () => <div data-testid="rooms-card">Rooms Card</div>,
}));

jest.mock("../../../components/RepairsCard", () => ({
  __esModule: true,
  default: () => <div data-testid="repairs-card">Repairs Card</div>,
}));

jest.mock("../../../components/CleaningCard", () => ({
  __esModule: true,
  default: () => <div data-testid="cleaning-card">Cleaning Card</div>,
}));

jest.mock("../../../components/RoomStatusCard", () => ({
  __esModule: true,
  default: () => <div data-testid="room-status-card">Room Status Card</div>,
}));

jest.mock("../../../components/RevenueChart", () => ({
  __esModule: true,
  default: () => <div data-testid="revenue-chart">Revenue Chart</div>,
}));

jest.mock("../../../components/EmployeeCountCard", () => ({
  __esModule: true,
  default: () => <div data-testid="employee-count-card">Employee Count Card</div>,
}));

jest.mock("../../../components/InvoiceCountCard", () => ({
  __esModule: true,
  default: () => <div data-testid="invoice-count-card">Invoice Count Card</div>,
}));

jest.mock("../../../components/ReportCountCard", () => ({
  __esModule: true,
  default: () => <div data-testid="report-count-card">Report Count Card</div>,
}));

// Mockujemy react-router
jest.mock("react-router", () => ({
  Link: ({ children, to, className }) => (
    <a href={to} className={className} data-testid="router-link">
      {children}
    </a>
  ),
}));

describe("ManagerDashboard", () => {
  test("renderuje nagłówek dashboardu", () => {
    render(<ManagerDashboard />);

    // Sprawdzamy czy nagłówek został wyrenderowany
    expect(screen.getByText("Zarządzanie hotelem")).toBeInTheDocument();
    expect(screen.getByText("Podsumowanie")).toBeInTheDocument();
  });

  test("renderuje przycisk dodawania pracownika", () => {
    render(<ManagerDashboard />);

    // Sprawdzamy czy link do dodawania pracowników został wyrenderowany
    const addEmployeeLink = screen.getByTestId("router-link");
    expect(addEmployeeLink).toBeInTheDocument();
    expect(addEmployeeLink).toHaveAttribute("href", "/ManagerDashboard/Employees/Create");
    expect(addEmployeeLink).toHaveTextContent("Dodaj nowego pracownika");
  });

  test("renderuje wszystkie karty z danymi", () => {
    render(<ManagerDashboard />);

    // Sprawdzamy czy wszystkie karty zostały wyrenderowane
    expect(screen.getByTestId("reservation-card")).toBeInTheDocument();
    expect(screen.getByTestId("room-status-card")).toBeInTheDocument();
    expect(screen.getByTestId("employee-count-card")).toBeInTheDocument();
    expect(screen.getByTestId("rooms-card")).toBeInTheDocument();
    expect(screen.getByTestId("repairs-card")).toBeInTheDocument();
    expect(screen.getByTestId("cleaning-card")).toBeInTheDocument();
    expect(screen.getByTestId("report-count-card")).toBeInTheDocument();
    expect(screen.getByTestId("invoice-count-card")).toBeInTheDocument();
    expect(screen.getByTestId("revenue-chart")).toBeInTheDocument();
  });
});
