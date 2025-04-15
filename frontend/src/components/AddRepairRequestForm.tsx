import React, { useState } from "react";

const AddRepairRequestForm = () => {
  const [formData, setFormData] = useState({
    repairType: "",
    repairDescription: "",
    status: "pending", // Domyślny status
    responsiblePerson: "",
    requestDate: new Date().toISOString().split("T")[0], // Automatycznie ustawiona dzisiejsza data
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Można tutaj dodać logikę do wysyłania danych na backend
    console.log("Form Data:", formData);
  };

  return (
    <div className="card-body">
      <h2 className="mb-4">Dodaj nowe zlecenie naprawy</h2>

      <form onSubmit={handleSubmit}>
        <h3 className="card-title">Szczegóły Zlecenia</h3>

        <div className="row g-3">
          <div className="col-md">
            <div className="form-label">Typ Naprawy</div>
            <select
              className="form-control"
              name="repairType"
              value={formData.repairType}
              onChange={handleChange}
            >
              <option value="">Wybierz typ naprawy</option>
              <option value="lightbulb">Wymiana żarówki</option>
              <option value="appliance">Naprawa urządzeń</option>
              <option value="plumbing">Naprawa hydrauliczna</option>
              <option value="other">Inne</option>
            </select>
          </div>
          <div className="col-md">
            <div className="form-label">Opis Naprawy</div>
            <textarea
              className="form-control"
              name="repairDescription"
              value={formData.repairDescription}
              onChange={handleChange}
            ></textarea>
          </div>
        </div>

        <h3 className="card-title mt-4">Data Zgłoszenia</h3>
        <div className="row g-3">
          <div className="col-md">
            <div className="form-label">Data Zgłoszenia</div>
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

export default AddRepairRequestForm;
