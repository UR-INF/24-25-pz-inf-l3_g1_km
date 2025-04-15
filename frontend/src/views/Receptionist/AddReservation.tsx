import AddReservationForm from "../../components/AddReservationForm";

const AddReservation = () => {
  return (
    <div className="page-wrapper">
      <div className="page-body">
        <div className="container-xl">
          <div className="card">
            <AddReservationForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddReservation;
