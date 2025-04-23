import ModifyInvoice from "../../components/ModifyInvoice";
import { useLocation } from "react-router";

const InvoiceDetails = () => {
  const location = useLocation();
  const invoiceId = location.state?.invoice ?? 1;



  return (
    <div className="page-wrapper">
      <div className="page-body">
        <div className="container-xl">
          <div className="card">
            <ModifyInvoice invoiceId={invoiceId} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetails;
