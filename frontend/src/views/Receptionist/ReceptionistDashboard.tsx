import ReservationCard from "../../components/ReservationCard";
import RoomsCard from "../../components/RoomsCard";
import RepairsCard from "../../components/RepairsCard";
import CleaningCard from "../../components/CleaningCard";
import CleaningPlot from "../../components/ReservationsPlot";
import RepairTable from "../../components/RepairTable";
import CleaningTable from "../../components/CleaningTable";
import { Link } from "react-router";

const ReceptionistDashboard = () => {
  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="container-xl">
          <div className="row g-2 align-items-center">
            <div className="col">
              <div className="page-pretitle">Przegląd obowiązków</div>
              <h1 className="page-title">Podsumowanie</h1>
            </div>

            <div className="col-auto ms-auto">
              <Link to="/RecepcionistDashboard/Reservations/NewReservation">
                <button type="button" className="btn btn-primary">
                  <i className="ti ti-plus fs-2 me-2"></i>
                  Stwórz nową rezerwację
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="page-body">
        <div className="container-xl">
          <div className="row row-deck row-cards">
            <ReservationCard />
            <RoomsCard />
            <RepairsCard />
            <CleaningCard />
            <div className="col-lg-12">
              <CleaningPlot />
            </div>
            {/* <div className="col-lg-12">
              <RepairTable />
            </div>
            <div className="col-lg-12">
              <CleaningTable />
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceptionistDashboard;
