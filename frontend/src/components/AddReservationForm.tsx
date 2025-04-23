import { useState, useEffect } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router";
const AddReservationForm = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [bedFilter, setBedFilter] = useState("all");
  const [formData, setFormData] = useState({
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    status: "UPCOMING",
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
  const [roomGuests, setRoomGuests] = useState({});
  const [kwota, setKwota] = useState(0);

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
      setRoomGuests((prevGuests) => ({
        ...prevGuests,
        [roomId]: checked ? 1 : undefined, // domyślnie 1 osoba, jeśli pokój jest zaznaczony
      }));
    } else {
      let newValue = type === "checkbox" ? checked : value;

      if (name === "counterPolple") {
        newValue = Math.max(1, parseInt(value) || 1);
      }

      setFormData((prevData) => ({
        ...prevData,
        [name]: newValue,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errorMessage = validateForm();
    if (errorMessage) {
      alert(errorMessage);
      return;
    }

    await addReservation();
  };

  const validateForm = () => {
    const today = new Date().toISOString().split("T")[0];
    const { startDate, endDate, guestPesel, guestPhone } = formData;

    if (startDate < today) {
      return "Data rozpoczęcia nie może być wcześniejsza niż dzisiaj.";
    }

    if (endDate && endDate < startDate) {
      return "Data zakończenia nie może być wcześniejsza niż data rozpoczęcia.";
    }

    if (!/^\d{11}$/.test(guestPesel)) {
      return "PESEL musi zawierać dokładnie 11 cyfr.";
    }

    if (!/^\d{9}$/.test(guestPhone)) {
      return "Numer telefonu musi zawierać dokładnie 9 cyfr.";
    }

    return null;
  };


  const addReservation = async () => {
    try {
      const response = await api.post("/reservations", formData);
      console.log("Reservation added:", response.data);
      handleClickNewReservation();
    } catch (error) {
      console.log(formData)
      console.error("Błąd podczas dodawania rezerwacji:", error);
    }
  };

  const handleGuestCountChange = (roomId, e) => {
    const { value } = e.target;
    const newGuestCount = Math.max(1, Math.min(value, rooms.find((room) => room.id === roomId).bedCount)); // 

    setRoomGuests((prevGuests) => ({
      ...prevGuests,
      [roomId]: newGuestCount,
    }));

    setFormData((prevData) => ({
      ...prevData,
      reservationRooms: prevData.reservationRooms.map((room) =>
        room.room.id === roomId
          ? { ...room, guestCount: newGuestCount }
          : room
      ),
    }));
  };
  
  useEffect(() => {
    calculateTotalPrice();
  }, [formData.startDate, formData.endDate, formData.reservationRooms]);

  const calculateTotalPrice = () => {
    const { startDate, endDate, reservationRooms } = formData;
    if (!startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));

    let total = 0;
    reservationRooms.forEach(({ room, guestCount }) => {
      const { bedCount, pricePerNight } = room;
      const roomPrice = ((guestCount / bedCount) * pricePerNight) * days;
      total += roomPrice;
    });

    setKwota(total.toFixed(2));
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

        {/* <div className="form-group mb-3">
            <div className="form-label">Ilość osób</div>
            <input
              type="number"
              className="form-control"
              name="counterPolple"
              value={formData.counterPolple}
              onChange={handleChange}
              min={1}
              required
            />
          </div> */}

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
                {roomGuests[room.id] !== undefined && (
                  <div>
                    <label>Liczba osób w pokoju:</label>
                    <input
                      type="number"
                      className="form-control"
                      style={{ maxWidth: "150px" }}
                      value={roomGuests[room.id]}
                      onChange={(e) => handleGuestCountChange(room.id, e)}
                      min={1}
                      max={room.bedCount}
                    />
                  </div>
                )}
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
          {/* <div className="col-md">
            <div className="form-label">ID Faktury (Opcjonalne)</div>
            <input
              type="text"
              className="form-control"
              name="invoiceId"
              value={formData.invoiceId}
              onChange={handleChange}
            />
          </div> */}
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
            value="UPCOMING"
            checked={formData.status === "UPCOMING"}
            onChange={handleChange}
          />
          <label className="form-check-label">Nadchodząca</label>
        </div>
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
        <h3 className="card-title mt-4">Do zapłaty</h3>
        <h3 className="card-title mt-4">{kwota} PLN</h3>
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
