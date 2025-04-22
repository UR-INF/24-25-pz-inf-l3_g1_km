import React, { useEffect, useState } from "react";
import { api } from "../../services/api";
import { useUser } from "../../contexts/user";
import CleaningCard from "../../components/CleaningCard";
import CleaningTable from "../../components/CleaningTable";
import AddCleaningTaskForm from "../../components/AddCleaningRequestForm";
import { useNotification } from "../../contexts/notification";

const HousekeeperCleaningTasks = () => {
  const { userId } = useUser();
  const { showNotification } = useNotification();
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const fetchTasks = async () => {
    try {
      const response = await api.get(`/housekeeping-tasks?employeeId=${userId}`);
      setTasks(response.data);
    } catch (error) {
      console.error("Błąd ładowania zadań:", error);
      showNotification("error", "Nie udało się pobrać zadań sprzątania.");
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [userId]);

  const handleToggleForm = () => setShowForm((prev) => !prev);

  const handleFormSubmitted = () => {
    setShowForm(false);
    fetchTasks();
  };

  return (
    <div className="page-body">
      <div className="container-xl">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="page-title m-0">Pokojówka</h2>
          <button className="btn btn-primary" onClick={handleToggleForm}>
            {showForm ? "Anuluj" : "Stwórz nowe zlecenie sprzątania"}
          </button>
        </div>

        {showForm ? (
          <AddCleaningTaskForm onSuccess={handleFormSubmitted} />
        ) : tasks.length === 0 ? (
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
