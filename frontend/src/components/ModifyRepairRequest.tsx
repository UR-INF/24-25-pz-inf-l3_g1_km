import React, { useState } from "react";

const ModifyRepairRequest = () => {
  const [isEditable, setIsEditable] = useState(false); // Zmienna kontrolująca tryb edycji
  const [formData, setFormData] = useState({
    repairType: "appliance", // Typ naprawy
    repairDescription: "Naprawa urządzenia AGD.",
    status: "pending", // Status zlecenia
    responsiblePerson: "Jan Kowalski",
    requestDate: "2023-04-01", // Data zgłoszenia
  });

  // Opcje dostępnych typów napraw
  const repairTypes = [
    { id: "lightbulb", label: "Wymiana żarówki" },
    { id: "appliance", label: "Naprawa urządzeń" },
    { id: "plumbing", label: "Naprawa hydrauliczna" },
    { id: "other", label: "Inne" },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Updated Repair Request:", formData);
    setIsEditable(false); // Po zatwierdzeniu, zablokuj edytowanie
  };

  const handleEditClick = () => {
    setIsEditable(true); // Włącz tryb edycji
  };

  return (
    <div className="card-body">
      <h2 className="mb-4">Modyfikuj zlecenie naprawy</h2>

      <form onSubmit={handleSubmit}>
        <h3 className="card-title">Szczegóły zlecenia naprawy</h3>

        <div className="row g-3">
          <div className="col-md">
            <div className="form-label">Typ naprawy</div>
            <select
              className="form-control"
              name="repairType"
              value={formData.repairType}
              onChange={handleChange}
              disabled={!isEditable}
            >
              {repairTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
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
            ></textarea>
          </div>
        </div>

        <h3 className="card-title mt-4">Data zgłoszenia</h3>
        <div className="row g-3">
          <div className="col-md">
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
            value="in-progress"
            checked={formData.status === "in-progress"}
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
            <button type="button" className="btn btn-secondary" onClick={handleEditClick}>
              Edytuj
            </button>
            {isEditable && (
              <button type="submit" className="btn btn-primary btn-2">
                Zatwierdź
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default ModifyRepairRequest;
