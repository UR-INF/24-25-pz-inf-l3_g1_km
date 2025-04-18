import { useEffect, useState } from "react";
import { Link } from "react-router";
import { api } from "../services/api";

const CleaningCard = () => {
  const [activeTasksCount, setActiveTasksCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchActiveCleaningTasks = async () => {
      try {
        const response = await api.get("/housekeeping-tasks");

        const notCompletedTasks = response.data.filter(
          (task: any) => task.status !== "COMPLETED" && task.status !== "DECLINED",
        );

        setActiveTasksCount(notCompletedTasks.length);
      } catch (error: any) {
        console.error("Błąd podczas pobierania zadań sprzątania:", error);
        setActiveTasksCount(0); // fallback
      }
    };

    fetchActiveCleaningTasks();
  }, []);

  return (
    <div className="col-sm-6 col-lg-3">
      <div className="card">
        <div className="card-body">
          <div className="d-flex align-items-center">
            <div className="subheader">Otwarte zgłoszenia sprzątania</div>
          </div>
          <div className="h1 mb-3">{activeTasksCount !== null ? activeTasksCount : "..."}</div>
          <div className="d-flex mb-2">
            <div>
              <Link to="/RecepcionistDashboard/Orders/Cleaning" className="btn btn-primary">
                Zobacz
              </Link>
            </div>
            <div className="ms-auto"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CleaningCard;
