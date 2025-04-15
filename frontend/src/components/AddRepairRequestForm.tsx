import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const AddRepairRequestForm = () => {
  const [formData, setFormData] = useState({
    repairType: '',
    repairDescription: '',
    status: 'pending',
    responsiblePerson: '',
    requestDate: new Date().toISOString().split('T')[0],
  });

  const [rooms, setRooms] = useState([]);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const fetchRoomsAndEmployees = async () => {
      try {
        const [roomsResponse, employeesResponse] = await Promise.all([
          api.get("/rooms"),
          api.get("/employees"),
        ]);
        setRooms(roomsResponse.data);
        setEmployees(employeesResponse.data);
      } catch (error: any) {
        console.error("Błąd API:", error.response?.status, error.response?.data);
        alert("Nie udało się pobrać danych. Upewnij się, że jesteś zalogowany.");
      }
    };

    fetchRoomsAndEmployees();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const selectedRoom = rooms.find((room) => room.id.toString() === formData.repairType);
      const selectedEmployee = employees.find((emp) => emp.id.toString() === formData.responsiblePerson);

      if (!selectedRoom) {
        alert('Wybrany pokój nie istnieje.');
        return;
      }

      if (!selectedEmployee) {
        alert('Wybrany pracownik nie istnieje.');
        return;
      }

      const updatedRoom = { ...selectedRoom, status: 'OUT_OF_SERVICE' };
      await api.put(`/rooms/${selectedRoom.id}`, updatedRoom);

      const requestPayload = {
        employee: selectedEmployee,
        room: selectedRoom,
        requestDate: `${formData.requestDate}T${new Date().toTimeString().split(' ')[0]}`,
        completionDate: null,
        status: formData.status.toUpperCase(),
        description: formData.repairDescription,
      };

      const response = await api.post('/housekeeping-tasks', requestPayload);

      console.log('Zlecenie dodane:', response.data);
      alert('Zlecenie naprawy dodane pomyślnie! Pokój oznaczony jako niedostępny.');

      setFormData({
        repairType: '',
        repairDescription: '',
        status: 'pending',
        responsiblePerson: '',
        requestDate: new Date().toISOString().split('T')[0],
      });
    } catch (error: any) {
      console.error(error);
      alert('Wystąpił błąd podczas przetwarzania zgłoszenia.');
    }
  };

  return (
    <div className="card-body">
      <h2 className="mb-4">Dodaj nowe zlecenie naprawy</h2>

      <form onSubmit={handleSubmit}>
        <h3 className="card-title">Szczegóły Zlecenia</h3>

        <div className="row g-3">
          <div className="col-md">
            <div className="form-label">Pokój</div>
            <select
              className="form-control"
              name="repairType"
              value={formData.repairType}
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
            <div className="form-label">Opis Naprawy</div>
            <textarea
              className="form-control"
              name="repairDescription"
              value={formData.repairDescription}
              onChange={handleChange}
              required
            ></textarea>
          </div>
        </div>

        <div className="row g-3 mt-3">
          <div className="col-md">
            <div className="form-label">Osoba odpowiedzialna</div>
            <select
              className="form-control"
              name="responsiblePerson"
              value={formData.responsiblePerson}
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
            <a href="#" className="btn btn-1">Anuluj</a>
            <button type="submit" className="btn btn-primary btn-2">Zatwierdź</button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddRepairRequestForm;
