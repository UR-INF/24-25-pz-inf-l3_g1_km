import HeaderNav from "../../components/HeaderNav";
import AddRepairRequestForm from "../../components/AddRepairRequestForm";

const AddRepair = () => {
  return (
    <div>
      <HeaderNav />
      <div className="page-wrapper">
        <div className="page-body">
          <div className="container-xl">
            <div className="card">
              <AddRepairRequestForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddRepair;
