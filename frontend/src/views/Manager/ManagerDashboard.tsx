import ReservationCard from "../../components/ReservationCard";
import RoomsCard from "../../components/RoomsCard";
import RepairsCard from "../../components/RepairsCard";
import CleaningCard from "../../components/CleaningCard";
import { Link } from "react-router";
import RoomStatusCard from "../../components/RoomStatusCard";
import RevenueChart from "../../components/RevenueChart";
import EmployeeCountCard from "../../components/EmployeeCountCard";
import InvoiceCountCard from "../../components/InvoiceCountCard";
import ReportCountCard from "../../components/ReportCountCard";

const ManagerDashboard = () => {
  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="container-xl">
          <div className="row g-2 align-items-center">
            <div className="col">
              <div className="page-pretitle">Zarządzanie hotelem</div>
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
            <RoomStatusCard />
            <EmployeeCountCard />
            <RoomsCard />
            <RepairsCard />
            <CleaningCard />
            <ReportCountCard />
            <InvoiceCountCard />
            <div className="col-lg-12">
              <RevenueChart />
            </div>
            {/* <div className="col-lg-12">
              <ReservationsPlot />
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
