import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { useNotification } from "../contexts/notification";
import { useNavigate } from "react-router";

const RoomMaintenanceTable = ({ roomId, roomNumber, floor }) => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [filterStatus, setFilterStatus] = useState("ALL");

  useEffect(() => {
    if (roomId) {
      fetchRoomMaintenances(roomId);
    }
  }, [roomId]);

  const fetchRoomMaintenances = async (id) => {
    try {
      setLoading(true);
      const response = await api.get(`/maintenance-requests/room/${id}`);
      setRepairs(response.data || []);
    } catch (err) {
      console.error("Błąd podczas pobierania zgłoszeń pokoju:", err);
      showNotification("error", "Nie udało się pobrać danych o naprawach pokoju");
      setRepairs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleShowRepairDetails = (id) => {
    navigate(`/RecepcionistDashboard/Orders/RepairsOrderDetails/${id}`);
  };

  const handleResetFilters = () => {
    setSearch("");
    setItemsPerPage(5);
    setFilterStatus("ALL");
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("pl-PL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      }).format(date);
    } catch (error) {
      console.error("Błąd formatowania daty:", error);
      return dateString;
    }
  };

  const translateStatus = (status) => {
    switch (status) {
      case "PENDING":
        return "Do wykonania";
      case "IN_PROGRESS":
        return "W trakcie";
      case "COMPLETED":
        return "Ukończono";
      case "CANCELED":
        return "Anulowany";
      default:
        return status;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "PENDING":
        return "badge bg-secondary text-white";
      case "IN_PROGRESS":
        return "badge bg-warning text-white";
      case "COMPLETED":
        return "badge bg-success text-white";
      case "CANCELED":
        return "badge bg-secondary text-white";
      default:
        return "badge bg-primary text-white";
    }
  };

  const filteredRepairs = repairs
    .filter((repair) => 
      repair.description.toLowerCase().includes(search.toLowerCase())
    )
    .filter((repair) => 
      filterStatus === "ALL" || repair.status === filterStatus
    )
    .sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());

  const totalPages = Math.max(1, Math.ceil(filteredRepairs.length / itemsPerPage));
  const currentData = filteredRepairs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Ładowanie...</span>
        </div>
        <p className="mt-2">Ładowanie zgłoszeń serwisowych...</p>
      </div>
    );
  }

  return (
    <div>
      {roomNumber && floor && (
        <h4 className="mb-3">Zgłoszenia serwisowe - Pokój {roomNumber} (Piętro {floor})</h4>
      )}

      <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center gap-2 text-secondary">
          <span>Pokaż</span>
          <select
            className="form-select form-select-sm"
            style={{ width: "80px" }}
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
          >
            {[5, 8, 10, 20].map((count) => (
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
            style={{ width: "170px" }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="ALL">Wszystkie statusy</option>
            <option value="PENDING">Do wykonania</option>
            <option value="IN_PROGRESS">W trakcie</option>
            <option value="COMPLETED">Ukończono</option>
            <option value="CANCELED">Anulowano</option>
          </select>

          <input
            type="text"
            className="form-control form-control-sm"
            style={{ width: "180px" }}
            placeholder="Szukaj opisu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button className="btn btn-outline-secondary btn-sm" onClick={handleResetFilters}>
            Resetuj
          </button>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table card-table table-vcenter">
          <thead>
            <tr>
              <th>ID</th>
              <th>Opis problemu</th>
              <th>Data zgłoszenia</th>
              <th>Status</th>
              <th>Osoba zgłaszająca</th>
              <th>Przypisany technik</th>
              <th>Data ukończenia</th>
              <th>Podsumowanie</th>
              <th>Akcje</th>
            </tr>
          </thead>
          <tbody>
            {currentData.length > 0 ? (
              currentData.map((request) => (
                <tr key={request.id}>
                  <td>{request.id}</td>
                  <td>{request.description}</td>
                  <td>{formatDate(request.requestDate)}</td>
                  <td>
                    <span className={getStatusClass(request.status)}>
                      {translateStatus(request.status)}
                    </span>
                  </td>
                  <td>
                    {request.requester ? `${request.requester.firstName} ${request.requester.lastName}` : "-"}
                  </td>
                  <td>
                    {request.assignee ? `${request.assignee.firstName} ${request.assignee.lastName}` : "-"}
                  </td>
                  <td>{formatDate(request.completionDate)}</td>
                  <td>{request.serviceSummary || "-"}</td>
                  <td>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleShowRepairDetails(request.id)}
                    >
                      Zobacz
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="text-center">
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {filteredRepairs.length > 0 && (
        <div className="d-flex align-items-center mt-3">
          <p className="m-0 text-secondary">
            Wyświetlono <span>{Math.min(filteredRepairs.length, 1 + (currentPage - 1) * itemsPerPage)}</span> do{" "}
            <span>{Math.min(currentPage * itemsPerPage, filteredRepairs.length)}</span> z{" "}
            <span>{filteredRepairs.length}</span> zgłoszeń
          </p>
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
        </div>
      )}
    </div>
  );
};

export default RoomMaintenanceTable;