import React, { useState } from 'react';

const AddReservationForm = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [bedFilter, setBedFilter] = useState('all');  // Filtr po liczbie łóżek
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    status: 'active',
    specialRequests: '',
    modifiedAt: '',
    catering: false,
    guestFirstName: '',
    guestLastName: '',
    guestPesel: '',
    guestPhone: '',
    invoiceId: '',
    rooms: [],
  });

  const rooms = [
    { id: 1, name: 'Pokój 101', floor: 1, beds: 2 },
    { id: 2, name: 'Pokój 102', floor: 1, beds: 1 },
    { id: 3, name: 'Pokój 103', floor: 2, beds: 3 },
    { id: 4, name: 'Pokój 104', floor: 2, beds: 2 },
    { id: 5, name: 'Pokój 105', floor: 3, beds: 1 },
  ];

  // Filtrowanie pokoi na podstawie wyszukiwanego tekstu i liczby łóżek
  const filteredRooms = rooms.filter((room) => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBeds = bedFilter === 'all' || room.beds === parseInt(bedFilter);
    return matchesSearch && matchesBeds;
  });

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleBedFilterChange = (e) => {
    setBedFilter(e.target.value);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Data:', formData);
  };

  return (
    <div className="card-body">
      <h2 className="mb-4">Dodaj Nową Rezerwację</h2>

      <form onSubmit={handleSubmit}>
        <h3 className="card-title">Szczegóły Rezerwacji</h3>
        <div className="row g-3">
          <div className="col-md">
            <div className="form-label">Data Rozpoczęcia</div>
            <input
              type="date"
              className="form-control"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
            />
          </div>
          <div className="col-md">
            <div className="form-label">Data Zakończenia</div>
            <input
              type="date"
              className="form-control"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
            />
          </div>
        </div>

        <h3 className="card-title mt-4">Informacje o Gościu</h3>
        <div className="row g-3">
          <div className="col-md">
            <div className="form-label">Imię</div>
            <input
              type="text"
              className="form-control"
              name="guestFirstName"
              value={formData.guestFirstName}
              onChange={handleChange}
            />
          </div>
          <div className="col-md">
            <div className="form-label">Nazwisko</div>
            <input
              type="text"
              className="form-control"
              name="guestLastName"
              value={formData.guestLastName}
              onChange={handleChange}
            />
          </div>
          <div className="col-md">
            <div className="form-label">PESEL</div>
            <input
              type="text"
              className="form-control"
              name="guestPesel"
              value={formData.guestPesel}
              onChange={handleChange}
            />
          </div>
          <div className="col-md">
            <div className="form-label">Telefon</div>
            <input
              type="text"
              className="form-control"
              name="guestPhone"
              value={formData.guestPhone}
              onChange={handleChange}
            />
          </div>
        </div>

        <h3 className="card-title mt-4">Wybór Pokoi</h3>
        
        {/* Search bar */}
        <div className="form-group mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Wyszukaj pokój"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        {/* Bed Filter Dropdown */}
        <div className="form-group mb-3">
          <label className="form-label">Liczba Łóżek</label>
          <select
            className="form-control"
            value={bedFilter}
            onChange={handleBedFilterChange}
          >
            <option value="all">Wszystkie</option>
            <option value="1">1 Łóżko</option>
            <option value="2">2 Łóżka</option>
            <option value="3">3 Łóżka</option>
          </select>
        </div>

        {/* Scrollable room list */}
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {filteredRooms.length > 0 ? (
            filteredRooms.map((room) => (
              <div key={room.id} className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id={`room${room.id}`}
                  name="rooms"
                  value={room.id}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor={`room${room.id}`}>
                  {room.name} - Piętro {room.floor}, {room.beds} łóżek
                </label>
              </div>
            ))
          ) : (
            <div>Brak pokoi spełniających kryteria wyszukiwania.</div>
          )}
        </div>

        <h3 className="card-title mt-4">Dodatkowe Informacje</h3>
        <div className="row g-3">
          <div className="col-md">
            <div className="form-label">Specjalne Życzenia</div>
            <textarea
              className="form-control"
              name="specialRequests"
              value={formData.specialRequests}
              onChange={handleChange}
            ></textarea>
          </div>
          <div className="col-md">
            <div className="form-label">ID Faktury (Opcjonalne)</div>
            <input
              type="text"
              className="form-control"
              name="invoiceId"
              value={formData.invoiceId}
              onChange={handleChange}
            />
          </div>
        </div>

        <h3 className="card-title mt-4">Catering</h3>
        <div>
          <label className="form-check form-switch">
            <input
              type="checkbox"
              className="form-check-input"
              name="catering"
              checked={formData.catering}
              onChange={handleChange}
            />
            <span className="form-check-label">Dołącz Catering</span>
          </label>
        </div>

        <h3 className="card-title mt-4">Status</h3>
        <div className="form-check">
          <input
            type="radio"
            className="form-check-input"
            name="status"
            value="active"
            checked={formData.status === 'active'}
            onChange={handleChange}
          />
          <label className="form-check-label">Aktywna</label>
        </div>
        <div className="form-check">
          <input
            type="radio"
            className="form-check-input"
            name="status"
            value="cancelled"
            checked={formData.status === 'cancelled'}
            onChange={handleChange}
          />
          <label className="form-check-label">Anulowana</label>
        </div>
        <div className="form-check">
          <input
            type="radio"
            className="form-check-input"
            name="status"
            value="completed"
            checked={formData.status === 'completed'}
            onChange={handleChange}
          />
          <label className="form-check-label">Zakończona</label>
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

export default AddReservationForm;
