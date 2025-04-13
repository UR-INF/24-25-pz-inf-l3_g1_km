import HeaderNav from "../../components/HeaderNav";
import ModifyRepairRequest from "../../components/ModifyRepairRequest";

const RepairOrderDetails = () => {

  return (
    <div>
      <HeaderNav />
      <div className="page-wrapper">
        <div className="page-body">
          <div className="container-xl">
            <div className="card">
              <ModifyRepairRequest />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepairOrderDetails;
