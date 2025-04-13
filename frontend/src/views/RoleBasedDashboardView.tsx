import { useEffect } from "react";
import { useUser, RoleName } from "../contexts/user";
import ReceptionistDashboard from "./ReceptionistDashboard.tsx";
// import ManagerDashboard from "./ManagerDashboard.tsx";
// import HousekeeperDashboard from "./HousekeeperDashboard.tsx";
// import MaintenanceDashboard from "./MaintenanceDashboard.tsx";

const RoleBasedDashboardView = () => {
  const { user, loading, error, fetchUser, userRoleName } = useUser();

  useEffect(() => {
    if (!user) {
      fetchUser(); // Pobieramy dane użytkownika, jeśli nie są załadowane
    }
  }, [user, fetchUser]);

  if (loading) {
    return <div>Ładowanie danych użytkownika...</div>;
  }

  if (error) {
    return <div>Błąd: {error}</div>;
  }

  // Renderowanie odpowiedniego dashboardu w zależności od roli
  switch (userRoleName) {
    // case RoleName.MANAGER:
    //   return <ManagerDashboard />;
    case RoleName.RECEPTIONIST:
      return <ReceptionistDashboard />;
    // case RoleName.HOUSEKEEPER:
    //   return <HousekeeperDashboard />;
    // case RoleName.MAINTENANCE:
    //   return <MaintenanceDashboard />;
    default:
      return <div>Brak dostępu do dashboardu dla tej roli.</div>;
  }
};

export default RoleBasedDashboardView;
