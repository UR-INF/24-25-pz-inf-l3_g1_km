import { Routes, Route, Navigate } from "react-router";
import { useAuth } from "./contexts/auth";
import LoginView from "./views/LoginView";
import SettingsView from "./views/SettingsView";
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

        {/* Trasy związane z rezerwacjami */}
        <Route
          path="/RecepcionistDashboard/Reservations"
          element={state.loggedIn ? <Reservations /> : <LoginView />}
        />

        <Route
          path="/RecepcionistDashboard/Reservations/NewReservation"
          element={state.loggedIn ? <AddReservation /> : <LoginView />}
        />

        <Route
          path="/RecepcionistDashboard/Reservations/ReservationDetails"
          element={state.loggedIn ? <ReservationsDetails /> : <LoginView />}
        />

        <Route
          path="/RecepcionistDashboard/Orders/Repairs"
          element={state.loggedIn ? <RepairsOrders /> : <LoginView />}
        />

        {/* Trasy związane ze zgłoszeniami */}
        <Route
          path="/RecepcionistDashboard/Orders/NewRepair"
          element={state.loggedIn ? <AddRepair /> : <LoginView />}
        />

        <Route
          path="/RecepcionistDashboard/Orders/Cleaning"
          element={state.loggedIn ? <CleaningOrders /> : <LoginView />}
        />

        <Route
          path="/RecepcionistDashboard/Orders/NewCleaningOrder"
          element={state.loggedIn ? <AddCleaningOrder /> : <LoginView />}
        />

        <Route
          path="/RecepcionistDashboard/Orders/CleaningOrderDetails"
          element={state.loggedIn ? <CleaningOrderDetails /> : <LoginView />}
        />

        <Route
          path="/RecepcionistDashboard/Orders/CleaningOrderDetails/:id"
          element={state.loggedIn ? <CleaningOrderDetails /> : <LoginView />}
        />

        <Route
          path="/RecepcionistDashboard/Orders/RepairsOrderDetails"
          element={state.loggedIn ? <RepairOrderDetails /> : <LoginView />}
        />

        <Route
          path="/RecepcionistDashboard/RepairOrders/RepairsOrderDetails/:id"
          element={state.loggedIn ? <RepairOrderDetails /> : <LoginView />}
        />

        <Route
          path="/Settings"
          element={state.loggedIn ? <SettingsView /> : <LoginView />}
        />
      </Route>

      {/* Trasa logowania: jeśli użytkownik jest już zalogowany, zostanie przekierowany na stronę główną */}
      <Route path="/login" element={state.loggedIn ? <Navigate to="/" replace /> : <LoginView />} />

      {/* Trasa dla strony 404 (Not Found) */}
      <Route path="*" element={<NotFoundView />} />
    </Routes>
  );
};

export default App;
