import React, { useState, useEffect } from "react";
import { api } from "../services/api";

const AddCleaningTaskForm = () => {
  const [formData, setFormData] = useState({
    roomId: "",
    employeeId: "",
    description: "",
    requestDate: new Date().toISOString().split("T")[0],
  });

  const [rooms, setRooms] = useState([]);
  const [employees, setEmployees] = useState([]);

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
        alert("Nie udało się pobrać danych. Upewnij się, że jesteś zalogowany.");
      }
    };

    fetchRoomsAndEmployees();
  }, []);

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

    const selectedRoom = rooms.find((room) => room.id.toString() === formData.roomId);
    const selectedEmployee = employees.find((emp) => emp.id.toString() === formData.employeeId);

    if (!selectedRoom || !selectedEmployee || !formData.description) {
      alert("Uzupełnij wszystkie wymagane pola.");
      return;
    }

    const payload = {
      employee: selectedEmployee,
      room: selectedRoom,
      requestDate: `${formData.requestDate}T${new Date().toTimeString().split(" ")[0]}`,
      completionDate: null,
      status: "PENDING",
      description: formData.description,
    };

    try {
      const response = await api.post("/housekeeping-tasks", payload);
      console.log("Zadanie sprzątania dodane:", response.data);
      alert("Zadanie sprzątania utworzone pomyślnie!");

      setFormData({
        roomId: "",
        employeeId: "",
        description: "",
        requestDate: new Date().toISOString().split("T")[0],
      });
    } catch (error: any) {
      console.error("Błąd tworzenia zadania:", error);
      alert("Wystąpił błąd podczas tworzenia zadania sprzątania.");
    }
  };

  return (
    <div className="card-body">
      <h2 className="mb-4">Dodaj nowe zadanie sprzątania</h2>

      <form onSubmit={handleSubmit}>
        <h3 className="card-title">Szczegóły zlecenia sprzątania</h3>

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
            <div className="form-label">Pracownik</div>
            <select
              className="form-control"
              name="employeeId"
              value={formData.employeeId}
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
            <div className="form-label">Opis zadania</div>
            <textarea
              className="form-control"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            ></textarea>
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

        <div className="card-footer bg-transparent mt-auto">
          <div className="btn-list justify-content-end">
            <a href="#" className="btn btn-1">
              Anuluj
            </a>
            <button type="submit" className="btn btn-primary btn-2">
              Zatwierdź
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddCleaningTaskForm;
