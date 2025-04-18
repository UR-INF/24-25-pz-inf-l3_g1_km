import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { api } from "../services/api";

const RepairTable = () => {
  const navigate = useNavigate();
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleShowRepairDetails = (id: number) => {
    navigate(`/RecepcionistDashboard/RepairOrders/RepairsOrderDetails/${id}`);
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/maintenance-requests/${id}`);
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
        <h3 className="card-title">Zgłoszenia serwisowe</h3>
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
            {repairs.map((req: any) => (
              <tr key={req.id}>
                <td>{req.id}</td>
                <td>{formatDate(req.requestDate)}</td>
                <td>{req.description}</td>
                <td>{req.room?.roomNumber ?? "-"}</td>
                <td>
                  {req.assignee
                    ? `${req.assignee.firstName} ${req.assignee.lastName}`
                    : "Nieprzypisany"}
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
    default:
      return status;
  }
};

export default RepairTable;
