import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { api } from "../services/api";

const CleaningCard = () => {
  const [taskCount, setTaskCount] = useState<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCleaningTasks = async () => {
      try {
        const response = await api.get("/housekeeping-tasks");
        const allTasks = response.data;

        // Filtrujemy otwarte zadania
        const openTasks = allTasks.filter(
          (task: any) => task.status === "PENDING" || task.status === "IN_PROGRESS"
        );
        setTaskCount(openTasks.length);
      } catch (error) {
        console.error("Błąd podczas pobierania zadań sprzątania:", error);
      }
    };

    fetchCleaningTasks();
  }, []);

  return (
    <div className="col-sm-6 col-lg-3">
      <div className="card">
        <div className="card-body">
          <div className="d-flex align-items-center">
            <div className="subheader">Otwarte zgłoszenia sprzątania</div>
          </div>
          <div className="h1 mb-3">{taskCount}</div>
          <div className="d-flex mb-2">
            <div>
              <button
                className="btn btn-primary"
                onClick={() => navigate("/RecepcionistDashboard/Orders/Cleaning")}
              >
                Zobacz
              </button>
            </div>
            <div className="ms-auto"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CleaningCard;
