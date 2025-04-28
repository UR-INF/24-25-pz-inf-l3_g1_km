import { Link } from "react-router";
import RoomsTable from "../../components/RoomsTable";

const RoomsView = () => {
  return (
    <div className="page-wrapper">
      <div className="page-header d-print-none">
        <div className="container-xl">
          <div className="row g-2 align-items-center">
            <div className="col">
              <div className="page-pretitle">Pokoje</div>
              <h1 className="page-title">Podsumowanie</h1>
            </div>

            <div className="col-auto ms-auto d-print-none">
              <Link type="button" className="btn btn-primary" to="/ManagerDashboard/Rooms/NewRoom">
                <i className="ti ti-plus fs-2 me-2"></i>
                Stwórz nowy pokój
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="page-body">
        <div className="container-xl">
          <div className="row row-deck row-cards">
            <div className="col-lg-12">
              <RoomsTable />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomsView;
