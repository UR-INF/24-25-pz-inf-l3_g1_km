import React, { useEffect, useRef, useState } from "react";
import { api } from "../../services/api";
import { useUser } from "../../contexts/user";
import CleaningCard from "../../components/CleaningCard";
import CleaningTable from "../../components/CleaningTable";
import { useNotification } from "../../contexts/notification";
import { useNavigate } from "react-router";

const HousekeeperCleaningTasks = () => {
  const { userId } = useUser();
  const { showNotification } = useNotification();
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();
  const knownTaskIdsRef = useRef<Set<number>>(new Set());

  const fetchTasks = async () => {
    try {
      const response = await api.get(`/housekeeping-tasks?employeeId=${userId}`);
      const current = response.data;

      const newTasks = current.filter(
        (task) =>
          !knownTaskIdsRef.current.has(task.id) &&
          task.employee?.id === userId // tylko przypisane do aktualnego użytkownika
      );

      setTasks(current);

      // powiadomienie tylko jeśli mamy wcześniejsze dane i pojawiły się nowe
      if (
        knownTaskIdsRef.current.size > 0 &&
        newTasks.length > 0 &&
        Notification.permission === "granted"
      ) {
        const firstNew = newTasks[0];
        const room = firstNew.room?.roomNumber ?? "Nieznany pokój";
        const taskType = firstNew.cleaningType ?? "Brak typu";
        const date = new Date(firstNew.assignedAt ?? firstNew.createdAt).toLocaleDateString();

        const statusMap = {
          PENDING: "Do wykonania",
          IN_PROGRESS: "W trakcie",
          COMPLETED: "Ukończono",
        };
        const status = statusMap[firstNew.status] ?? firstNew.status;

        const notif = new Notification("Nowe zadanie sprzątania", {
          body: `Pokój: ${room}\nTyp: ${taskType}\nStatus: ${status}\nData: ${date}`,
        });

        notif.onclick = () => {
          window.focus();
          window.location.href = "/HousekeeperDashboard";
        };
      }

      newTasks.forEach((task) => knownTaskIdsRef.current.add(task.id));
    } catch (error) {
      console.error("Błąd ładowania zadań:", error);
      showNotification("error", "Nie udało się pobrać zadań sprzątania.");
    }
  };

  useEffect(() => {
    fetchTasks(); // pierwszy fetch
    const interval = setInterval(fetchTasks, 10000); // odświeżanie co 10s
    return () => clearInterval(interval);
  }, [userId]);

  return (
    <div className="page-body">
      <div className="container-xl">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="page-title m-0">Pokojówka</h2>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/HousekeeperDashboard/Orders/NewCleaningOrder")}
          >
            Stwórz nowe zlecenie sprzątania
          </button>
        </div>

        {tasks.length === 0 ? (
          <div className="card">
            <div className="card-body">
              <p>Brak przypisanych zadań.</p>
            </div>
          </div>
        ) : (
          <>
            <CleaningCard task={tasks[0]} />

            <div className="mt-4">
              <CleaningTable tasks={tasks} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HousekeeperCleaningTasks;
