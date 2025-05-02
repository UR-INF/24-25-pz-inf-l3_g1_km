import { useState, useEffect } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router";
import { useNotification } from "../contexts/notification";

const ModifyInvoice = ({ invoiceId, reservationId }) => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [invoiceData, setInvoiceData] = useState({
    issueDate: "",
    companyNip: "",
    companyName: "",
    companyAddress: "",
  });

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await api.get(`/invoices/${invoiceId}`);
        if (response.status === 200) {
          setInvoiceData(response.data);
        } else {
          console.error("Nie udało się pobrać faktury");
        }
      } catch (error) {
        console.error("Błąd podczas pobierania faktury", error);
      }
    };

    fetchInvoice();
  }, [invoiceId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInvoiceData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    console.log(invoiceData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.put(
        `/invoices/${invoiceId}?reservationId=${reservationId}`,
        invoiceData,
      );
      if (response.status === 200) {
        showNotification("success", "Faktura została zaktualizowana.");
        navigate("/RecepcionistDashboard/Reservations");
      } else {
        console.error("Nie udało się zaktualizować faktury");
      }
    } catch (error) {
      console.error("Błąd podczas aktualizacji faktury", error);
      showNotification("error", "Wystąpił błąd podczas aktualizacji faktury.");
    }
  };

  return (
    <div className="card-body">
      <h2 className="mb-4">Edytuj fakturę</h2>

      <form onSubmit={handleSubmit}>
        <h3 className="card-title">Szczegóły faktury</h3>

        <div className="mb-3">
          <label htmlFor="issueDate" className="form-label">
            Data wystawienia
          </label>
          <input
            type="date"
            id="issueDate"
            name="issueDate"
            value={invoiceData.issueDate}
            onChange={handleInputChange}
            className="form-control"
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="companyNip" className="form-label">
            NIP firmy
          </label>
          <input
            type="text"
            id="companyNip"
            name="companyNip"
            value={invoiceData.companyNip}
            onChange={handleInputChange}
            className="form-control"
          />
        </div>

        <div className="mb-3">
          <label htmlFor="companyName" className="form-label">
            Nazwa firmy
          </label>
          <input
            type="text"
            id="companyName"
            name="companyName"
            value={invoiceData.companyName}
            onChange={handleInputChange}
            className="form-control"
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="companyAddress" className="form-label">
            Adres firmy
          </label>
          <textarea
            id="companyAddress"
            name="companyAddress"
            value={invoiceData.companyAddress}
            onChange={handleInputChange}
            className="form-control"
            required
          />
        </div>

        <div className="d-flex justify-content-between">
          <button type="submit" className="btn btn-primary">
            Zaktualizuj fakturę
          </button>
        </div>
      </form>
    </div>
  );
};

export default ModifyInvoice;
