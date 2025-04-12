import { useEffect } from "react";
import { useUser } from "../contexts/user";
import { useAuth } from "../contexts/auth";
import { api } from "../services/api";
import { useNavigate } from "react-router";
import HeaderNav from "../components/HeaderNav";
import ReservationCard from "../components/ReservationCard";
import RoomsCard from "../components/RoomsCard";
import RepairsCard from "../components/RepairsCard";
import CleaningCard from "../components/CleaningCard";
import CleaningPlot from "../components/CleaningPlot";
import RepairTable from "../components/RepairTable";
import CleaningTable from "../components/CleaningTable";

const RecepcionistDashboard = () => {
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
      <HeaderNav />
      <div className="container">
        <div className="row g-2 align-items-center">
          <div className="col">
            <h1 className="page-title">Podsumowanie</h1>
          </div>
          
        </div>
        <div className="row row-deck row-cards">
            <ReservationCard/>
            <RoomsCard/>
            <RepairsCard/>
            <CleaningCard/>
            <div className="col-lg-12">
              <CleaningPlot/>
            </div>
            <div className="col-lg-12">
              <RepairTable/>
            </div>
            <div className="col-lg-12">
              <CleaningTable/>
            </div>
        </div>
      </div>
    </div>


  );
};

export default RecepcionistDashboard;
