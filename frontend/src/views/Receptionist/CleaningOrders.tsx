import { useNavigate } from "react-router";
import CleaningTable from "../../components/CleaningTable";
import CleaningCard from "../../components/CleaningCard";

const CleaningOrders = () => {
  const navigate = useNavigate();

  const handleClickNewCleaningOrder = () => {
    navigate("/RecepcionistDashboard/Orders/NewCleaningOrder");
  };

  return (
    <div className="page-wrapper">
      <div className="page-header d-print-none">
        <div className="container-xl">
          <div className="row g-2 align-items-center">
            <div className="col">
              <h1 className="page-title">Zlecenia sprzątania</h1>
            </div>

            <div className="col-auto ms-auto d-print-none">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleClickNewCleaningOrder}
              >
                <i className="ti ti-plus fs-2 me-2"></i>
                Stwórz nowe zlecenie sprzątania
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="page-body">
        <div className="container-xl">
          <div className="row row-deck row-cards">
            <CleaningCard />
            <div className="col-lg-12">
              <CleaningTable />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CleaningOrders;
