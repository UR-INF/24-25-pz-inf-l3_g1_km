import { useState, useEffect } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router";
const AddReservationForm = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [bedFilter, setBedFilter] = useState("all");
  const [formData, setFormData] = useState({
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    status: "ACTIVE",
    specialRequests: "",
    modifiedAt: "",
    catering: false,
    guestFirstName: "",
    guestLastName: "",
    guestPesel: "",
    guestPhone: "",
    invoiceId: "",
    rooms: [],
    reservationRooms: [],
  });
  const [rooms, setRooms] = useState([]);
  const navigate = useNavigate();

  const handleClickNewReservation = () => {
    navigate("/RecepcionistDashboard/Reservations");
  };

  const getRooms = async () => {
    try {
      const response = await api.get("/rooms");
      const availableRooms = response.data.filter((room) => room.status === "AVAILABLE");
      setRooms(availableRooms);
    } catch (error) {
      console.error("Błąd podczas dodawania rezerwacji:", error);
    }
  };

  useEffect(() => {
    getRooms();
  }, []);

  // Filtrowanie pokoi na podstawie wyszukiwanego tekstu i liczby łóżek
  const filteredRooms = rooms.filter((room) => {
    const matchesSearch = room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBeds = bedFilter === "all" || room.bedCount === parseInt(bedFilter);
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

    if (name === "rooms") {
      const roomId = parseInt(value);
      const selectedRoom = rooms.find((room) => room.id === roomId);

      setFormData((prevData) => ({
        ...prevData,
        reservationRooms: checked
          ? [
              ...prevData.reservationRooms,
              {
                room: selectedRoom,
                guestCount: 1,
              },
            ]
          : prevData.reservationRooms.filter((room) => room.room.id !== roomId),
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addReservation();
  };

  const addReservation = async () => {
    try {
      const response = await api.post("/reservations", formData);
      console.log("Reservation added:", response.data);
      handleClickNewReservation();
    } catch (error) {
      console.error("Błąd podczas dodawania rezerwacji:", error);
    }
  };

  return (
    <div className="card-body">
      <h2 className="mb-4">Dodaj nową rezerwację</h2>

      <form onSubmit={handleSubmit}>
        <h3 className="card-title">Szczegóły rezerwacji</h3>
        <div className="row g-3">
          <div className="col-md">
            <div className="form-label">Data rozpoczęcia</div>
            <input
              type="date"
              className="form-control"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
              title="To pole jest wymagane"
            />
          </div>
          <div className="col-md">
            <div className="form-label">Data zakończenia</div>
            <input
              type="date"
              className="form-control"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
              title="To pole jest wymagane"
            />
          </div>
        </div>

        <h3 className="card-title mt-4">Informacje o rezerwującym</h3>
        <div className="row g-3">
          <div className="col-md">
            <div className="form-label">Imię</div>
            <input
              type="text"
              className="form-control"
              name="guestFirstName"
              value={formData.guestFirstName}
              onChange={handleChange}
              required
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
              required
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
              required
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
              required
            />
          </div>
        </div>

        <h3 className="card-title mt-4">Wybór pokoi</h3>

        <div className="form-group mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Wyszukaj pokój"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        <div className="form-group mb-3">
          <label className="form-label">Liczba łóżek</label>
          <select className="form-select" value={bedFilter} onChange={handleBedFilterChange}>
            <option value="all">Wszystkie</option>
            <option value="1">1 łóżko</option>
            <option value="2">2 łóżka</option>
            <option value="3">3 łóżka</option>
          </select>
        </div>

        <div style={{ maxHeight: "300px", overflowY: "auto" }}>
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
                  Pokój {room.roomNumber} - Piętro {room.floor}, {room.bedCount} łóżek
                </label>
              </div>
            ))
          ) : (
            <div>Brak pokoi spełniających kryteria wyszukiwania.</div>
          )}
        </div>

        <h3 className="card-title mt-4">Dodatkowe informacje</h3>
        <div className="row g-3">
          <div className="col-md">
            <div className="form-label">Specjalne życzenia</div>
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
            <span className="form-check-label">Dołącz catering dla gości hotelowych</span>
          </label>
        </div>

        <h3 className="card-title mt-4">Status</h3>
        <div className="form-check">
          <input
            type="radio"
            className="form-check-input"
            name="status"
            value="ACTIVE"
            checked={formData.status === "ACTIVE"}
            onChange={handleChange}
          />
          <label className="form-check-label">Aktywna</label>
        </div>
        <div className="form-check">
          <input
            type="radio"
            className="form-check-input"
            name="status"
            value="CANCELLED"
            checked={formData.status === "CANCELLED"}
            onChange={handleChange}
          />
          <label className="form-check-label">Anulowana</label>
        </div>
        <div className="form-check">
          <input
            type="radio"
            className="form-check-input"
            name="status"
            value="COMPLETED"
            checked={formData.status === "COMPLETED"}
            onChange={handleChange}
          />
          <label className="form-check-label">Zakończona</label>
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

export default AddReservationForm;
