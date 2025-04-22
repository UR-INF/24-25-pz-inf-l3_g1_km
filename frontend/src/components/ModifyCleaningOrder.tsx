import React, { useState, useEffect } from "react";
import { useParams } from "react-router";
import { api } from "../services/api";
import { useNotification } from "../contexts/notification";

const ModifyCleaningOrder = () => {
  const { id } = useParams();
  const { showNotification } = useNotification();

  const [isEditable, setIsEditable] = useState(false);
  const [employees, setEmployees] = useState([]);

  const [formData, setFormData] = useState({
    employee: {},
    room: {},
    requestDate: "",
    completionDate: "",
    status: "PENDING",
    description: "",
  });
  const [originalData, setOriginalData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [taskRes, empRes] = await Promise.all([
          api.get(`/housekeeping-tasks/${id}`),
          api.get("/employees?roleName=HOUSEKEEPER"),
        ]);

        const task = taskRes.data;
        const mappedForm = {
          employee: task.employee,
          room: task.room,
          requestDate: task.requestDate?.split("T")[0] || "",
          completionDate: task.completionDate?.split("T")[0] || "",
          status: task.status,
          description: task.description,
        };

        setEmployees(empRes.data);
        setFormData(mappedForm);
        setOriginalData(mappedForm);
      } catch (error) {
        console.error("Błąd pobierania danych zadania:", error);
        showNotification("error", "Nie udało się pobrać szczegółów zadania.");
      }
    };

    if (id) fetchData();
  }, [id, showNotification]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "employeeId") {
      const selected = employees.find((emp) => emp.id.toString() === value);
      setFormData((prev) => ({ ...prev, employee: selected || {} }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCancelClick = () => {
    if (originalData) {
      setFormData(originalData);
      setIsEditable(false);
    }
  };

  const handleSaveClick = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        requestDate: `${formData.requestDate}T00:00:00`,
        completionDate: formData.completionDate ? `${formData.completionDate}T00:00:00` : null,
      };

      await api.put(`/housekeeping-tasks/${id}`, payload);

      showNotification("success", "Zlecenie zaktualizowane pomyślnie!");
      setOriginalData(formData);
      setIsEditable(false);
    } catch (error) {
      console.error("Błąd aktualizacji zadania:", error);
      showNotification("error", "Wystąpił błąd podczas zapisu zmian.");
    }
  };

  return (
    <div className="card-body">
      <h2 className="mb-4">Modyfikuj zlecenie sprzątania</h2>

      <form onSubmit={handleSaveClick}>
        <h3 className="card-title">Szczegóły zlecenia sprzątania</h3>

        <div className="row g-3">
          <div className="col-md">
            <div className="form-label">Numer pokoju</div>
            <input
              type="text"
              className="form-control"
              value={formData.room?.roomNumber ?? ""}
              disabled
            />
          </div>
          <div className="col-md">
            <div className="form-label">Pracownik</div>
            {!isEditable ? (
              <input
                type="text"
                className="form-control"
                value={
                  formData.employee?.firstName && formData.employee?.lastName
                    ? `${formData.employee.firstName} ${formData.employee.lastName}`
                    : ""
                }
                disabled
              />
            ) : (
              <select
                className="form-select"
                name="employeeId"
                value={formData.employee?.id || ""}
                onChange={handleChange}
              >
                <option value="">Wybierz pracownika</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} ({emp.email})
                  </option>
                ))}
              </select>
            )}
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
            />
          </div>
        </div>

        <div className="row g-3 mt-3">
          <div className="col-md">
            <label className="form-label">Opis</label>
            <textarea
              className="form-control"
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={!isEditable}
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="form-label">Status</label>
          {["PENDING", "IN_PROGRESS", "COMPLETED", "DECLINED"].map((status) => (
            <div className="form-check" key={status}>
              <input
                className="form-check-input"
                type="radio"
                name="status"
                value={status}
                checked={formData.status === status}
                onChange={handleChange}
                disabled={!isEditable}
              />
              <label className="form-check-label">{translateStatus(status)}</label>
            </div>
          ))}
        </div>

        <div className="card-footer bg-transparent mt-4">
          <div className="btn-list justify-content-end">
            {!isEditable ? (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsEditable(true)}
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

const translateStatus = (status) => {
  switch (status) {
    case "PENDING":
      return "Oczekujące";
    case "IN_PROGRESS":
      return "W trakcie";
    case "COMPLETED":
      return "Zakończone";
    case "DECLINED":
      return "Odrzucone (gość nie życzy sobie sprzątania)";
    default:
      return status;
  }
};

export default ModifyCleaningOrder;
