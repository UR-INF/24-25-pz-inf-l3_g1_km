import { useEffect, useState } from "react";
import { Link } from "react-router";
import { api } from "../services/api";

const InvoiceCountCard = () => {
  const [invoiceCount, setInvoiceCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await api.get("/invoices");
        setInvoiceCount(response.data.length);
      } catch (error) {
        console.error("Błąd podczas pobierania faktur:", error);
        setInvoiceCount(0);
      }
    };

    fetchInvoices();
  }, []);

  return (
    <div className="col-sm-6 col-lg-3">
      <div className="card card-sm">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-auto">
              <span className="avatar bg-blue-lt text-blue">
                <i className="ti ti-receipt fs-1" />
              </span>
            </div>
            <div className="col">
              <div className="font-weight-medium">
                {invoiceCount !== null ? `${invoiceCount} faktur` : "..."}
              </div>
            </div>
            <div className="col-auto">
              <Link to="/ManagerDashboard/Invoices" className="btn btn-sm btn-blue">
                Zobacz
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceCountCard;
