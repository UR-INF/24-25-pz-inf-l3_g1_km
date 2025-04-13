import { useUser, RoleName } from "../contexts/user";
import ReceptionistDashboard from "./Receptionist/ReceptionistDashboard.tsx";
// import ManagerDashboard from "./ManagerDashboard.tsx";
// import HousekeeperDashboard from "./HousekeeperDashboard.tsx";
// import MaintenanceDashboard from "./MaintenanceDashboard.tsx";

const RoleBasedDashboardView = () => {
  const { loading, error, userRoleName } = useUser();

  if (loading) {
    return (
      <div className="page page-center">
        <div className="container container-slim py-4">
          <div className="text-center">
            <div className="text-secondary mb-3">Ładowanie aplikacji...</div>
            <div className="progress progress-sm">
              <div className="progress-bar progress-bar-indeterminate"></div>
            </div>
          </div>
        </div>
      </div>
    );
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
