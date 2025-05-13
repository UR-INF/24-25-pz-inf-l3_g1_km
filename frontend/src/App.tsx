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
import RoomsView from "./views/Manager/RoomsView";
import EmployeesView from "./views/Manager/EmployeesView";
import { useUser } from "./contexts/user";
import CreateNewEmployeeView from "./views/Manager/CreateNewEmployeeView";
import ModifyEmployeeView from "./views/Manager/ModifyEmployeeView";
import AddRooms from "./views/Manager/AddRooms";
import ModifyRooms from "./views/Manager/ModifyRooms";
import ReportsView from "./views/Manager/ReportsView";
import ReportPage from "./components/ReportPdfViewer";
import NewReport from "./views/Manager/NewReport";
import InvoicesView from "./views/Manager/InvoicesView";

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

  // Trasy dla menedżera
  { path: "/ManagerDashboard/Rooms", element: <RoomsView /> },
  { path: "/ManagerDashboard/Rooms/NewRoom", element: <AddRooms /> },
  { path: "/ManagerDashboard/Rooms/RoomDetails/:id", element: <ModifyRooms /> },
  { path: "/ManagerDashboard/Employees", element: <EmployeesView /> },
  { path: "/ManagerDashboard/Employees/Create", element: <CreateNewEmployeeView /> },
  { path: "/ManagerDashboard/Employees/Modify/:id", element: <ModifyEmployeeView /> },
  
  // { path: "/ManagerDashboard/Reports", element: <EmployeesView /> },

  { path: "/ManagerDashboard/Reports", element: <ReportsView /> },
  { path: "/ManagerDashboard/ShowReport/:id", element: <ReportPage />},
  { path: "/ManagerDashboard/CreateReport", element: <NewReport />},
  { path: "/ManagerDashboard/Invoices", element: <InvoicesView />},

  { path: "/Settings", element: <SettingsView /> },
];

const App = () => {
  const { state } = useAuth();
  const { loading } = useUser();

  if (state.loading || loading) {
    return (
      <div className="page page-center d-flex align-items-center justify-content-center vh-100">
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

  return (
    <Routes>
      {/* Trasy chronione */}
      <Route element={state.loggedIn ? <DashboardLayout /> : <Navigate to="/login" replace />}>
        {protectedRoutes.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}
      </Route>
      {/* Trasa logowania */}
      <Route path="/login" element={<LoginView />} />

      {/* Trasa dla strony 404 */}
      <Route path="*" element={<NotFoundView />} />
    </Routes>
  );
};

export default App;
