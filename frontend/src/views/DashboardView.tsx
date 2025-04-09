import { useEffect } from "react";
import { useUser } from "../contexts/user";
import { useAuth } from "../contexts/auth";
import { api } from "../services/api";
import { useNavigate } from "react-router";

const DashboardView = () => {
  const navigate = useNavigate();
  const { user, loading, error, fetchUser } = useUser();
  const { logout } = useAuth();

  // Funkcja do obsługi wylogowania
  const logoutUser = async () => {
    try {
      const response = await api.post("/auth/logout");

      console.log("Odpowiedź z backendu:", response);

      if (response.data === "Wylogowano pomyślnie!") {
        console.log("Wylogowano pomyślnie!");

        logout(); // Wywołujemy logout z kontekstu autoryzacji

        navigate("/login");
      } else {
        console.log("Błąd wylogowywania! Spróbuj ponownie.");
      }
    } catch (error) {
      console.error("Wystąpił błąd wylogowywania:", error);
    }
  };

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

  return (
    <div>
      <h1>
        Witaj, {user?.firstName} {user?.lastName}
      </h1>
      <p>Email: {user?.email}</p>
      <p>Telefon: {user?.phoneNumber}</p>
      <p>Rola: {user?.role.name}</p>

      <button className="btn btn-danger" onClick={logoutUser}>
        Wyloguj się
      </button>
    </div>
  );
};

export default DashboardView;
