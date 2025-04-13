
import HeaderNav from "../../components/HeaderNav";
import AddCleaningRequestForm from "../../components/AddCleaningRequestForm";

const AddCleaningOrder = () => {

  return (
    <div>
      <HeaderNav />
      <div className="page-wrapper">
        <div className="page-body">
          <div className="container-xl">
            <div className="card">
              <AddCleaningRequestForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCleaningOrder;
