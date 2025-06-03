import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import RoleBasedDashboardView from "../../views/RoleBasedDashboardView";
import { useUser, RoleName } from "../../contexts/user";
import DashboardAlert from "../../components/DashboardAlert";

// Mockujemy moduły dla dashboardów
jest.mock("../../views/Manager/ManagerDashboard", () => ({
  __esModule: true,
  default: () => <div data-testid="manager-dashboard">Manager Dashboard</div>,
}));

jest.mock("../../views/Receptionist/ReceptionistDashboard", () => ({
  __esModule: true,
  default: () => <div data-testid="receptionist-dashboard">Receptionist Dashboard</div>,
}));

jest.mock("../../views/Housekeeper/HousekeeperDashboard", () => ({
  __esModule: true,
  default: () => <div data-testid="housekeeper-dashboard">Housekeeper Dashboard</div>,
}));

jest.mock("../../views/Maintenance/MaintenanceDashboard", () => ({
  __esModule: true,
  default: () => <div data-testid="maintenance-dashboard">Maintenance Dashboard</div>,
}));

// Mockujemy komponent DashboardAlert
jest.mock("../../components/DashboardAlert", () => ({
  __esModule: true,
  default: jest.fn(({ heading, description }) => (
    <div data-testid="dashboard-alert">
      <h2>{heading}</h2>
      <p>{description}</p>
    </div>
  )),
}));

// Mockujemy hook useUser
jest.mock("../../contexts/user", () => ({
  __esModule: true,
  useUser: jest.fn(),
  RoleName: {
    MANAGER: "MANAGER",
    RECEPTIONIST: "RECEPTIONIST",
    HOUSEKEEPER: "HOUSEKEEPER",
    MAINTENANCE: "MAINTENANCE",
  },
}));

describe("RoleBasedDashboardView", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renderuje dashboard dla roli Manager", () => {
    // Konfigurujemy mock useUser
    (useUser as jest.Mock).mockReturnValue({
      userRoleName: RoleName.MANAGER,
      error: null,
    });

    render(<RoleBasedDashboardView />);

    expect(screen.getByTestId("manager-dashboard")).toBeInTheDocument();
  });

  test("renderuje dashboard dla roli Receptionist", () => {
    (useUser as jest.Mock).mockReturnValue({
      userRoleName: RoleName.RECEPTIONIST,
      error: null,
    });

    render(<RoleBasedDashboardView />);

    expect(screen.getByTestId("receptionist-dashboard")).toBeInTheDocument();
  });

  test("renderuje dashboard dla roli Housekeeper", () => {
    (useUser as jest.Mock).mockReturnValue({
      userRoleName: RoleName.HOUSEKEEPER,
      error: null,
    });

    render(<RoleBasedDashboardView />);

    expect(screen.getByTestId("housekeeper-dashboard")).toBeInTheDocument();
  });

  test("renderuje dashboard dla roli Maintenance", () => {
    (useUser as jest.Mock).mockReturnValue({
      userRoleName: RoleName.MAINTENANCE,
      error: null,
    });

    render(<RoleBasedDashboardView />);

    expect(screen.getByTestId("maintenance-dashboard")).toBeInTheDocument();
  });

  test("renderuje alert gdy wystąpi błąd", () => {
    const errorMessage = "Błąd pobierania danych użytkownika";

    (useUser as jest.Mock).mockReturnValue({
      userRoleName: null,
      error: errorMessage,
    });

    render(<RoleBasedDashboardView />);

    expect(DashboardAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        heading: "Błąd aplikacji",
        description: errorMessage,
      }),
      expect.anything(),
    );

    expect(screen.getByTestId("dashboard-alert")).toBeInTheDocument();
    expect(screen.getByText("Błąd aplikacji")).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  test("renderuje komunikat o braku dostępu gdy rola jest nieznana", () => {
    (useUser as jest.Mock).mockReturnValue({
      userRoleName: "NIEZNANA_ROLA",
      error: null,
    });

    render(<RoleBasedDashboardView />);

    expect(DashboardAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        heading: "Brak dostępu",
        description: "Twoja rola nie została jeszcze zaimplementowana lub nie istnieje w systemie.",
      }),
      expect.anything(),
    );

    expect(screen.getByTestId("dashboard-alert")).toBeInTheDocument();
    expect(screen.getByText("Brak dostępu")).toBeInTheDocument();
  });
});
