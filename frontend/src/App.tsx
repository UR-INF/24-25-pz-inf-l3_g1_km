import { Routes, Route, Navigate } from "react-router";
import { useAuth } from "./contexts/auth";
import LoginView from "./views/LoginView";
import RoleBasedDashboardView from "./views/RoleBasedDashboardView";
import NotFoundView from "./views/NotFoundView";
import DashboardLayout from "./layouts/DashboardLayout";
import Reservations from "./views/Receptionist/Reservations";
import AddReservation from "./views/Receptionist/AddReservation";
import RepairsOrders from "./views/Receptionist/RepairsOrders";
import AddRepair from "./views/Receptionist/AddRepair";
import CleaningOrders from "./views/Receptionist/CleaningOrders";
import AddCleaningOrder from "./views/Receptionist/AddCleaningOrder";
import ReservationsDetails from "./views/Receptionist/ReservationDetails";
import CleaningOrderDetails from "./views/Receptionist/CleaningOrderDetails";
import RepairOrderDetails from "./views/Receptionist/RepairOrderDetails";

// Typ dla propsów, w tym przypadku dla children
interface ProtectedRouteProps {
  children?: React.ReactNode; // Określamy typ dla children
}

// Komponent, który sprawdza, czy użytkownik jest zalogowany
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { state } = useAuth();
  return state.loggedIn ? <>{children}</> : <Navigate to="/login" replace />;
};

const App = () => {
  const { state } = useAuth();

  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        {/* Trasa główna, widok dashboardu, dostępny tylko dla zalogowanych */}
        <Route
          path="/"
          element={state.loggedIn ? <RoleBasedDashboardView /> : <Navigate to="/login" replace />}
        />

        {/* Zabezpieczona grupa tras, które są dostępne tylko dla zalogowanych użytkowników */}
        <Route element={<ProtectedRoute />}>
          {/* Trasy związane z rezerwacjami */}
          <Route path="/RecepcionistDashboard/Reservations" element={<Reservations />} />
          <Route
            path="/RecepcionistDashboard/Reservations/NewReservation"
            element={<AddReservation />}
          />
          <Route
            path="/RecepcionistDashboard/Reservations/ReservationDetails"
            element={<ReservationsDetails />}
          />

          {/* Trasy związane ze zgłoszeniami */}
          <Route path="/RecepcionistDashboard/Orders/Repairs" element={<RepairsOrders />} />
          <Route path="/RecepcionistDashboard/Orders/NewRepair" element={<AddRepair />} />
          <Route path="/RecepcionistDashboard/Orders/Cleaning" element={<CleaningOrders />} />
          <Route
            path="/RecepcionistDashboard/Orders/NewCleaningOrder"
            element={<AddCleaningOrder />}
          />
          <Route
            path="/RecepcionistDashboard/Orders/CleaningOrderDetails"
            element={<CleaningOrderDetails />}
          />
          <Route
            path="/RecepcionistDashboard/Orders/RepairsOrderDetails"
            element={<RepairOrderDetails />}
          />
        </Route>
      </Route>

      {/* Trasa logowania: jeśli użytkownik jest już zalogowany, zostanie przekierowany na stronę główną */}
      <Route path="/login" element={state.loggedIn ? <Navigate to="/" replace /> : <LoginView />} />

      {/* Trasa dla strony 404 (Not Found) */}
      <Route path="*" element={<NotFoundView />} />
    </Routes>
  );
};

export default App;
