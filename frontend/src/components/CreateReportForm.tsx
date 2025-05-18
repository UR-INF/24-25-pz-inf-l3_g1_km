import React, { useState } from "react";
import { Modal } from "react-bootstrap"; // Importujemy Modal z react-bootstrap
import { api } from "../services/api";
import { useNotification } from "../contexts/notification";
import { useNavigate } from "react-router";

const CreateReportForm = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  
  // Stany dla modalu
  const [showModal, setShowModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const [formData, setFormData] = useState({
    reportType: "STAFF_REPORT", // domyślny typ raportu
    startDate: thirtyDaysAgo.toISOString().split("T")[0],
    endDate: today.toISOString().split("T")[0],
    period: "month", // dla raportów finansowych (week, month, quarter)
  });

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Funkcja zamykająca modal i zwalniająca zasoby
  const handleClose = () => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }
    setShowModal(false);
    setPdfUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let endpoint = "";
      let params = new URLSearchParams();

      // Dodaj parametry dat
      params.append("startDate", formData.startDate);
      params.append("endDate", formData.endDate);

      switch (formData.reportType) {
        case "STAFF_REPORT":
          endpoint = "/reports/pdf/staff";
          break;
        case "ROOMS_REPORT":
          endpoint = "/reports/pdf/rooms";
          break;
        case "FINANCIAL_REPORT":
          endpoint = "/reports/pdf/financial";
          params.append("period", formData.period);
          break;
        case "COMPLETE_REPORT":
          endpoint = "/reports/pdf/complete";
          params.append("period", formData.period);
          break;
        default:
          throw new Error("Nieznany typ raportu");
      }

      const response = await api.get(
        `${endpoint}?${params.toString()}`,
        {},
        {
          responseType: "blob",
        },
      );

      if (!response.data || response.data.size === 0) {
        throw new Error("Otrzymano pustą odpowiedź z serwera");
      }

      const blob = new Blob([response.data], { type: "application/pdf" });
      
      // Sprawdzenie typu pliku
      if (blob.type !== "application/pdf") {
        throw new Error("Serwer zwrócił nieprawidłowy format pliku");
      }

      const url = URL.createObjectURL(blob);
      
      // Ustawiamy URL i otwieramy modal
      setPdfUrl(url);
      setShowModal(true);

      showNotification("success", "Raport został wygenerowany pomyślnie!");
      
    } catch (error: any) {
      console.error("Błąd podczas generowania raportu:", error);
      showNotification(
        "error",
        `Wystąpił błąd podczas generowania raportu: ${error.message || "nieznany błąd"}`,
      );
    } finally {
      setLoading(false);
    }
  };

  // Funkcja pobierania raportu
  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = `raport-${formData.reportType.toLowerCase()}-${formData.startDate}-${formData.endDate}.pdf`;
      link.click();
    }
  };

  return (
    <>
      <div className="card">
        <div className="card-body">
          <h2 className="mb-4">Generowanie nowego raportu</h2>

          <form onSubmit={handleSubmit}>
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <div className="form-label">Typ raportu</div>
                <select
                  className="form-select"
                  name="reportType"
                  value={formData.reportType}
                  onChange={handleChange}
                  required
                >
                  <option value="STAFF_REPORT">Raport personelu</option>
                  <option value="ROOMS_REPORT">Raport pokoi</option>
                  <option value="FINANCIAL_REPORT">Raport finansowy</option>
                  <option value="COMPLETE_REPORT">Raport kompletny</option>
                </select>
                <div className="form-text text-muted">
                  Wybierz typ raportu, który chcesz wygenerować.
                </div>
              </div>

              {(formData.reportType === "FINANCIAL_REPORT" ||
                formData.reportType === "COMPLETE_REPORT") && (
                <div className="col-md-6">
                  <div className="form-label">Okres analizy finansowej</div>
                  <select
                    className="form-select"
                    name="period"
                    value={formData.period}
                    onChange={handleChange}
                  >
                    <option value="week">Tygodniowy</option>
                    <option value="month">Miesięczny</option>
                    <option value="quarter">Kwartalny</option>
                  </select>
                  <div className="form-text text-muted">
                    Określa sposób grupowania danych finansowych.
                  </div>
                </div>
              )}
            </div>

            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <div className="form-label">Data początkowa</div>
                <input
                  type="date"
                  className="form-control"
                  name="startDate"
                  value={formData.startDate}
                  max={formData.endDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <div className="form-label">Data końcowa</div>
                <input
                  type="date"
                  className="form-control"
                  name="endDate"
                  min={formData.startDate}
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="row mt-4">
              <div className="col-md-12 d-flex justify-content-end">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Generowanie raportu...
                    </>
                  ) : (
                    "Generuj raport"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Modal do wyświetlania PDF */}
      <Modal
        show={showModal}
        onHide={handleClose}
        size="xl"
        dialogClassName="modal-dialog-scrollable"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Podgląd raportu
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ height: "80vh" }}>
          <div className="embed-responsive" style={{ height: "99%" }}>
            {pdfUrl && (
              <iframe
                className="embed-responsive-item w-100 h-100"
                src={pdfUrl}
                title="Podgląd raportu PDF"
              ></iframe>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-secondary" onClick={handleClose}>
            Zamknij
          </button>
          <button className="btn btn-primary" onClick={handleDownload}>
            Pobierz raport
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CreateReportForm;