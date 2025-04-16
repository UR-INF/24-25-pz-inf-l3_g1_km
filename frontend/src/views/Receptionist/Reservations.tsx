import ReservationCard from "../../components/ReservationCard";
import RoomsCard from "../../components/RoomsCard";
import ReservationsTable from "../../components/ReservationsTable";
import RoomsTable from "../../components/RoomsTable";
import { useNavigate } from "react-router";

const Reservations = () => {
  const navigate = useNavigate();

  const handleClickNewReservation = () => {
    navigate("/RecepcionistDashboard/Reservations/NewReservation");
  };

  return (
    <div className="page-wrapper">
      <div className="page-header d-print-none">
        <div className="container-xl">
          <div className="row g-2 align-items-center">
            <div className="col">
              <div className="page-pretitle">Rezerwacje</div>
              <h1 className="page-title">Podsumowanie</h1>
            </div>

            <div className="col-auto ms-auto d-print-none">
              <button type="button" onClick={handleClickNewReservation} className="btn btn-primary">
                <i className="ti ti-plus fs-2 me-2"></i>
                Stwórz nową rezerwację
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="page-body">
        <div className="container-xl">
          <div className="row row-deck row-cards">
            <ReservationCard />
            <RoomsCard />
            <div className="col-lg-12">
              <ReservationsTable />
            </div>
            <div className="col-lg-12">
              <RoomsTable />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reservations;
