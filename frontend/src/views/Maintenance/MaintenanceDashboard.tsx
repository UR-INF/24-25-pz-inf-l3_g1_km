import React, { useEffect, useState } from "react";
import { api } from "../../services/api";
import { useUser } from "../../contexts/user";
import RepairsCard from "../../components/RepairsCard";
import RepairTable from "../../components/RepairTable";
import { useNotification } from "../../contexts/notification";
import { useNavigate } from "react-router";

const MaintenanceDashboard = () => {
  const { userId } = useUser();
  const { showNotification } = useNotification();
  const [requests, setRequests] = useState([]);
  const navigate = useNavigate();

  const fetchRequests = async () => {
    try {
      const response = await api.get(`/maintenance-requests?employeeId=${userId}`);
      setRequests(response.data);
    } catch (error) {
      console.error("Błąd ładowania zgłoszeń:", error);
      showNotification("error", "Nie udało się pobrać zgłoszeń napraw.");
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [userId]);

  return (
    <div className="page-body">
      <div className="container-xl">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="page-title m-0">Konserwator</h2>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/MaintenanceDashboard/Orders/NewRepair")}
          >
            Stwórz nowe zlecenie naprawy
          </button>
        </div>

        {requests.length === 0 ? (
          <div className="card">
            <div className="card-body">
              <p>Brak przypisanych zgłoszeń.</p>
            </div>
          </div>
        ) : (
          <>
            <RepairsCard task={requests[0]} />
            <div className="mt-4">
              <RepairTable tasks={requests} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MaintenanceDashboard;
