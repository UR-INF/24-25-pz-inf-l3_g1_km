import { Routes, Route, Navigate } from "react-router";
import { useAuth } from "./contexts/auth";
import LoginView from "./views/LoginView";
import SettingsView from "./views/SettingsView";
import RoleBasedDashboardView from "./views/RoleBasedDashboardView";
import NotFoundView from "./views/NotFoundView";
import DashboardLayout from "./layouts/DashboardLayout";
import Reservations from "./views/Receptionist/Reservations";
import AddReservation from "./views/Receptionist/AddReservation";
import AddInvoice from "./views/Receptionist/AddInvoice";
import RepairsOrders from "./views/Receptionist/RepairsOrders";
import AddRepair from "./views/Receptionist/AddRepair";
import CleaningOrders from "./views/Receptionist/CleaningOrders";
import AddCleaningOrder from "./views/Receptionist/AddCleaningOrder";
import ReservationsDetails from "./views/Receptionist/ReservationDetails";
import CleaningOrderDetails from "./views/Receptionist/CleaningOrderDetails";
import RepairOrderDetails from "./views/Receptionist/RepairOrderDetails";
import InvoiceDetails from "./views/Receptionist/InvoiceDetails";
import { ThemeProvider } from "./contexts/theme";
//import HousekeeperCleaningTasks from "./views/Housekeeper/HousekeeperCleaningTasks";

// prettier-ignore
const protectedRoutes = [
  { path: "/", element: <RoleBasedDashboardView /> },

  // Trasy związane z rezerwacjami i fakturami
  { path: "/RecepcionistDashboard/Reservations", element: <Reservations /> },
  { path: "/RecepcionistDashboard/Reservations/NewReservation", element: <AddReservation /> },
  { path: "/RecepcionistDashboard/Reservations/NewInvoice", element: <AddInvoice /> },
  { path: "/RecepcionistDashboard/Reservations/InvoiceDetails", element: <InvoiceDetails /> },
  { path: "/RecepcionistDashboard/Reservations/ReservationDetails", element: <ReservationsDetails /> },

  // Trasy związane ze zgłoszeniami
  { path: "/RecepcionistDashboard/Orders/Repairs", element: <RepairsOrders /> },
  { path: "/RecepcionistDashboard/Orders/NewRepair", element: <AddRepair /> },
  { path: "/RecepcionistDashboard/Orders/Cleaning", element: <CleaningOrders /> },
  { path: "/RecepcionistDashboard/Orders/NewCleaningOrder", element: <AddCleaningOrder /> },
  { path: "/RecepcionistDashboard/Orders/CleaningOrderDetails", element: <CleaningOrderDetails /> },
  { path: "/RecepcionistDashboard/Orders/CleaningOrderDetails/:id", element: <CleaningOrderDetails /> },
  { path: "/RecepcionistDashboard/Orders/RepairsOrderDetails", element: <RepairOrderDetails /> },
  { path: "/RecepcionistDashboard/Orders/RepairsOrderDetails/:id", element: <RepairOrderDetails /> },

  // Trasy dla pokojówek
  { path: "/HousekeeperDashboard/Orders/NewCleaningOrder", element: <AddCleaningOrder /> },

  // Trasy dla konserwatorów
  { path: "/MaintenanceDashboard/Orders/NewRepair", element: <AddRepair /> },

  { path: "/Settings", element: <SettingsView /> },
];

const App = () => {
  const { state } = useAuth();

  return (
    <ThemeProvider>
      <Routes>
        <Route element={<DashboardLayout />}>
          {protectedRoutes.map(({ path, element }) => (
            <Route key={path} path={path} element={state.loggedIn ? element : <LoginView />} />
          ))}
        </Route>

        {/* Trasa logowania: jeśli użytkownik jest już zalogowany, zostanie przekierowany na stronę główną */}
        <Route
          path="/login"
          element={state.loggedIn ? <Navigate to="/" replace /> : <LoginView />}
        />

        {/* Trasa dla strony 404 (Not Found) */}
        <Route path="*" element={<NotFoundView />} />
      </Routes>
    </ThemeProvider>
  );
};

export default App;
