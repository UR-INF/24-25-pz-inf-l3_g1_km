import DashboardAlert from "../components/DashboardAlert.tsx";
import { useUser, RoleName } from "../contexts/user";
import ReceptionistDashboard from "./Receptionist/ReceptionistDashboard.tsx";
import ManagerDashboard from "./Manager/ManagerDashboard.tsx";
import HousekeeperDashboard from "./Housekeeper/HousekeeperDashboard.tsx";
import MaintenanceDashboard from "./Maintenance/MaintenanceDashboard.tsx";

const RoleBasedDashboardView = () => {
  const { error, userRoleName } = useUser();

  // if (loading) {
  //   return (
  //     <div className="page page-center">
  //       <div className="container container-slim py-4">
  //         <div className="text-center">
  //           <div className="text-secondary mb-3">Ładowanie aplikacji...</div>
  //           <div className="progress progress-sm">
  //             <div className="progress-bar progress-bar-indeterminate"></div>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  if (error) {
    return <DashboardAlert heading="Błąd aplikacji" description={error} />;
  }

  // Renderowanie odpowiedniego dashboardu w zależności od roli
  switch (userRoleName) {
    case RoleName.MANAGER:
      return <ManagerDashboard />;
    case RoleName.RECEPTIONIST:
      return <ReceptionistDashboard />;
    case RoleName.HOUSEKEEPER:
      return <HousekeeperDashboard />;
    case RoleName.MAINTENANCE:
      return <MaintenanceDashboard />;
    default:
      return (
        <DashboardAlert
          heading="Brak dostępu"
          description="Twoja rola nie została jeszcze zaimplementowana lub nie istnieje w systemie."
        />
      );
  }
};

export default RoleBasedDashboardView;
