import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { useNotification } from "../contexts/notification";

const AddRepairRequestForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [formData, setFormData] = useState({
    roomId: "",
    description: "",
    assigneeId: "",
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
          api.get("/employees?roleName=MAINTENANCE"),
        ]);
        setRooms(roomsRes.data);
        setEmployees(employeesRes.data);
      } catch (error: any) {
        console.error("Błąd API:", error.response?.status, error.response?.data);
        showNotification("error", "Nie udało się pobrać danych.");
      }
    };

    fetchRoomsAndEmployees();
  }, [showNotification]);

  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedRoom = rooms.find((room) => room.id.toString() === formData.roomId);
    const selectedEmployee = employees.find((emp) => emp.id.toString() === formData.assigneeId);

    if (!selectedRoom || !selectedEmployee || !formData.description) {
      showNotification("error", "Uzupełnij wszystkie pola.");
      return;
    }

    try {
      const updatedRoom = { ...selectedRoom, status: "OUT_OF_SERVICE" };
      await api.put(`/rooms/${selectedRoom.id}`, updatedRoom);

      const payload = {
        room: selectedRoom,
        requester: selectedEmployee,
        assignee: selectedEmployee,
        requestDate: `${formData.requestDate}T${new Date().toTimeString().split(" ")[0]}`,
        completionDate: null,
        status: "PENDING",
        description: formData.description,
        serviceSummary: null,
      };

      await api.post("/maintenance-requests", payload);
      showNotification("success", "Zlecenie serwisowe dodane pomyślnie!");

      setFormData({
        roomId: "",
        description: "",
        assigneeId: "",
        requestDate: new Date().toISOString().split("T")[0],
      });

      onSuccess?.();
    } catch (error: any) {
      console.error("Błąd podczas dodawania zgłoszenia:", error);
      showNotification("error", "Wystąpił błąd podczas zapisu zgłoszenia.");
    }
  };

  return (
    <div className="card">
      <div className="card-body">
        <h2 className="mb-4">Dodaj nowe zlecenie naprawy</h2>

        <form onSubmit={handleSubmit}>
          <h3 className="card-title">Szczegóły zlecenia naprawy</h3>

          <div className="row g-3">
            <div className="col-md">
              <div className="form-label">Pokój</div>
              <select
                className="form-control"
                name="roomId"
                value={formData.roomId}
                onChange={handleChange}
                required
              >
                <option value="">Wybierz pokój</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.roomNumber} (Piętro: {room.floor})
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md">
              <div className="form-label">Pracownik odpowiedzialny</div>
              <select
                className="form-control"
                name="assigneeId"
                value={formData.assigneeId}
                onChange={handleChange}
                required
              >
                <option value="">Wybierz pracownika</option>
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
              <div className="form-label">Opis naprawy</div>
              <textarea
                className="form-control"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="row g-3 mt-3">
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

export default AddRepairRequestForm;
