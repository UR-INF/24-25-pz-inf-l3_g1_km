import React, { useState } from 'react';

const AddCleaningRequestForm = () => {
  const [formData, setFormData] = useState({
    employeeId: '',
    roomId: '',
    requestDate: new Date().toISOString().split('T')[0], // Automatycznie ustawiona dzisiejsza data
    completionDate: '',
    status: 'pending',  // Domyślny status
    description: '',
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
    console.log('Form Data:', formData);
  };

  return (
    <div className="card-body">
      <h2 className="mb-4">Dodaj Nowe Zlecenie Sprzątania</h2>

      <form onSubmit={handleSubmit}>
        <h3 className="card-title">Szczegóły Zlecenia</h3>

        <div className="row g-3">
          <div className="col-md">
            <div className="form-label">Numer Pokoju</div>
            <input
              type="number"
              className="form-control"
              name="roomId"
              value={formData.roomId}
              onChange={handleChange}
            />
          </div>
        </div>

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

        <h3 className="card-title mt-4">Opis Zlecenia</h3>
        <div className="row g-3">
          <div className="col-md">
            <textarea
              className="form-control"
              name="description"
              value={formData.description}
              onChange={handleChange}
            ></textarea>
          </div>
        </div>

        <div className="card-footer bg-transparent mt-auto">
          <div className="btn-list justify-content-end">
            <a href="#" className="btn btn-1">Anuluj</a>
            <button type="submit" className="btn btn-primary btn-2">Zatwierdź</button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddCleaningRequestForm;
