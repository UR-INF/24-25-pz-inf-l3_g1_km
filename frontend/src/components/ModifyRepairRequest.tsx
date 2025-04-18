import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { api } from "../services/api";

const ModifyRepairRequest = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isEditable, setIsEditable] = useState(false);
  const [formData, setFormData] = useState({
    repairType: "",
    repairDescription: "",
    status: "pending",
    responsiblePerson: "",
    requestDate: "",
  });

  const [originalData, setOriginalData] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const fetchRepair = async () => {
      try {
        const response = await api.get(`/maintenance-requests/${id}`);
        const task = response.data;

        const mappedForm = {
          repairType: task.room?.id?.toString() ?? "",
          repairDescription: task.description,
          status: task.status.toLowerCase(),
          responsiblePerson: task.assignee?.id?.toString() ?? "",
          requestDate: task.requestDate.split("T")[0],
        };

        setFormData(mappedForm);
        setOriginalData(mappedForm);
      } catch (err) {
        console.error("Błąd pobierania zgłoszenia:", err);
        alert("Nie udało się pobrać danych zgłoszenia.");
      }
    };

    if (id) fetchRepair();
  }, [id]);

  useEffect(() => {
    const fetchRoomsAndEmployees = async () => {
      try {
        const [roomsResponse, employeesResponse] = await Promise.all([
          api.get("/rooms"),
          api.get("/employees"),
        ]);
        setRooms(roomsResponse.data);
        setEmployees(employeesResponse.data);
      } catch (err) {
        console.error("Błąd ładowania pokoi lub pracowników:", err);
      }
    };

    fetchRoomsAndEmployees();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCancelClick = () => {
    if (originalData) {
      setFormData(originalData);
      setIsEditable(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsEditable(false);

    try {
      const room = { id: parseInt(formData.repairType) };
      const employee = { id: parseInt(formData.responsiblePerson) };

      await api.put(`/maintenance-requests/${id}`, {
        room,
        assignee: employee,
        requester: employee,
        requestDate: `${formData.requestDate}T00:00:00`,
        description: formData.repairDescription,
        status: formData.status.toUpperCase(),
        completionDate: null,
        serviceSummary: "",
      });

      alert("Zlecenie zostało zaktualizowane.");
      navigate("/RecepcionistDashboard/Orders/Repairs");
    } catch (err) {
      console.error("Błąd aktualizacji zgłoszenia:", err);
      alert("Nie udało się zapisać zmian.");
    }
  };

  return (
    <div className="card-body">
      <h2 className="mb-4">Modyfikuj zlecenie naprawy</h2>

      <form onSubmit={handleSubmit}>
        <h3 className="card-title">Szczegóły zgłoszenia</h3>

        <div className="row g-3">
          <div className="col-md">
            <div className="form-label">Pokój</div>
            <select
              className="form-control"
              name="repairType"
              value={formData.repairType}
              onChange={handleChange}
              disabled={!isEditable}
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
            <div className="form-label">Opis naprawy</div>
            <textarea
              className="form-control"
              name="repairDescription"
              value={formData.repairDescription}
              onChange={handleChange}
              disabled={!isEditable}
              required
            ></textarea>
          </div>
        </div>

        <div className="row g-3 mt-3">
          <div className="col-md">
            <div className="form-label">Pracownik</div>
            <select
              className="form-control"
              name="responsiblePerson"
              value={formData.responsiblePerson}
              onChange={handleChange}
              disabled={!isEditable}
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

          <div className="col-md">
            <div className="form-label">Data zgłoszenia</div>
            <input
              type="date"
              className="form-control"
              name="requestDate"
              value={formData.requestDate}
              onChange={handleChange}
              disabled
              required
            />
          </div>
        </div>

        <h3 className="card-title mt-4">Status</h3>
        <div className="form-check">
          <input
            type="radio"
            className="form-check-input"
            name="status"
            value="pending"
            checked={formData.status === "pending"}
            onChange={handleChange}
            disabled={!isEditable}
          />
          <label className="form-check-label">Oczekujące</label>
        </div>
        <div className="form-check">
          <input
            type="radio"
            className="form-check-input"
            name="status"
            value="in_progress"
            checked={formData.status === "in_progress"}
            onChange={handleChange}
            disabled={!isEditable}
          />
          <label className="form-check-label">W trakcie</label>
        </div>
        <div className="form-check">
          <input
            type="radio"
            className="form-check-input"
            name="status"
            value="completed"
            checked={formData.status === "completed"}
            onChange={handleChange}
            disabled={!isEditable}
          />
          <label className="form-check-label">Zakończone</label>
        </div>

        <div className="card-footer bg-transparent mt-auto">
          <div className="btn-list justify-content-end">
            {!isEditable ? (
              <button type="button" className="btn btn-secondary" onClick={() => setIsEditable(true)}>
                Edytuj
              </button>
            ) : (
              <>
                <button type="button" className="btn btn-secondary" onClick={handleCancelClick}>
                  Anuluj
                </button>
                <button type="submit" className="btn btn-primary btn-2">
                  Zatwierdź
                </button>
              </>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default ModifyRepairRequest;
