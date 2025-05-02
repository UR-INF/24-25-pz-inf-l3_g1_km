import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import { api } from "../services/api";
import { useNotification } from "../contexts/notification";

type ShowInvoiceProps = {
  reservationId: number;
};

const ShowInvoiceButton: React.FC<ShowInvoiceProps> = ({ reservationId }) => {
  const [showModal, setShowModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  const handleShowInvoice = async () => {
    try {
      setLoading(true);

      // Pobierz fakturę przypisaną do rezerwacji
      const response = await api.get(`/invoices/reservation/${reservationId}`);
      const invoiceId = response?.data?.id;

      if (!invoiceId) {
        showNotification("error", "Nie znaleziono faktury.");
        return;
      }

      const pdfResponse = await api.get(`/invoices/${invoiceId}/pdf`, {}, { responseType: "blob" });
      const blob = pdfResponse.data;

      if (blob.type !== "application/pdf") {
        showNotification("error", "Serwer zwrócił błąd zamiast PDF.");
        return;
      }

      if (blob.size === 0) {
        showNotification("error", "Pobrano pusty plik PDF.");
        return;
      }

      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setShowModal(true);
    } catch (error) {
      console.error("Błąd podczas pobierania faktury:", error);
      showNotification("error", "Wystąpił błąd podczas pobierania faktury.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }
    setShowModal(false);
    setPdfUrl(null);
  };

  return (
    <>
      <button className="btn btn-primary" onClick={handleShowInvoice} disabled={loading}>
        {loading ? "Ładowanie faktury..." : "Pokaż fakturę"}
      </button>

      <Modal
        show={showModal}
        onHide={handleClose}
        size="xl"
        dialogClassName="modal-dialog-scrollable"
      >
        <Modal.Header closeButton>
          <Modal.Title>Faktura PDF</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ height: "80vh" }}>
          <div className="embed-responsive" style={{ height: "99%" }}>
            {pdfUrl && (
              <iframe
                className="embed-responsive-item w-100 h-100"
                src={pdfUrl}
                title="Faktura PDF"
              ></iframe>
            )}
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ShowInvoiceButton;
