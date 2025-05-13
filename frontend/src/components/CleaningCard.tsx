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
        setActiveTasksCount(0);
      }
    };

    fetchActiveCleaningTasks();
  }, []);

  const formatZadaniaLabel = (count: number): string => {
    if (count === 1) return "1 zadanie w toku";
    if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) {
      return `${count} zadania w toku`;
    }
    return `${count} zadań w toku`;
  };

  return (
    <div className="col-sm-6 col-lg-3">
      <div className="card card-sm">
        <div className="card-body d-flex justify-content-between align-items-center">
          <div className="row align-items-center">
            <div className="col-auto">
              <span className="avatar bg-cyan-lt text-cyan">
                <i className="ti ti-trash fs-1" />
              </span>
            </div>
            <div className="col">
              <div className="font-weight-medium">
                {activeTasksCount !== null ? formatZadaniaLabel(activeTasksCount) : "..."}
              </div>
            </div>
            <div className="col-auto">
              <Link to="/RecepcionistDashboard/Orders/Cleaning" className="btn btn-sm btn-cyan">
                Zobacz
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CleaningCard;
