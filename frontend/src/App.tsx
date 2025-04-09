import { Routes, Route, Navigate } from "react-router";
import { useAuth } from "./contexts/auth";
import LoginView from "./views/LoginView";
import DashboardView from "./views/DashboardView";
import NotFoundView from "./views/NotFoundView";
import MainLayout from "./layouts/MainLayout";

const App = () => {
	const { state } = useAuth();

	return (
		<MainLayout>
			<Routes>
				<Route path="/" element={state.loggedIn ? <DashboardView /> : <Navigate to="/login" replace />} />
				<Route path="/login" element={state.loggedIn ? <Navigate to="/" replace /> : <LoginView />} />
				
				<Route path="*" element={<NotFoundView />} />
			</Routes>
		</MainLayout>
	);
};

export default App;
