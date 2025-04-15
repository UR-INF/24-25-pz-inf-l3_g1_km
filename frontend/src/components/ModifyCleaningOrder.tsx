import React, { useState, useEffect } from "react";

const ModifyCleaningOrder = () => {
  const [formData, setFormData] = useState({
    employeeId: "",
    roomId: "",
    requestDate: new Date().toISOString().split("T")[0], // Automatycznie ustawiona dzisiejsza data
    completionDate: "",
    status: "pending",
    description: "",
  });

  const [isEditable, setIsEditable] = useState(false); // Zmienna kontrolująca tryb edycji

  // Symulacja pobierania danych o zleceniu sprzątania z API
  useEffect(() => {
    setFormData({
      employeeId: "123",
      roomId: "101",
      requestDate: "2023-03-01",
      completionDate: "2023-03-02",
      status: "pending",
      description: "Sprzątanie po remoncie",
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleEditClick = () => {
    setIsEditable(true); // Umożliwiamy edytowanie formularza
  };

  const handleSaveClick = (e) => {
    e.preventDefault();
    console.log("Updated Form Data:", formData);
    setIsEditable(false); // Po zapisaniu, formularz staje się tylko do odczytu
  };

  const handleCancelClick = () => {
    setIsEditable(false); // Anulowanie edycji przywraca stan formularza do pierwotnego
    // Resetowanie formularza do pierwotnych danych (opcjonalnie)
    setFormData({
      employeeId: "123",
      roomId: "101",
      requestDate: "2023-03-01",
      completionDate: "2023-03-02",
      status: "pending",
      description: "Sprzątanie po remoncie",
    });
  };

  return (
    <div className="card-body">
      <h2 className="mb-4">Szczegóły Zlecenia Sprzątania</h2>

      <form onSubmit={handleSaveClick}>
        <h3 className="card-title">Szczegóły Zlecenia Sprzątania</h3>

        {/* Numer Pokoju */}
        <div className="row g-3">
          <div className="col-md">
            <div className="form-label">Numer Pokoju</div>
            <input
              type="text"
              className="form-control"
              name="roomId"
              value={formData.roomId}
              onChange={handleChange}
              disabled={!isEditable}
            />
          </div>
        </div>

        {/* Data Zgłoszenia */}
        <h3 className="card-title mt-4">Data Zgłoszenia</h3>
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

        {/* Opis Zlecenia */}
        <h3 className="card-title mt-4">Opis Zlecenia</h3>
        <div className="row g-3">
          <div className="col-md">
            <textarea
              className="form-control"
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={!isEditable}
            ></textarea>
          </div>
        </div>

        {/* Data Zakończenia */}
        <h3 className="card-title mt-4">Data Zakończenia</h3>
        <div className="row g-3">
          <div className="col-md">
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

        {/* Status Zlecenia */}
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

        {/* Przyciski */}
        <div className="card-footer bg-transparent mt-auto">
          <div className="btn-list justify-content-end">
            <button type="button" className="btn btn-secondary" onClick={handleCancelClick}>
              Anuluj
            </button>
            {isEditable ? (
              <button type="submit" className="btn btn-primary btn-2">
                Zatwierdź
              </button>
            ) : (
              <button type="button" className="btn btn-primary btn-2" onClick={handleEditClick}>
                Edytuj
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default ModifyCleaningOrder;
