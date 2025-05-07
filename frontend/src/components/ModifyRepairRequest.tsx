import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { api } from "../services/api";
import { useNotification } from "../contexts/notification";
import { getRoleNameInPolish } from "../utils/roleUtils";
import { useUser } from "../contexts/user";

const ModifyRepairRequest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { user } = useUser();

  const [isEditable, setIsEditable] = useState(false);
  const [formData, setFormData] = useState({
    repairType: "",
    repairDescription: "",
    status: "pending",
    responsiblePerson: "",
    requestDate: "",
    completionDate: "",
    serviceSummary: "",
    requesterFirstName: "",
    requesterLastName: "",
    requesterAvatar: "",
    requesterRoleName: "",
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
          completionDate: task.completionDate?.split("T")[0] || "",
          serviceSummary: task.serviceSummary || "",
          requesterFirstName: task.requester?.firstName || "",
          requesterLastName: task.requester?.lastName || "",
          requesterAvatar: task.requester?.avatarUrl || "",
          requesterRoleName: getRoleNameInPolish(task.requester?.role.name) || "",
        };

        setFormData(mappedForm);
        setOriginalData(mappedForm);
      } catch (err) {
        console.error("Błąd pobierania zgłoszenia:", err);
        showNotification("error", "Nie udało się pobrać danych zgłoszenia.");
      }
    };

    if (id) fetchRepair();
  }, [id, showNotification]);

  useEffect(() => {
    const fetchRoomsAndEmployees = async () => {
      try {
        const [roomsResponse, employeesResponse] = await Promise.all([
          api.get("/rooms"),
          api.get("/employees?roleName=MAINTENANCE"),
        ]);
        setRooms(roomsResponse.data);
        setEmployees(employeesResponse.data);
      } catch (err) {
        console.error("Błąd ładowania pokoi lub pracowników:", err);
        showNotification("error", "Nie udało się załadować danych pomocniczych.");
      }
    };

    fetchRoomsAndEmployees();
  }, [showNotification]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData((prevData) => {
      const updated = {
        ...prevData,
        [name]: newValue,
      };

      if (name === "status" && newValue === "completed" && !prevData.completionDate) {
        const today = new Date().toISOString().split("T")[0];
        updated.completionDate = today;
      }

      return updated;
    });
  };

  const handleCancelClick = () => {
    if (originalData) {
      setFormData(originalData);
      setIsEditable(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Sprawdzenie, czy mamy dane zalogowanego użytkownika jako requester
      if (!user) {
        showNotification("error", "Brak danych zalogowanego użytkownika.");
        return;
      }

      const payload = {
        room: formData.repairType
          ? rooms.find((room) => room.id.toString() === formData.repairType)
          : null,
        assignee: formData.responsiblePerson
          ? employees.find((emp) => emp.id.toString() === formData.responsiblePerson)
          : null,
        requester: user, // Ustawiamy zalogowanego użytkownika jako requester
        requestDate: `${formData.requestDate}T00:00:00`,
        completionDate: formData.completionDate ? `${formData.completionDate}T00:00:00` : null,
        description: formData.repairDescription,
        status: formData.status.toUpperCase(),
        serviceSummary: formData.serviceSummary,
      };

      await api.put(`/maintenance-requests/${id}`, payload);
      showNotification("success", "Zgłoszenie zostało zaktualizowane.");
      navigate("/RecepcionistDashboard/Orders/Repairs");
    } catch (err) {
      console.error("Błąd aktualizacji zgłoszenia:", err);
      showNotification("error", "Nie udało się zapisać zmian.");
    }
  };

  return (
    <div className="card-body">
      <h2 className="mb-4">Modyfikuj zlecenie naprawy</h2>

      <form onSubmit={handleSubmit}>
        <h3 className="card-title">Szczegóły zgłoszenia</h3>

        <div className="row">
          <div className="col-md">
            <label className="form-label">Zgłaszający </label>
            <div className="col-auto d-flex flex-row gap-2 align-items-center">
              <img
                src={formData.requesterAvatar}
                alt="Zdjęcie profilowe"
                className="avatar shadow avatar-lg rounded"
              />

              <div>
                <h4 className="m-0">
                  {formData.requesterFirstName} {formData.requesterLastName}
                </h4>
                <div className="text-secondary">{formData.requesterRoleName}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-3 mt-3">
          <div className="col-md">
            <label className="form-label">Pokój (opcjonalne)</label>
            <select
              className="form-select"
              name="repairType"
              value={formData.repairType}
              onChange={handleChange}
              disabled={!isEditable}
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
            <label className="form-label">Pracownik (opcjonalne)</label>
            <select
              className="form-select"
              name="responsiblePerson"
              value={formData.responsiblePerson}
              onChange={handleChange}
              disabled={!isEditable}
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
            <label className="form-label">Data zgłoszenia</label>
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

          <div className="col-md">
            <label className="form-label">Data zakończenia</label>
            <input
              type="date"
              className="form-control"
              name="completionDate"
              value={formData.completionDate}
              onChange={handleChange}
              disabled={!isEditable}
              min={formData.requestDate}
            />
          </div>
        </div>

        <div className="row g-3 mt-3">
          <div className="col-md">
            <label className="form-label">Opis naprawy</label>
            <textarea
              className="form-control"
              name="repairDescription"
              value={formData.repairDescription}
              onChange={handleChange}
              disabled={!isEditable}
              required
            />
            <div style={{ minHeight: "1.5em" }}>
              {formData.repairType === "" && (
                <small className="form-text text-warning">
                  Nie wybrano pokoju. W opisie zlecenia należy określić miejsce, w którym ma zostać
                  wykonane zlecenie.
                </small>
              )}
            </div>
          </div>
        </div>

        <div className="row g-3 mt-3">
          <div className="col-md">
            <label className="form-label">Podsumowanie serwisu</label>
            <textarea
              className="form-control"
              name="serviceSummary"
              value={formData.serviceSummary}
              onChange={handleChange}
              disabled={!isEditable || formData.status !== "completed"}
              placeholder={
                formData.status !== "completed"
                  ? "Zadanie musi być zakończone"
                  : "Opisz co zostało zrobione w ramach serwisu"
              }
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="form-label">Status</label>
          {["pending", "in_progress", "completed"].map((status) => (
            <div className="form-check" key={status}>
              <input
                className="form-check-input"
                type="radio"
                name="status"
                id={status}
                value={status}
                checked={formData.status === status}
                onChange={handleChange}
                disabled={!isEditable}
              />
              <label className="form-check-label" htmlFor={status}>
                {translateStatus(status)}
              </label>
            </div>
          ))}
        </div>

        <div className="card-footer bg-transparent mt-4">
          <div className="btn-list justify-content-end">
            {!isEditable ? (
              <button
                type="button"
                className="btn btn-warning"
                onClick={() => {
                  setIsEditable(true);
                  showNotification(
                    "info",
                    "Dane zgłoszenia zostały odblokowane - możesz je teraz edytować.",
                    5000,
                  );
                }}
              >
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

const translateStatus = (status: string) => {
  switch (status) {
    case "pending":
      return "Oczekujące";
    case "in_progress":
      return "W trakcie";
    case "completed":
      return "Zakończone";
    default:
      return status;
  }
};

export default ModifyRepairRequest;
