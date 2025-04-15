import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { api } from "../services/api";

const RepairTable = () => {
  const navigate = useNavigate();
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRepairs = async () => {
    try {
      const response = await api.get("/housekeeping-tasks");
      setRepairs(response.data);
    } catch (err) {
      console.error("Błąd podczas pobierania zgłoszeń:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleShowRepairDetails = (id: number) => {
    navigate(`/RecepcionistDashboard/RepairOrders/RepairsOrderDetails/${id}`, { replace: true });
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/housekeeping-tasks/${id}`);
      setRepairs((prev) => prev.filter((task) => task.id !== id));
    } catch (err) {
      console.error("Błąd podczas usuwania zgłoszenia:", err);
      alert("Nie udało się usunąć zgłoszenia.");
    }
  };

  useEffect(() => {
    fetchRepairs();
  }, []);

  const formatDate = (dateStr?: string) => {
    return dateStr ? new Date(dateStr).toLocaleDateString() : "-";
  };

  if (loading) return <div>Ładowanie danych...</div>;

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Serwisy</h3>
      </div>

      <div className="table-responsive">
        <table className="table table-selectable card-table table-vcenter text-nowrap datatable">
          <thead>
            <tr>
              <th>ID Zgłoszenia</th>
              <th>Data Zgłoszenia</th>
              <th>Opis</th>
              <th>Pokój</th>
              <th>Osoba Przypisana</th>
              <th>Status</th>
              <th>Data Zakończenia</th>
              <th></th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {repairs.map((task: any) => (
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
                  <button
                    className="btn btn-primary"
                    onClick={() => handleShowRepairDetails(task.id)}
                  >
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

export default RepairTable;
