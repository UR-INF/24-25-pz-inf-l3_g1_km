import { useState } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router";
import { useNotification } from "../contexts/notification";

const AddInvoiceForm = ({ reservationId }) => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [invoiceData, setInvoiceData] = useState({
    issueDate: new Date().toISOString().slice(0, 10),
    companyNip: "",
    companyName: "",
    companyStreet: "",
    companyBuildingNo: "",
    companyPostalCode: "",
    companyCity: "",
    companyCountry: "",
  });
  const [nipError, setNipError] = useState("");

  const validateNip = (nip) => {
    const cleanNip = nip.replace(/[^0-9]/g, "");
    if (cleanNip.length !== 10) {
      return "NIP musi składać się z 10 cyfr";
    }
    const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanNip.charAt(i)) * weights[i];
    }
    const checkDigit = sum % 11;
    if (checkDigit === 10 || checkDigit !== parseInt(cleanNip.charAt(9))) {
      return "Nieprawidłowy NIP";
    }
    return "";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInvoiceData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    if (name === "companyNip" && value.trim() !== "") {
      setNipError(validateNip(value));
    } else if (name === "companyNip" && value.trim() === "") {
      setNipError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (invoiceData.companyNip.trim() !== "") {
      const error = validateNip(invoiceData.companyNip);
      if (error) {
        setNipError(error);
        showNotification("error", error);
        return;
      }
    }
    try {
      const params = new URLSearchParams({
        nip: invoiceData.companyNip,
        companyName: invoiceData.companyName,
        companyStreet: invoiceData.companyStreet,
        companyBuildingNo: invoiceData.companyBuildingNo,
        companyPostalCode: invoiceData.companyPostalCode,
        companyCity: invoiceData.companyCity,
        companyCountry: invoiceData.companyCountry,
      }).toString();

      await api.post(`/invoices/reservation/${reservationId}?${params}`);
      navigate(-1);
      showNotification("success", "Faktura została dodana.");
    } catch (error) {
      console.error("Błąd podczas dodawania faktury:", error);
      showNotification("error", "Wystąpił błąd podczas dodawania faktury.");
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
            disabled // Data wystawienia generowana automatycznie na backendzie
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
            className={`form-control ${nipError ? "is-invalid" : ""}`}
            autoComplete="off"
          />
          {nipError && <div className="invalid-feedback">{nipError}</div>}
          <small className="form-text text-muted">
            Możesz wprowadzić NIP z myślnikami lub bez.
          </small>
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
          <label htmlFor="companyStreet" className="form-label">
            Ulica
          </label>
          <input
            type="text"
            id="companyStreet"
            name="companyStreet"
            value={invoiceData.companyStreet}
            onChange={handleInputChange}
            className="form-control"
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="companyBuildingNo" className="form-label">
            Nr budynku / mieszkania
          </label>
          <input
            type="text"
            id="companyBuildingNo"
            name="companyBuildingNo"
            value={invoiceData.companyBuildingNo}
            onChange={handleInputChange}
            className="form-control"
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="companyPostalCode" className="form-label">
            Kod pocztowy
          </label>
          <input
            type="text"
            id="companyPostalCode"
            name="companyPostalCode"
            value={invoiceData.companyPostalCode}
            onChange={handleInputChange}
            className="form-control"
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="companyCity" className="form-label">
            Miasto
          </label>
          <input
            type="text"
            id="companyCity"
            name="companyCity"
            value={invoiceData.companyCity}
            onChange={handleInputChange}
            className="form-control"
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="companyCountry" className="form-label">
            Kraj
          </label>
          <input
            type="text"
            id="companyCountry"
            name="companyCountry"
            value={invoiceData.companyCountry}
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
