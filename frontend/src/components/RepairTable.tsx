import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { api } from "../services/api";
import { useNotification } from "../contexts/notification";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

const RepairTable = () => {
  const navigate = useNavigate();
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(() => localStorage.getItem("repairsSearch") || "");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    const saved = localStorage.getItem("repairsItemsPerPage");
    return saved ? Number(saved) : 8;
  });

  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterAssignee, setFilterAssignee] = useState("ALL");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRepairId, setSelectedRepairId] = useState(null);

  const { showNotification } = useNotification();

  useEffect(() => {
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

    fetchRepairs();
  }, []);

  const handleShowRepairDetails = (id) => {
    navigate(`/RecepcionistDashboard/Orders/RepairsOrderDetails/${id}`);
  };

  const handleDeleteClick = (id) => {
    setSelectedRepairId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/maintenance-requests/${selectedRepairId}`);
      setRepairs((prev) => prev.filter((task) => task.id !== selectedRepairId));
      showNotification('success', 'Zlecenie zostało usunięte.');
    } catch (err) {
      console.error('Błąd podczas usuwania zgłoszenia:', err);
      showNotification('error', 'Nie udało się usunąć zgłoszenia.');
    } finally {
      setShowDeleteModal(false);
      setSelectedRepairId(null);
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setItemsPerPage(8);
    setFilterStatus("ALL");
    setFilterAssignee("ALL");
    setCurrentPage(1);
    localStorage.removeItem("repairsItemsPerPage");
    localStorage.removeItem("repairsSearch");
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setCurrentPage(1);
    localStorage.setItem("repairsSearch", value);
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value);
    setCurrentPage(1);
    localStorage.setItem("repairsItemsPerPage", value.toString());
  };

  const assigneeOptions = Array.from(
    new Set(repairs.map((r) => r.assignee?.id + "|" + r.assignee?.firstName + " " + r.assignee?.lastName))
  ).filter(Boolean);

  const filteredRepairs = repairs
    .filter((r) => r.description.toLowerCase().includes(search.toLowerCase()))
    .filter((r) => filterStatus === "ALL" || r.status === filterStatus)
    .filter((r) => {
      if (filterAssignee === "ALL") return true;
      return String(r.assignee?.id) === filterAssignee;
    })
    .sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());

  const totalPages = Math.ceil(filteredRepairs.length / itemsPerPage);
  const currentData = filteredRepairs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (dateStr) => (dateStr ? new Date(dateStr).toLocaleDateString() : "-");

  if (loading) return <div>Ładowanie danych...</div>;

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Zgłoszenia serwisowe</h3>
      </div>

      <div className="card-body border-bottom py-3">
        <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2 text-secondary">
            <span>Pokaż</span>
            <select
              className="form-select form-select-sm"
              style={{ width: "80px" }}
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
            >
              {[5, 8, 10, 20, 50].map((count) => (
                <option key={count} value={count}>{count}</option>
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
            </select>

            <select
              className="form-select form-select-sm"
              style={{ width: "170px" }}
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
            >
              <option value="ALL">Wszyscy pracownicy</option>
              {assigneeOptions.map((opt) => {
                const [id, name] = opt.split("|");
                return (
                  <option key={id} value={id}>
                    {name}
                  </option>
                );
              })}
            </select>

            <input
              type="text"
              className="form-control form-control-sm"
              style={{ width: "180px" }}
              placeholder="Szukaj opisu..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />

            <button className="btn btn-outline-secondary btn-sm" onClick={handleResetFilters}>
              Resetuj
            </button>
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
                        backgroundImage: `url(${req.assignee?.avatarUrl})`,
                      }}
                    ></span>
                    <div className="flex-fill">
                      <div className="font-weight-medium">
                        {req.assignee?.firstName} {req.assignee?.lastName}
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
                  <button className="btn btn-primary" onClick={() => handleShowRepairDetails(req.id)}>
                    Zobacz
                  </button>
                </td>
                <td>
                  <button className="btn btn-danger" onClick={() => handleDeleteClick(req.id)}>
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
          Wyświetlono <span>{(currentPage - 1) * itemsPerPage + 1}</span> do{" "}
          <span>{Math.min(currentPage * itemsPerPage, filteredRepairs.length)}</span> z{" "}
          <span>{filteredRepairs.length}</span> wyników
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

      <DeleteConfirmationModal
        show={showDeleteModal}
        handleClose={() => setShowDeleteModal(false)}
        handleConfirm={handleConfirmDelete}
        message="Czy na pewno chcesz usunąć to zlecenie?"
      />
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
