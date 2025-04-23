import { useState } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router";

const AddInvoiceForm = ({ reservationId }) => {
  const navigate = useNavigate();

  const [invoiceData, setInvoiceData] = useState({
    issueDate: "",
    pdfFile: "",
    nip: "",
    companyName: "",
    companyAddress: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInvoiceData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const params = new URLSearchParams(invoiceData).toString();

      const response = await api.post(`/invoices/reservation/${reservationId}?${params}`);
      navigate("/RecepcionistDashboard/Reservations");
    } catch (error) {
      console.error("Błąd podczas dodawania faktury:", error);
    }
  };

  return (
    <div className="card-body">
      <h2 className="mb-4">Dodaj nową fakturę</h2>

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
          <label htmlFor="pdfFile" className="form-label">
            Plik PDF
          </label>
          <input
            type="text"
            id="pdfFile"
            name="pdfFile"
            value={invoiceData.pdfFile}
            onChange={handleInputChange}
            className="form-control"
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
            value={invoiceData.nip}
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
            Dodaj fakturę
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddInvoiceForm;
