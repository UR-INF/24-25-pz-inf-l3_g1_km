import HeaderNav from "../../components/HeaderNav";
import ModifyReservation from "../../components/ModifyReservation";

const ReservationsDetails = () => {

  return (
    <div>
      <HeaderNav />
      <div className="page-wrapper">
        <div className="page-body">
          <div className="container-xl">
            <div className="card">
              <ModifyReservation />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationsDetails;
