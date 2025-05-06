import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { api } from "../services/api";
import { useNotification } from "../contexts/notification";

const ReportPdfViewer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState<number>(1);

  useEffect(() => {
    if (id) {
      fetchPdfData(id);
    } else {
      setError("Brak identyfikatora raportu");
      setLoading(false);
    }
  }, [id]);

  const fetchPdfData = async (reportId: string) => {
    try {
      setLoading(true);

      console.log(`Pobieranie raportu o ID: ${reportId}`);

      const response = await api.get(`/reports/saved/${reportId}`, {}, {
        responseType: "blob",
        headers: {
          'Accept': 'application/pdf',
        }
      });

      console.log("Otrzymano odpowiedź z serwera:", response);

      if (!response.data) {
        console.error("Otrzymano pustą odpowiedź");
        setError("Otrzymano pustą odpowiedź z serwera");
        showNotification("error", "Otrzymano pustą odpowiedź z serwera");
        return;
      }

      const blob = response.data;
      console.log(`Otrzymany blob: typ=${blob.type}, rozmiar=${blob.size} bajtów`);

      let pdfBlob = blob;
      if (!blob.type || blob.type !== 'application/pdf') {
        console.log("Tworzymy nowy blob z poprawnym typem MIME...");
        pdfBlob = new Blob([blob], { type: 'application/pdf' });
        console.log(`Nowy blob: typ=${pdfBlob.type}, rozmiar=${pdfBlob.size} bajtów`);
      }

      const url = URL.createObjectURL(pdfBlob);
      console.log("Utworzono URL dla blob:", url);

      setPdfUrl(url);
      setError(null);
    } catch (err) {
      console.error("Błąd podczas pobierania PDF:", err);
      setError(`Wystąpił błąd podczas pobierania raportu: ${err.message || err}`);
      showNotification("error", "Nie udało się pobrać raportu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="container-xl">
          <h3>Podgląd raportu</h3>
        </div>
      </div>

      <div className="page-body">
        <div className="container-xl">
          <div className="card">
            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status"></div>
                  <p className="mt-3">Ładowanie raportu PDF...</p>
                </div>
              ) : error ? (
                <div className="text-center py-5">
                  <div className="empty">
                    <div className="empty-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-file-alert" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                        <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
                        <path d="M12 17l.01 0" />
                        <path d="M12 11l0 3" />
                      </svg>
                    </div>
                    <p className="empty-title">{error}</p>
                    <p className="empty-subtitle text-secondary">
                      Spróbuj ponownie lub wróć do listy raportów.
                    </p>
                    <div className="empty-action">
                      <button className="btn btn-primary" onClick={() => fetchPdfData(id || '')}>
                        Spróbuj ponownie
                      </button>
                    </div>
                  </div>
                </div>
              ) : pdfUrl ? (
                <div style={{
                  height: "80vh",
                  backgroundColor: "#e6e7e9",
                  display: "flex",
                  justifyContent: "center",
                  padding: "20px",
                  overflow: "auto"
                }}>
                  <iframe
                    src={pdfUrl}
                    style={{
                      backgroundColor: "#fff",
                      border: "none",
                      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                      transformOrigin: "center",
                      transform: `scale(${scale})`,
                      transition: "transform 0.2s ease",
                      width: `${100 / scale}%`,
                      height: `${100 / scale}%`,
                      maxWidth: "1200px"
                    }}
                    title={`Raport PDF ${id}`}
                  />
                </div>
              ) : (
                <div className="text-center py-5">
                  <div className="empty">
                    <div className="empty-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-file-unknown" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                        <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
                        <path d="M12 17v.01" />
                        <path d="M12 14a1.5 1.5 0 1 0 -1.14 -2.474" />
                      </svg>
                    </div>
                    <p className="empty-title">Brak danych raportu</p>
                    <p className="empty-subtitle text-secondary">
                      Nie udało się załadować danych raportu, spróbuj ponownie
                    </p>
                    <div className="empty-action">
                      <button className="btn btn-primary" onClick={() => fetchPdfData(id || '')}>
                        Spróbuj ponownie
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPdfViewer;