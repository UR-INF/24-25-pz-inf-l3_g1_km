import AddCleaningRequestForm from "../../components/AddCleaningRequestForm";

const AddCleaningOrder = () => {
  return (
    <div className="page-wrapper">
      <div className="page-body">
        <div className="container-xl">
          <div className="card">
            <AddCleaningRequestForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCleaningOrder;
