import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { useNotification } from "../contexts/notification";

const AddCleaningTaskForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [formData, setFormData] = useState({
    roomId: "",
    employeeId: "",
    description: "",
    requestDate: new Date().toISOString().split("T")[0],
  });

  const [rooms, setRooms] = useState([]);
  const [employees, setEmployees] = useState([]);
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchRoomsAndEmployees = async () => {
      try {
        const [roomsRes, employeesRes] = await Promise.all([
          api.get("/rooms"),
          api.get("/employees?roleName=HOUSEKEEPER"),
        ]);
        setRooms(roomsRes.data);
        setEmployees(employeesRes.data);
      } catch (error: any) {
        console.error("Błąd API:", error.response?.status, error.response?.data);
        showNotification(
          "error",
          "Nie udało się pobrać danych. Upewnij się, że jesteś zalogowany.",
        );
      }
    };

    fetchRoomsAndEmployees();
  }, [showNotification]);

  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description) {
      showNotification("error", "Opis zadania jest wymagany.");
      return;
    }

    const payload = {
      employee: formData.employeeId
        ? employees.find((emp) => emp.id.toString() === formData.employeeId)
        : null,
      room: formData.roomId ? rooms.find((room) => room.id.toString() === formData.roomId) : null,
      requestDate: `${formData.requestDate}T${new Date().toTimeString().split(" ")[0]}`,
      completionDate: null,
      status: "PENDING",
      description: formData.description,
    };

    try {
      const response = await api.post("/housekeeping-tasks", payload);
      console.log("Zadanie sprzątania dodane:", response.data);
      showNotification("success", "Zadanie sprzątania utworzone pomyślnie!");

      setFormData({
        roomId: "",
        employeeId: "",
        description: "",
        requestDate: new Date().toISOString().split("T")[0],
      });

      onSuccess?.();
    } catch (error: any) {
      console.error("Błąd tworzenia zadania:", error);
      showNotification("error", "Wystąpił błąd podczas tworzenia zadania sprzątania.");
    }
  };

  return (
    <div className="card">
      <div className="card-body">
        <h2 className="mb-4">Dodaj nowe zadanie sprzątania</h2>

        <form onSubmit={handleSubmit}>
          <h3 className="card-title">Szczegóły zlecenia sprzątania</h3>

          <div className="row g-3">
            <div className="col-md">
              <div className="form-label">Pokój (opcjonalne)</div>
              <select
                className="form-select"
                name="roomId"
                value={formData.roomId}
                onChange={handleChange}
              >
                <option value="">Brak</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.roomNumber} (Piętro: {room.floor})
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md">
              <div className="form-label">Pracownik (opcjonalne)</div>
              <select
                className="form-select"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
              >
                <option value="">Brak</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} ({emp.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="row g-3 mt-3">
            <div className="col-md">
              <div className="form-label">Opis zadania</div>
              <textarea
                className="form-control"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              ></textarea>
              <div style={{ minHeight: "1.5em" }}>
                {formData.roomId === "" && (
                  <small className="form-text text-muted">
                    Nie wybrano pokoju, określ miejsce, w którym ma zostać wykonane zlecenie.
                  </small>
                )}
              </div>
            </div>
          </div>

          <div className="row g-3 mt-2">
            <div className="col-md">
              <div className="form-label">Data zgłoszenia</div>
              <input
                type="date"
                className="form-control"
                name="requestDate"
                value={formData.requestDate}
                onChange={handleChange}
                disabled
              />
            </div>
          </div>

          <div className="row g-3 mt-4">
            <div className="col-md d-flex justify-content-end">
              <button type="submit" className="btn btn-primary btn-2">
                Zatwierdź
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCleaningTaskForm;
