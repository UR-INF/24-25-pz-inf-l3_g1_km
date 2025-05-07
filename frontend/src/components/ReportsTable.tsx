import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import { useNotification } from "../contexts/notification";
import { useNavigate } from "react-router";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  role: {
    id: number;
    name: string;
  };
  avatarUrl: string;
}

interface Report {
  id: number;
  reportFile: string;
  createdAt: string;
  reportType: string;
  createdBy: Employee;
}

const ReportsTable = () => {
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [filterReportType, setFilterReportType] = useState("ALL");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<number | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await api.get("/reports/saved");
      setReports(response.data);
    } catch (err) {
      console.error("Błąd podczas pobierania raportów:", err);
      showNotification("error", "Nie udało się pobrać listy raportów");
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const viewReport = (report: Report) => {
    navigate(`/ManagerDashboard/ShowReport/${report.id}`);
  };

  const handleDeleteClick = (reportId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setReportToDelete(reportId);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setReportToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (reportToDelete === null) return;

    try {
      const response = await api.delete(`/reports/saved/${reportToDelete}`);

      if (response.data.success) {
        showNotification("success", "Raport został pomyślnie usunięty");
        fetchReports();
      } else {
        showNotification(
          "error",
          response.data.message || "Wystąpił błąd podczas usuwania raportu",
        );
      }
    } catch (error: any) {
      console.error("Błąd podczas usuwania raportu:", error);
      showNotification(
        "error",
        error.response?.data?.message || "Wystąpił błąd podczas usuwania raportu",
      );
    } finally {
      handleCloseDeleteModal();
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setItemsPerPage(8);
    setFilterReportType("ALL");
    setCurrentPage(1);
  };

  const safeReports = Array.isArray(reports) ? reports : [];

  const filteredReports = safeReports
    .filter((report) => {
      if (!report) return false;

      const reportFile = report.reportFile || "";
      const employeeName = `${report.createdBy?.firstName || ""} ${report.createdBy?.lastName || ""}`;

      return (
        reportFile.toLowerCase().includes(search.toLowerCase()) ||
        employeeName.toLowerCase().includes(search.toLowerCase())
      );
    })
    .filter((report) => {
      if (!report) return false;
      if (filterReportType === "ALL") return true;

      return report.reportType === filterReportType;
    });

  const totalPages = Math.max(1, Math.ceil(filteredReports.length / itemsPerPage));
  const currentData = filteredReports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const getReportTypeDisplay = (type: string) => {
    switch (type) {
      case "EMPLOYEE_STATISTICS":
        return "Statystyki pracowników";
      case "GENERAL_REPORT":
        return "Raport ogólny";
      default:
        return type;
    }
  };

  const tableRowStyle: React.CSSProperties = {
    cursor: "pointer",
    transition: "background-color 0.2s",
  };

  const handleClickNewReport = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate("/ManagerDashboard/CreateReport");
  };

  const getReportNameToDelete = () => {
    if (reportToDelete === null) return "";
    const report = safeReports.find((rep) => rep.id === reportToDelete);
    return report ? report.reportFile : "";
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Zapisane raporty</h3>
        <div className="card-actions">
          <button className="btn btn-outline-primary btn-sm" onClick={handleClickNewReport}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="icon"
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
              <path d="M14 3v4a1 1 0 0 0 1 1h4" />
              <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
              <path d="M9 17h6" />
              <path d="M9 13h6" />
            </svg>
            Nowy raport
          </button>
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
            <select
              className="form-select form-select-sm"
              style={{ width: "200px" }}
              value={filterReportType}
              onChange={(e) => setFilterReportType(e.target.value)}
            >
              <option value="ALL">Wszystkie typy raportów</option>
              <option value="EMPLOYEE_STATISTICS">Statystyki pracowników</option>
              <option value="GENERAL_REPORT">Raport ogólny</option>
            </select>

            <input
              type="text"
              className="form-control form-control-sm"
              style={{ width: "200px" }}
              placeholder="Szukaj raportu/autora..."
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
            <p className="mt-2">Ładowanie raportów...</p>
          </div>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="card-body">
          <div className="text-center my-5">
            <div className="h3">Brak raportów</div>
            <p className="text-muted">Nie znaleziono żadnych raportów dla wybranych kryteriów.</p>
          </div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table card-table table-vcenter text-nowrap datatable">
            <thead>
              <tr>
                <th>Nazwa pliku</th>
                <th>Typ raportu</th>
                <th>Data utworzenia</th>
                <th>Utworzony przez</th>
                <th className="text-center">Akcje</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((report) => (
                <tr
                  key={report.id}
                  style={tableRowStyle}
                  onClick={() => viewReport(report)}
                  className="hover-row"
                >
                  <td>{report.reportFile}</td>
                  <td>
                    <span
                      className={`text-white badge ${report.reportType === "EMPLOYEE_STATISTICS" ? "bg-blue" : "bg-green"}`}
                    >
                      {getReportTypeDisplay(report.reportType)}
                    </span>
                  </td>
                  <td>{formatDateTime(report.createdAt)}</td>
                  <td>
                    <div className="d-flex py-1 align-items-center">
                      <span
                        className="avatar shadow avatar-sm me-2"
                        style={{
                          backgroundImage: report.createdBy?.avatarUrl
                            ? `url(${report.createdBy.avatarUrl})`
                            : "none",
                        }}
                      ></span>
                      <div className="flex-fill">
                        <div className="font-weight-medium">
                          {report.createdBy?.firstName} {report.createdBy?.lastName}
                        </div>
                        <div className="text-muted small">{report.createdBy?.role?.name || ""}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="btn-list">
                      <button
                        className="btn btn-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          viewReport(report);
                        }}
                        title="Podgląd raportu"
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
                        Pokaż raport
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={(e) => handleDeleteClick(report.id, e)}
                        title="Usuń raport"
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
                        Usuń raport
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
          {filteredReports.length > 0 ? (
            <>
              Wyświetlono <span>{(currentPage - 1) * itemsPerPage + 1}</span> do{" "}
              <span>{Math.min(currentPage * itemsPerPage, filteredReports.length)}</span> z{" "}
              <span>{filteredReports.length}</span> raportów
            </>
          ) : (
            "Brak raportów do wyświetlenia"
          )}
        </p>
        {filteredReports.length > 0 && (
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

      {/* Modal potwierdzenia usunięcia */}
      <DeleteConfirmationModal
        show={showDeleteModal}
        handleClose={handleCloseDeleteModal}
        handleConfirm={handleConfirmDelete}
        message={`Ta operacja spowoduje trwałe usunięcie raportu "${getReportNameToDelete()}". Tej operacji nie można cofnąć.`}
      />
    </div>
  );
};

export const formatDateTime = (dateTimeString: string) => {
  if (!dateTimeString) return "-";

  try {
    const date = new Date(dateTimeString);
    return new Intl.DateTimeFormat("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch (error) {
    console.error("Błąd formatowania daty:", error);
    return dateTimeString;
  }
};

export default ReportsTable;
