import HeaderNav from "../../components/HeaderNav";
import ModifyCleaningOrder from "../../components/ModifyCleaningOrder";

const CleaningOrderDetails = () => {
  return (
    <div>
      <HeaderNav />
      <div className="page-wrapper">
        <div className="page-body">
          <div className="container-xl">
            <div className="card">
              <ModifyCleaningOrder />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CleaningOrderDetails;
