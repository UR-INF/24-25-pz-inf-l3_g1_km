import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { api } from "../services/api";
import { useNotification } from "../contexts/notification";

const ITEMS_PER_PAGE = 8;

const RepairTable = () => {
  const navigate = useNavigate();
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { showNotification } = useNotification();

  const fetchRepairs = async () => {
    try {
      const response = await api.get("/maintenance-requests");
      setRepairs(response.data);
    } catch (err) {
      console.error("Błąd podczas pobierania zgłoszeń serwisowych:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleShowRepairDetails = (id) => {
    navigate(`/RecepcionistDashboard/Orders/RepairsOrderDetails/${id}`);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/maintenance-requests/${id}`);
      setRepairs((prev) => prev.filter((task) => task.id !== id));
      showNotification("success", "Zlecenie zostało usunięte.");
    } catch (err) {
      console.error("Błąd podczas usuwania zgłoszenia:", err);
      showNotification("error", "Nie udało się usunąć zgłoszenia.");
    }
  };

  useEffect(() => {
    fetchRepairs();
  }, []);

  const filteredRepairs = repairs
    .filter((r) => r.description.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());

  const totalPages = Math.ceil(filteredRepairs.length / ITEMS_PER_PAGE);
  const currentData = filteredRepairs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const formatDate = (dateStr) => (dateStr ? new Date(dateStr).toLocaleDateString() : "-");

  if (loading) return <div>Ładowanie danych...</div>;

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Zgłoszenia serwisowe</h3>
      </div>

      <div className="card-body border-bottom py-3">
        <div className="d-flex">
          <div className="text-secondary">
            Pokaż
            <div className="mx-2 d-inline-block">
              <input
                type="text"
                className="form-control form-control-sm"
                value={ITEMS_PER_PAGE}
                size={3}
                disabled
              />
            </div>
            wyników
          </div>
          <div className="ms-auto text-secondary">
            Wyszukaj:
            <div className="ms-2 d-inline-block">
              <input
                type="text"
                className="form-control form-control-sm"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1); // reset page after search
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-selectable card-table table-vcenter text-nowrap datatable">
          <thead>
            <tr>
              <th>ID</th>
              <th>Data zgłoszenia</th>
              <th>Opis</th>
              <th>Pokój</th>
              <th>Przypisany pracownik</th>
              <th>Status</th>
              <th>Data zakończenia</th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((req) => (
              <tr key={req.id}>
                <td>{req.id}</td>
                <td>{formatDate(req.requestDate)}</td>
                <td>{req.description}</td>
                <td>{req.room?.roomNumber ?? "-"}</td>
                <td>
                  <div className="d-flex py-1 align-items-center">
                    <span
                      className="avatar avatar-sm me-2"
                      style={{
                        backgroundImage: `url(${req.assignee.avatarUrl})`,
                      }}
                    ></span>
                    <div className="flex-fill">
                      <div className="font-weight-medium">
                        {req.assignee.firstName} {req.assignee.lastName}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`badge me-1 bg-${getStatusColor(req.status)} text-white`}>
                    {translateStatus(req.status)}
                  </span>
                </td>
                <td>{formatDate(req.completionDate)}</td>
                <td className="text-end">
                  <button
                    className="btn btn-primary"
                    onClick={() => handleShowRepairDetails(req.id)}
                  >
                    Zobacz
                  </button>
                </td>
                <td>
                  <button className="btn btn-danger" onClick={() => handleDelete(req.id)}>
                    Usuń
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card-footer d-flex align-items-center">
        <p className="m-0 text-secondary">
          Wyświetlono <span>{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> do{" "}
          <span>{Math.min(currentPage * ITEMS_PER_PAGE, filteredRepairs.length)}</span> z{" "}
          <span>{filteredRepairs.length}</span> wyników
        </p>
        <ul className="pagination m-0 ms-auto">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={currentPage === 1}
            >
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
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

const getStatusColor = (status) => {
  switch (status) {
    case "PENDING":
      return "secondary";
    case "IN_PROGRESS":
      return "warning";
    case "COMPLETED":
      return "success";
    default:
      return "light";
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
    default:
      return status;
  }
};

export default RepairTable;
