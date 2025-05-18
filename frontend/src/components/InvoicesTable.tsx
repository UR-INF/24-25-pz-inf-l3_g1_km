import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { api } from "../services/api";
import { useNotification } from "../contexts/notification";
import { useNavigate } from "react-router";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

interface Invoice {
  id: number;
  issueDate: string;
  pdfFile: string;
  companyNip: string;
  companyName: string;
  companyAddress: string;
}

const InvoicesTable = () => {
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  const [showModal, setShowModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<number | null>(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await api.get("/invoices");
      setInvoices(response.data);
    } catch (err) {
      console.error("Błąd podczas pobierania faktur:", err);
      showNotification("error", "Nie udało się pobrać listy faktur");
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const viewInvoice = async (invoice: Invoice) => {
    try {
      setLoadingPdf(true);
      setCurrentInvoice(invoice);
      setShowModal(true);

      console.log(`Pobieranie faktury o ID: ${invoice.id}`);

      const response = await api.get(
        `/invoices/${invoice.id}/pdf`,
        {},
        {
          responseType: "blob",
          headers: {
            Accept: "application/pdf",
          },
        }
      );

      if (!response.data) {
        console.error("Otrzymano pustą odpowiedź");
        showNotification("error", "Otrzymano pustą odpowiedź z serwera");
        return;
      }

      const blob = response.data;
      let pdfBlob = blob;
      if (!blob.type || blob.type !== "application/pdf") {
        pdfBlob = new Blob([blob], { type: "application/pdf" });
      }

      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);
    } catch (error) {
      console.error("Błąd podczas pobierania PDF:", error);
      showNotification("error", "Nie udało się pobrać faktury");
    } finally {
      setLoadingPdf(false);
    }
  };

  const handleCloseModal = () => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }
    setPdfUrl(null);
    setShowModal(false);
    setCurrentInvoice(null);
  };

  const handleDeleteClick = (invoiceId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setInvoiceToDelete(invoiceId);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setInvoiceToDelete(null);
  };

  const findReservationWithInvoice = async (invoiceId) => {
    try {
      const response = await api.get("/reservations");
      const allReservations = response.data;
      
      const reservationWithInvoice = allReservations.find(reservation => {
        if (reservation.invoice && reservation.invoice.id === invoiceId) {
          return true;
        }
        if (reservation.invoiceId === invoiceId) {
          return true;
        }
        return false;
      });
      
      return reservationWithInvoice || null;
    } catch (error) {
      console.error("Błąd podczas szukania rezerwacji z fakturą:", error);
      return null;
    }
  };

  const handleConfirmDelete = async () => {
    if (invoiceToDelete === null) return;
    
    console.log(`Przygotowanie do usunięcia faktury ID: ${invoiceToDelete}`);

    try {
      const reservationWithInvoice = await findReservationWithInvoice(invoiceToDelete);
      
      if (reservationWithInvoice) {
        console.log(`Znaleziono rezerwację ${reservationWithInvoice.id} powiązaną z fakturą ${invoiceToDelete}`);
        
        try {
          const updatedReservation = { ...reservationWithInvoice };
          
          if (updatedReservation.invoice) {
            updatedReservation.invoice = null;
          }
          if (updatedReservation.invoiceId) {
            updatedReservation.invoiceId = "";
          }
          
          console.log("Aktualizacja rezerwacji - odłączanie faktury");
          const updateResponse = await api.put(`/reservations/${reservationWithInvoice.id}`, updatedReservation);
          console.log("Rezerwacja zaktualizowana, status:", updateResponse.status);
          
          await new Promise(r => setTimeout(r, 100));
          
          const checkResponse = await api.get(`/reservations/${reservationWithInvoice.id}`);
          if (checkResponse.data.invoice && checkResponse.data.invoice.id === invoiceToDelete) {
            console.error("Nie udało się odłączyć faktury od rezerwacji");
            showNotification("error", "Nie udało się odłączyć faktury od rezerwacji");
            return;
          }
          
          if (checkResponse.data.invoiceId === invoiceToDelete) {
            console.error("Nie udało się odłączyć faktury od rezerwacji");
            showNotification("error", "Nie udało się odłączyć faktury od rezerwacji");
            return;
          }
          
          console.log("Faktura została pomyślnie odłączona od rezerwacji");
        } catch (error) {
          console.error("Błąd podczas aktualizacji rezerwacji:", error);
          showNotification("error", "Wystąpił błąd podczas odłączania faktury od rezerwacji");
          return;
        }
      } else {
        console.log("Nie znaleziono rezerwacji z tą fakturą");
      }
      
      console.log(`Usuwanie faktury ID: ${invoiceToDelete}`);
      try {
        const response = await api.delete(`/invoices/${invoiceToDelete}`);
        
        if (response.status === 204) {
          console.log("Faktura została pomyślnie usunięta");
          showNotification("success", "Faktura została pomyślnie usunięta");
          await fetchInvoices();
        } else {
          console.log("Niestandardowy kod odpowiedzi przy usuwaniu faktury:", response.status);
          showNotification("warning", "Odpowiedź serwera jest niejednoznaczna. Sprawdź, czy faktura została usunięta.");
          await fetchInvoices();
        }
      } catch (error) {
        console.error("Błąd podczas usuwania faktury:", error);
        showNotification("error", "Nie udało się usunąć faktury");
      }
    } catch (error) {
      console.error("Nieoczekiwany błąd:", error);
      showNotification("error", "Wystąpił nieoczekiwany błąd podczas usuwania faktury");
    } finally {
      handleCloseDeleteModal();
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setItemsPerPage(8);
    setCurrentPage(1);
  };

  const safeInvoices = Array.isArray(invoices) ? invoices : [];

  const filteredInvoices = safeInvoices.filter((invoice) => {
    if (!invoice) return false;

    const pdfFile = invoice.pdfFile || "";
    const companyDetails = `${invoice.companyName || ""} ${invoice.companyNip || ""}`;

    return (
      pdfFile.toLowerCase().includes(search.toLowerCase()) ||
      companyDetails.toLowerCase().includes(search.toLowerCase())
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / itemsPerPage));
  const currentData = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Formatowanie daty
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";

    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("pl-PL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(date);
    } catch (error) {
      console.error("Błąd formatowania daty:", error);
      return dateString;
    }
  };

  const getInvoiceNameToDelete = () => {
    if (invoiceToDelete === null) return "";
    const invoice = safeInvoices.find((inv) => inv.id === invoiceToDelete);
    return invoice ? invoice.pdfFile.split("/").pop() || `faktura-${invoice.id}.pdf` : "";
  };

  const tableRowStyle = {
    cursor: "pointer",
    transition: "background-color 0.2s",
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Faktury</h3>
        <div className="card-actions">
        </div>
      </div>

      <div className="card-body border-bottom py-3">
        <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2 text-secondary">
            <span>Pokaż</span>
            <select
              className="form-select form-select-sm"
              style={{ width: "80px" }}
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
            >
              {[5, 8, 10, 20, 50].map((count) => (
                <option key={count} value={count}>
                  {count}
                </option>
              ))}
            </select>
            <span>wyników</span>
          </div>

          <div className="d-flex flex-wrap gap-2 align-items-center">
            <input
              type="text"
              className="form-control form-control-sm"
              style={{ width: "250px" }}
              placeholder="Szukaj faktury/nazwy firmy/NIP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <button className="btn btn-outline-secondary btn-sm" onClick={handleResetFilters}>
              Resetuj
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card-body">
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2">Ładowanie faktur...</p>
          </div>
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="card-body">
          <div className="text-center my-5">
            <div className="h3">Brak faktur</div>
            <p className="text-muted">Nie znaleziono żadnych faktur dla wybranych kryteriów.</p>
          </div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table card-table table-vcenter text-nowrap datatable">
            <thead>
              <tr>
                <th>Numer faktury</th>
                <th>Data wystawienia</th>
                <th>Nazwa firmy</th>
                <th>NIP</th>
                <th>Adres</th>
                <th className="text-center">Akcje</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((invoice) => (
                <tr 
                  key={invoice.id}
                  style={tableRowStyle}
                  onClick={() => viewInvoice(invoice)}
                  className="hover-row"
                >
                  <td>{invoice.pdfFile.split("/").pop() || `faktura-${invoice.id}.pdf`}</td>
                  <td>{formatDate(invoice.issueDate)}</td>
                  <td>{invoice.companyName}</td>
                  <td>{invoice.companyNip}</td>
                  <td>{invoice.companyAddress}</td>
                  <td className="text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="btn-list">
                      <button
                        className="btn btn-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          viewInvoice(invoice);
                        }}
                        title="Podgląd faktury"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="icon me-1"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          stroke="currentColor"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                          <path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
                          <path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" />
                        </svg>
                        Pokaż fakturę
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={(e) => handleDeleteClick(invoice.id, e)}
                        title="Usuń fakturę"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="icon me-1"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          stroke="currentColor"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                          <path d="M4 7l16 0" />
                          <path d="M10 11l0 6" />
                          <path d="M14 11l0 6" />
                          <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                          <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
                        </svg>
                        Usuń
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="card-footer d-flex align-items-center">
        <p className="m-0 text-secondary">
          {filteredInvoices.length > 0 ? (
            <>
              Wyświetlono <span>{(currentPage - 1) * itemsPerPage + 1}</span> do{" "}
              <span>{Math.min(currentPage * itemsPerPage, filteredInvoices.length)}</span> z{" "}
              <span>{filteredInvoices.length}</span> faktur
            </>
          ) : (
            "Brak faktur do wyświetlenia"
          )}
        </p>
        {filteredInvoices.length > 0 && (
          <ul className="pagination m-0 ms-auto">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => setCurrentPage((p) => p - 1)}
                disabled={currentPage === 1}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="icon icon-1"
                >
                  <path d="M15 6l-6 6l6 6"></path>
                </svg>
                poprzednia
              </button>
            </li>
            {Array.from({ length: totalPages }, (_, i) => (
              <li className={`page-item ${i + 1 === currentPage ? "active" : ""}`} key={i}>
                <button className="page-link" onClick={() => setCurrentPage(i + 1)}>
                  {i + 1}
                </button>
              </li>
            ))}
            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage === totalPages}
              >
                następna
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="icon icon-1"
                >
                  <path d="M9 6l6 6l-6 6"></path>
                </svg>
              </button>
            </li>
          </ul>
        )}
      </div>

      <Modal
        show={showModal}
        onHide={handleCloseModal}
        size="xl"
        dialogClassName="modal-dialog-scrollable"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Podgląd faktury
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ height: "80vh" }}>
          <div className="embed-responsive" style={{ height: "99%" }}>
            {pdfUrl && (
              <iframe
                className="embed-responsive-item w-100 h-100"
                src={pdfUrl}
                title="Podgląd faktury PDF"
              ></iframe>
            )}
            {loadingPdf && (
              <div className="text-center position-absolute top-50 start-50 translate-middle">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="mt-2">Ładowanie faktury...</p>
              </div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-secondary" onClick={handleCloseModal}>
            Zamknij
          </button>
        </Modal.Footer>
      </Modal>

      <DeleteConfirmationModal
        show={showDeleteModal}
        handleClose={handleCloseDeleteModal}
        handleConfirm={handleConfirmDelete}
        message={`Ta operacja spowoduje trwałe usunięcie faktury ${getInvoiceNameToDelete()}. Tej operacji nie można cofnąć.`}
      />
    </div>
  );
};

export default InvoicesTable;