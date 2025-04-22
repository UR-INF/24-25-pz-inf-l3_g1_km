import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { api } from "../services/api";
import { useNotification } from "../contexts/notification";

const ITEMS_PER_PAGE = 8;

const CleaningTable = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { showNotification } = useNotification();

  const fetchCleaningTasks = async () => {
    try {
      const response = await api.get("/housekeeping-tasks");
      setTasks(response.data);
    } catch (err) {
      console.error("Błąd podczas pobierania zadań sprzątania:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleShowDetails = (id: number) => {
    navigate(`/RecepcionistDashboard/Orders/CleaningOrderDetails/${id}`);
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/housekeeping-tasks/${id}`);
      setTasks((prev) => prev.filter((task) => task.id !== id));
    } catch (err) {
      console.error("Błąd podczas usuwania zadania:", err);
      showNotification("error", "Nie udało się usunąć zadania.");
    }
  };

  useEffect(() => {
    fetchCleaningTasks();
  }, []);

  const filteredTasks = tasks
    .filter((task) => task.description.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());

  const totalPages = Math.ceil(filteredTasks.length / ITEMS_PER_PAGE);
  const currentData = filteredTasks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const formatDate = (dateStr?: string) => {
    return dateStr ? new Date(dateStr).toLocaleDateString() : "-";
  };

  if (loading) return <div>Ładowanie danych...</div>;

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Zgłoszenia sprzątania</h3>
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
                  setCurrentPage(1);
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
              <th>Data Zgłoszenia</th>
              <th>Opis</th>
              <th>Pokój</th>
              <th>Pracownik</th>
              <th>Status</th>
              <th>Data Zakończenia</th>
              <th></th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {currentData.map((task: any) => (
              <tr key={task.id}>
                <td>{task.id}</td>
                <td>{formatDate(task.requestDate)}</td>
                <td>{task.description}</td>
                <td>{task.room?.roomNumber ?? "-"}</td>
                <td>
                  {task.employee?.firstName} {task.employee?.lastName}
                </td>
                <td>
                  <span className={`badge me-1 bg-${getStatusColor(task.status)} text-white`}>
                    {translateStatus(task.status)}
                  </span>
                </td>
                <td>{formatDate(task.completionDate)}</td>
                <td className="text-end">
                  <button className="btn btn-primary" onClick={() => handleShowDetails(task.id)}>
                    Zobacz
                  </button>
                </td>
                <td>
                  <button className="btn btn-danger" onClick={() => handleDelete(task.id)}>
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
          <span>{Math.min(currentPage * ITEMS_PER_PAGE, filteredTasks.length)}</span> z{" "}
          <span>{filteredTasks.length}</span> wyników
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

const getStatusColor = (status: string) => {
  switch (status) {
    case "PENDING":
      return "secondary";
    case "IN_PROGRESS":
      return "warning";
    case "COMPLETED":
      return "success";
    case "DECLINED":
      return "danger";
    default:
      return "light";
  }
};

const translateStatus = (status: string) => {
  switch (status) {
    case "PENDING":
      return "Do wykonania";
    case "IN_PROGRESS":
      return "W trakcie";
    case "COMPLETED":
      return "Ukończono";
    case "DECLINED":
      return "Odrzucono";
    default:
      return status;
  }
};

export default CleaningTable;
