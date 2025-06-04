import { useState, useEffect } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router";
import { useNotification } from "../contexts/notification";
import { fetchCompanyByNip } from "../utils/fetchCompanyByNip";
import { validateNip } from "../utils/validateNip";

const ModifyInvoice = ({ invoiceId, reservationId }) => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [invoiceData, setInvoiceData] = useState({
    issueDate: "",
    companyNip: "",
    companyName: "",
    companyStreet: "",
    companyBuildingNo: "",
    companyPostalCode: "",
    companyCity: "",
    companyCountry: "",
  });
  const [isLoadingCompany, setIsLoadingCompany] = useState(false);
  const [nipError, setNipError] = useState("");

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await api.get(`/invoices/${invoiceId}`);
        if (response.status === 200) {
          setInvoiceData({
            issueDate: response.data.issueDate || "",
            companyNip: response.data.companyNip || "",
            companyName: response.data.companyName || "",
            companyStreet: response.data.companyStreet || "",
            companyBuildingNo: response.data.companyBuildingNo || "",
            companyPostalCode: response.data.companyPostalCode || "",
            companyCity: response.data.companyCity || "",
            companyCountry: response.data.companyCountry || "",
          });
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
      const response = await api.put(
        `/invoices/${invoiceId}?reservationId=${reservationId}`,
        invoiceData,
      );
      if (response.status === 200) {
        showNotification("success", "Faktura została zaktualizowana.");
        navigate(-1);
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
          <div className="input-group">
            <input
              type="text"
              id="companyNip"
              name="companyNip"
              value={invoiceData.companyNip}
              onChange={(e) => {
                handleInputChange(e);
                setNipError("");
              }}
              className={`form-control ${nipError ? "is-invalid" : ""}`}
              autoComplete="off"
            />
            <button
              type="button"
              className="btn btn-outline-secondary"
              disabled={!!validateNip(invoiceData.companyNip) || isLoadingCompany}
              onClick={async () => {
                if (!!validateNip(invoiceData.companyNip)) {
                  setNipError("Nieprawidłowy numer NIP");
                  return;
                }

                setIsLoadingCompany(true);
                try {
                  const companyData = await fetchCompanyByNip(invoiceData.companyNip);
                  setInvoiceData((prev) => ({
                    ...prev,
                    ...companyData,
                  }));
                  showNotification("success", "Dane firmy zostały pobrane.");
                } catch {
                  showNotification("error", "Nie udało się pobrać danych firmy.");
                } finally {
                  setIsLoadingCompany(false);
                }
              }}
            >
              {isLoadingCompany ? (
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                ></span>
              ) : (
                "Pobierz dane z rejestru podatników"
              )}
            </button>
          </div>
          {nipError && <div className="invalid-feedback d-block">{nipError}</div>}
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
            Zaktualizuj fakturę
          </button>
        </div>
      </form>
    </div>
  );
};

export default ModifyInvoice;
