import React, { useEffect, useRef, useState } from "react";
import { api } from "../../services/api";
import { useUser } from "../../contexts/user";
import RepairsCard from "../../components/RepairsCard";
import RepairTable from "../../components/RepairTable";
import { useNotification } from "../../contexts/notification";
import { useNavigate } from "react-router";

const MaintenanceDashboard = () => {
  const { userId, userNotificationsEnabled } = useUser();
  const { showNotification } = useNotification();
  const [requests, setRequests] = useState([]);
  const navigate = useNavigate();
  const knownRequestIdsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await api.get("/maintenance-requests");
        const current = response.data;

        const newTasks = current.filter(
          (task) => !knownRequestIdsRef.current.has(task.id)
        );

        const assignedTasks = current.filter(
          (task) => task.assignee?.id === userId
        );

        setRequests(assignedTasks);

        if (
          knownRequestIdsRef.current.size > 0 &&
          Notification.permission === "granted" &&
          userNotificationsEnabled
        ) {
          // Notify about new tasks assigned to the current user
          const newAssignedTasks = newTasks.filter(
            (task) => task.assignee?.id === userId
          );

          if (newAssignedTasks.length > 0) {
            const firstNew = newAssignedTasks[0];
            const room = firstNew.room?.roomNumber ?? "Nieznany pokój";
            const description = firstNew.description ?? "Brak opisu";
            const statusMap = {
              PENDING: "Do wykonania",
              IN_PROGRESS: "W trakcie",
              COMPLETED: "Ukończono",
            };
            const status = statusMap[firstNew.status] ?? firstNew.status;
            const date = new Date(firstNew.requestDate).toLocaleDateString();

            const notif = new Notification("Nowe zlecenie naprawy", {
              body: `Pokój: ${room}\nOpis: ${description}\nStatus: ${status}\nData: ${date}`,
            });

            notif.onclick = () => {
              window.focus();
              window.location.href = "/MaintenanceDashboard";
            };
          }

          // Notify about new unassigned tasks
          const newUnassignedTasks = newTasks.filter(
            (task) => !task.assignee
          );

          if (newUnassignedTasks.length > 0) {
            const firstNew = newUnassignedTasks[0];
            const room = firstNew.room?.roomNumber ?? "Nieznany pokój";
            const description = firstNew.description ?? "Brak opisu";
            const statusMap = {
              PENDING: "Do wykonania",
              IN_PROGRESS: "W trakcie",
              COMPLETED: "Ukończono",
            };
            const status = statusMap[firstNew.status] ?? firstNew.status;
            const date = new Date(firstNew.requestDate).toLocaleDateString();

            const notif = new Notification("Nowe nieprzypisane zlecenie naprawy", {
              body: `Pokój: ${room}\nOpis: ${description}\nStatus: ${status}\nData: ${date}`,
            });

            notif.onclick = () => {
              window.focus();
              window.location.href = "/MaintenanceDashboard";
            };
          }
        }

        newTasks.forEach((task) => knownRequestIdsRef.current.add(task.id));
      } catch (error) {
        console.error("Błąd ładowania zgłoszeń:", error);
        showNotification("error", "Nie udało się pobrać zgłoszeń napraw.");
      }
    };

    fetchRequests();
    const interval = setInterval(fetchRequests, 10000); // co 10 sekund
    return () => clearInterval(interval);
  }, [userId]);

  return (
    <div className="page-body">
      <div className="container-xl">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="col">
            <div className="page-pretitle">Zgłoszenia napraw</div>
            <h1 className="page-title">Podsumowanie</h1>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => navigate("/MaintenanceDashboard/Orders/NewRepair")}
          >
            <i className="ti ti-plus fs-2 me-2"></i>
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
            {/* <RepairsCard task={requests} /> */}
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
