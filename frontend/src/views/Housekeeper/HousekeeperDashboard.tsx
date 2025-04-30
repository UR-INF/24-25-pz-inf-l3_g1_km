import { useEffect, useRef, useState } from "react";
import { api } from "../../services/api";
import { useUser } from "../../contexts/user";
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

      const newAssignedTasks = current.filter(
        (task) => !knownTaskIdsRef.current.has(task.id) && task.employee?.id === userId,
      );

      const newUnassignedTasks = current.filter(
        (task) => !knownTaskIdsRef.current.has(task.id) && !task.employee,
      );

      setTasks(current);

      if (Notification.permission === "granted") {
        if (knownTaskIdsRef.current.size > 0 && newAssignedTasks.length > 0) {
          const firstNew = newAssignedTasks[0];
          const room = firstNew.room?.roomNumber;
          const date = new Date(firstNew.requestDate).toLocaleDateString();
          const description = firstNew.description ?? "Brak opisu";

          const statusMap = {
            PENDING: "Do wykonania",
            IN_PROGRESS: "W trakcie",
            COMPLETED: "Ukończono",
          };
          const status = statusMap[firstNew.status] ?? firstNew.status;

          const bodyLines = [
            room ? `📍 Pokój: ${room}` : null,
            `📅 Data: ${date}`,
            `📌 Status: ${status}`,
            `📝 ${description}`,
          ]
            .filter(Boolean)
            .join("\n");

          const notif = new Notification("🧽 Nowe zadanie sprzątania", {
            body: bodyLines,
          });

          notif.onclick = () => {
            window.electronAPI?.focusWindow();
          };
        }

        if (knownTaskIdsRef.current.size > 0 && newUnassignedTasks.length > 0) {
          const firstUnassigned = newUnassignedTasks[0];
          const room = firstUnassigned.room?.roomNumber;
          const date = new Date(firstUnassigned.requestDate).toLocaleDateString();
          const description = firstUnassigned.description ?? "Brak opisu";

          const bodyLines = [
            room ? `📍 Pokój: ${room}` : null,
            `📅 Data zgłoszenia: ${date}`,
            `📝 ${description}`,
          ]
            .filter(Boolean)
            .join("\n");

          const notif = new Notification("🧼 Nowe nieprzypisane zadanie sprzątania", {
            body: bodyLines,
          });

          notif.onclick = () => {
            window.electronAPI?.focusWindow();
          };
        }
      }

      [...newAssignedTasks, ...newUnassignedTasks].forEach((task) =>
        knownTaskIdsRef.current.add(task.id),
      );
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
          <div className="col">
            <div className="page-pretitle">Zgłoszenia sprzątania</div>
            <h1 className="page-title">Podsumowanie</h1>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/HousekeeperDashboard/Orders/NewCleaningOrder")}
          >
            <i className="ti ti-plus fs-2 me-2"></i>
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
            {/* <CleaningCard task={tasks[0]} /> */}

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
