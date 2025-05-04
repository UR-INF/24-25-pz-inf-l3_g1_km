import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { api } from "../services/api";
import { useNotification } from "../contexts/notification";

/**
 * Komponent do wyświetlania raportu PDF.
 * Pobiera dane raportu poprzez API i wyświetla je.
 */
const ReportPdfViewer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  
  const [pdfData, setPdfData] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState<number>(1);
  
  // Pobieranie danych PDF z API
  useEffect(() => {
    if (id) {
      fetchPdfData(id);
    } else {
      setError("Brak identyfikatora raportu");
      setLoading(false);
    }
  }, [id]);
  
  // Funkcja pobierająca dane PDF z API
  const fetchPdfData = async (reportId: string) => {
    try {
      setLoading(true);
      
      // Bezpośrednie pobranie danych PDF z API
      const response = await api.get(`/reports/saved/${reportId}` ,{
        responseType: "blob" // Ważne - obsługa danych binarnych (PDF)
      });
      
      if (response.data) {
        // Tworzymy URL dla Blob
        const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
        const pdfUrl = URL.createObjectURL(pdfBlob);
        setPdfData(pdfUrl);
        setError(null);
      } else {
        setError("Nie udało się pobrać danych raportu");
        showNotification("error", "Nie udało się pobrać danych raportu");
      }
    } catch (err) {
      console.error("Błąd podczas pobierania PDF:", err);
      setError("Wystąpił błąd podczas pobierania raportu");
      showNotification("error", "Nie udało się pobrać raportu");
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoBack = () => {
    navigate("/ManagerDashboard/Reports");
  };
  
  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 2.5));
  };
  
  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };
  
  const resetZoom = () => {
    setScale(1);
  };
  
  // Funkcja do pobrania PDF
  const downloadPdf = () => {
    if (pdfData) {
      const link = document.createElement('a');
      link.href = pdfData;
      link.download = `raport-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  return (
    <div className="container-xl">
      <div className="page-header d-print-none">
        <div className="row align-items-center">
          <div className="col">
            <div className="page-pretitle">Podgląd</div>
            <h2 className="page-title">
              {loading ? "Ładowanie raportu..." : error ? "Błąd ładowania" : "Raport PDF"}
            </h2>
          </div>
          <div className="col-auto ms-auto d-flex gap-2">
            {!loading && !error && pdfData && (
              <div className="btn-group">
                <button 
                  className="btn btn-outline-primary" 
                  onClick={zoomOut} 
                  title="Zmniejsz"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
                    <path d="M7 10l6 0" />
                    <path d="M21 21l-6 -6" />
                  </svg>
                </button>
                <button 
                  className="btn btn-outline-primary" 
                  onClick={resetZoom} 
                  title="Reset zoom"
                >
                  {Math.round(scale * 100)}%
                </button>
                <button 
                  className="btn btn-outline-primary" 
                  onClick={zoomIn} 
                  title="Powiększ"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
                    <path d="M7 10l6 0" />
                    <path d="M10 7l0 6" />
                    <path d="M21 21l-6 -6" />
                  </svg>
                </button>
              </div>
            )}
            <button className="btn btn-outline-secondary" onClick={handleGoBack}>
              <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M5 12l14 0" />
                <path d="M5 12l6 6" />
                <path d="M5 12l6 -6" />
              </svg>
              Powrót
            </button>
            {!loading && !error && pdfData && (
              <button 
                className="btn btn-primary"
                onClick={downloadPdf}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                  <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" />
                  <path d="M7 11l5 5l5 -5" />
                  <path d="M12 4l0 12" />
                </svg>
                Pobierz
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="card">
        <div className="card-body p-0">
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
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
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
          ) : pdfData ? (
            <div style={{ 
              height: "80vh", 
              backgroundColor: "#e6e7e9", 
              display: "flex", 
              justifyContent: "center", 
              padding: "20px",
              overflow: "auto" 
            }}>
              <iframe 
                src={pdfData}
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
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
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
  );
};

export default ReportPdfViewer;