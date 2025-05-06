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
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);

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
  }, []);

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

  const handleShowInvoice = async (invoiceId: number) => {
    try {
      setLoadingPdf(true);
      setSelectedInvoiceId(invoiceId);

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
      setLoadingPdf(false);
    }
  };

  const handleCloseModal = () => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }
    setShowModal(false);
    setPdfUrl(null);
    setSelectedInvoiceId(null);
  };

  const handleClickNewInvoice = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate("/ManagerDashboard/CreateInvoice");
  };

  const handleDeleteClick = (invoiceId: number) => {
    setInvoiceToDelete(invoiceId);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setInvoiceToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (invoiceToDelete === null) return;

    try {
      const response = await api.delete(`/invoices/${invoiceToDelete}`);

      if (response.status === 204) {
        showNotification("success", "Faktura została pomyślnie usunięta");
        fetchInvoices();
      } else {
        showNotification("error", "Wystąpił błąd podczas usuwania faktury");
      }
    } catch (error: any) {
      console.error("Błąd podczas usuwania faktury:", error);
      showNotification(
        "error",
        error.response?.data?.message || "Wystąpił błąd podczas usuwania faktury",
      );
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

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Faktury</h3>
        {/* <div className="card-actions">
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={handleClickNewInvoice}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M14 3v4a1 1 0 0 0 1 1h4" />
              <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
              <path d="M9 17h6" />
              <path d="M9 13h6" />
            </svg>
            Nowa faktura
          </button>
        </div> */}
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
                <tr key={invoice.id}>
                  <td>{invoice.pdfFile.split("/").pop() || `faktura-${invoice.id}.pdf`}</td>
                  <td>{formatDate(invoice.issueDate)}</td>
                  <td>{invoice.companyName}</td>
                  <td>{invoice.companyNip}</td>
                  <td>{invoice.companyAddress}</td>
                  <td className="text-center">
                    <div className="btn-list">
                      <button
                        className="btn btn-primary"
                        onClick={() => handleShowInvoice(invoice.id)}
                        disabled={loadingPdf && selectedInvoiceId === invoice.id}
                      >
                        {loadingPdf && selectedInvoiceId === invoice.id ? (
                          "Ładowanie faktury..."
                        ) : (
                          <>
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
                          </>
                        )}
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDeleteClick(invoice.id)}
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
          <Modal.Title>Faktura PDF</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ height: "80vh" }}>
          <div className="embed-responsive" style={{ height: "99%" }}>
            {pdfUrl ? (
              <iframe
                className="embed-responsive-item w-100 h-100"
                src={pdfUrl}
                title="Faktura PDF"
              ></iframe>
            ) : (
              <div className="text-center">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="mt-2">Ładowanie faktury...</p>
              </div>
            )}
          </div>
        </Modal.Body>
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
