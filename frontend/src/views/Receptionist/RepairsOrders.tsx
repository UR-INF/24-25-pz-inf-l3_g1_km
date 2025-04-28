import { useNavigate } from "react-router";
import RepairsCard from "../../components/RepairsCard";
import RepairTable from "../../components/RepairTable";

const RepairsOrders = () => {
  const navigate = useNavigate();

  const handleClickNewRepairOrder = () => {
    navigate("/RecepcionistDashboard/Orders/NewRepair");
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="container-xl">
          <div className="row g-2 align-items-center">
            <div className="col">
              <div className="page-pretitle">Zgłoszenia napraw</div>
              <h1 className="page-title">Podsumowanie</h1>
            </div>

            <div className="col-auto ms-auto">
              <button type="button" className="btn btn-primary" onClick={handleClickNewRepairOrder}>
                <i className="ti ti-plus fs-2 me-2"></i>
                Stwórz nowe zgłoszenie naprawy
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="page-body">
        <div className="container-xl">
          <div className="row row-deck row-cards">
            <div className="col-lg-12">
              <RepairTable />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepairsOrders;
