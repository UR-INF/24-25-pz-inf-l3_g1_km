import { Routes, Route, Navigate } from "react-router";
import { useAuth } from "./contexts/auth";
import LoginView from "./views/LoginView";
import RoleBasedDashboardView from "./views/RoleBasedDashboardView";
import NotFoundView from "./views/NotFoundView";
import MainLayout from "./layouts/MainLayout";
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
    <MainLayout>
      <Routes>
        <Route
          path="/"
          element={state.loggedIn ? <RoleBasedDashboardView /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/login"
          element={state.loggedIn ? <Navigate to="/" replace /> : <LoginView />}
        />

        <Route
          path="/RecepcionistDashboard/Reservations"
          element={state.loggedIn ? <Reservations /> : <LoginView />}
        />
        <Route
          path="/RecepcionistDashboard/Reservations/NewReservation"
          element={state.loggedIn ? <AddReservation /> : <LoginView />}
        />

        <Route
          path="/RecepcionistDashboard/RepairsOrders"
          element={state.loggedIn ? <RepairsOrders /> : <LoginView />}
        />

        <Route
          path="/RecepcionistDashboard/RepairsOrders/NewRepair"
          element={state.loggedIn ? <AddRepair /> : <LoginView />}
        />

        <Route
          path="/RecepcionistDashboard/CleaningOrders"
          element={state.loggedIn ? <CleaningOrders /> : <LoginView />}
        />

        <Route
          path="/RecepcionistDashboard/CleaningOrders/NewCleaningOrder"
          element={state.loggedIn ? <AddCleaningOrder /> : <LoginView />}
        />

        <Route
          path="/RecepcionistDashboard/Reservations/ReservationDetails"
          element={state.loggedIn ? <ReservationsDetails /> : <LoginView />}
        />

        <Route
          path="/RecepcionistDashboard/CleaningOrders/CleaningOrderDetails"
          element={state.loggedIn ? <CleaningOrderDetails /> : <LoginView />}
        />

        <Route
          path="/RecepcionistDashboard/RepairOrders/RepairsOrderDetails"
          element={state.loggedIn ? <RepairOrderDetails /> : <LoginView />}
        />

        <Route path="*" element={<NotFoundView />} />
      </Routes>
    </MainLayout>
  );
};

export default App;
