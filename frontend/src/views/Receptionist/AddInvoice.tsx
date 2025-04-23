import AddInvoiceForm from "../../components/AddInvoiceForm";
import { useLocation } from "react-router";

const AddInvoice = () => {
  const location = useLocation();
  const reservationId = location.state?.reservationId ?? 1;
  
  return (
    <div className="page-wrapper">
      <div className="page-body">
        <div className="container-xl">
          <div className="card">
            <AddInvoiceForm reservationId={reservationId}/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddInvoice;
