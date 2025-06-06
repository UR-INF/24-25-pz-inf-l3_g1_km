// @ts-nocheck

import { useState, useEffect } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router";
import { useNotification } from "../contexts/notification";
import ShowInvoiceButton from "./ShowInvoiceButton";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
const ModifyReservation = ({ reservationId }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [bedFilter, setBedFilter] = useState("all");
  const [isEditable, setIsEditable] = useState(false);
  const [showDeleteInvoiceModal, setShowDeleteInvoiceModal] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [reservationRoomAssignments, setReservationRoomAssignments] = useState([]);
  const [invoiceData, setInvoiceData] = useState(null);
  const [roomGuests, setRoomGuests] = useState({});
  const [kwota, setKwota] = useState(0);
  const navigate = useNavigate();
  const [originalKwota, setOriginalKwota] = useState(0);
  const { showNotification } = useNotification();
  const [shouldAddCleaningTask, setShouldAddCleaningTask] = useState(true);
  const [formData, setFormData] = useState({
    startDate: "2023-03-01",
    endDate: "2023-03-07",
    guestFirstName: "Jan",
    guestLastName: "Kowalski",
    guestPesel: "12345678901",
    guestPhone: "123-456-789",
    rooms: ["Pokój 101", "Pokój 102"],
    reservationRooms: [],
    specialRequests: "Brak",
    invoiceId: "",
    catering: true,
    status: "ACTIVE",
  });

  const getReservation = async () => {
    try {
      const response = await api.get(`/reservations/${reservationId}`);
      const data = response.data;

      setFormData({
        startDate: data.startDate || "",
        endDate: data.endDate || "",
        guestFirstName: data.guestFirstName || "",
        guestLastName: data.guestLastName || "",
        guestPesel: data.guestPesel || "",
        guestPhone: data.guestPhone || "",
        rooms: data.reservationRooms?.map((rr) => rr.room.roomNumber) || [],
        reservationRooms: data.reservationRooms || [],
        specialRequests: data.specialRequests || "",
        invoiceId: data.invoiceId || "",
        catering: data.catering ?? false,
        status: data.status || "",
      });
      getRooms(
        data.reservationRooms?.map((rr) => rr.room.id),
        {
          startDate: data.startDate,
          endDate: data.endDate,
        },
      );
    } catch (error) {
      console.error("Błąd podczas pobierania rezerwacji:", error);
    }
  };

  const getRooms = async (idRoom, formData) => {
    try {
      const response = await api.get("/rooms");
      let availableRooms = response.data.filter((room) => idRoom.includes(room.id));

      if (formData.startDate && formData.endDate) {
        const dateResponse = await api.get(
          `/rooms/rooms/available?from=${formData.startDate}&to=${formData.endDate}`,
        );
        const dateAvailableRooms = dateResponse.data;

        availableRooms = [...availableRooms, ...dateAvailableRooms];
      }
      setRooms(availableRooms);
    } catch (error) {
      console.error("Błąd podczas pobierania pokoi:", error);
      showNotification("error", "Błąd podczas pobierania pokoi.");
    }
  };

  const getIdRef = async () => {
    try {
      const response = await api.get(`/reservations/${reservationId}/rooms`);
      setReservationRoomAssignments(response.data);
    } catch (error) {
      console.error("Błąd podczas pobierania przypisań pokoi:", error);
    }
  };

  useEffect(() => {
    getIdRef();
    getReservation();
    getInvoice();
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
        [roomId]: checked ? 1 : undefined,
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
      showNotification("error", errorMessage);
      //alert(errorMessage);
      return;
    }

    const updatedFormData = {
      ...formData,
      reservationRooms: formData.reservationRooms.map((rr) => ({
        ...rr,
        guestCount: Number(roomGuests[rr.room.id] ?? rr.guestCount),
      })),
    };

    await modifyReservation(updatedFormData);
    await updateRoomAssignments();

    // navigate("/RecepcionistDashboard/Reservations");
    setIsEditable(false);
  };

  const modifyReservation = async (updatedFormData) => {
    try {
      const response = await api.put(`/reservations/${reservationId}`, updatedFormData);
      console.log("Rezerwacja została zaktualizowana:", response.data);
      showNotification("success", "Rezerwacja została zaktualizowana.");
    } catch (error) {
      console.error("Błąd podczas aktualizacji rezerwacji:", error);
      showNotification("error", "Wystąpił błąd podczas aktualizacji rezerwacji.");
    }
  };

  const updateRoomAssignments = async () => {
    for (const oldAssignment of reservationRoomAssignments) {
      const existsInNew = formData.reservationRooms.some(
        (r) => r.room.id === oldAssignment.room.id,
      );

      if (!existsInNew) {
        try {
          await api.delete(`/reservations/${reservationId}/rooms/${oldAssignment.id}`);
        } catch (error) {
          console.error("Błąd podczas usuwania przypisania:", error);
        }
      }
    }

    for (const rr of formData.reservationRooms) {
      const sameAssignment = reservationRoomAssignments.find((a) => a.room.id === rr.room.id);

      if (sameAssignment) {
        if (sameAssignment.guestCount !== rr.guestCount) {
          try {
            await api.put(`/reservations/${reservationId}/rooms/${sameAssignment.id}`, {
              guestCount: rr.guestCount,
              room: rr.room,
            });
            console.log(`Zaktualizowano liczbę osób w pokoju ${rr.room.roomNumber}`);
          } catch (error) {
            console.error("Błąd podczas aktualizacji liczby osób:", error);
          }
        }
        continue;
      }
      const oldAssignment = reservationRoomAssignments.find(
        (a) => !formData.reservationRooms.some((r) => r.room.id === a.room.id),
      );

      if (!oldAssignment) {
        await api.post(`/reservations/${reservationId}/rooms`, {
          guestCount: rr.guestCount,
          room: rr.room,
        });
        continue;
      }

      try {
        await api.delete(`/reservations/${reservationId}/rooms/${oldAssignment.id}`);

        await api.post(`/reservations/${reservationId}/rooms`, {
          guestCount: rr.guestCount,
          room: rr.room,
        });
      } catch (error) {
        console.error("Błąd podczas podmiany przypisania pokoju:", error);
      }
    }
    if (formData.status === "COMPLETED" && shouldAddCleaningTask) {
      try {
        const now = new Date().toISOString().slice(0, 19);
        for (const rr of formData.reservationRooms) {
          await api.post("/housekeeping-tasks", {
            // employee: {
            //   id: null,
            // },
            room: rr.room,
            requestDate: now,
            completionDate: now,
            status: "PENDING",
            description: "Sprzątanie po zakończonej rezerwacji.",
          });
          console.log(`Dodano zadanie sprzątania dla pokoju ${rr.room.roomNumber}`);
        }
      } catch (error) {
        console.error("Błąd podczas dodawania zadań sprzątania:", error);
      }
    }
  };

  const handleRoomToggle = (room) => {
    setFormData((prevData) => {
      const isSelected = prevData.reservationRooms.some((rr) => rr.room.id === room.id);

      let updatedReservationRooms;
      if (isSelected) {
        updatedReservationRooms = prevData.reservationRooms.filter((rr) => rr.room.id !== room.id);
      } else {
        updatedReservationRooms = [
          ...prevData.reservationRooms,
          {
            room: room,
            guestCount: room.bedCount,
            id: room.id,
          },
        ];
      }
      return {
        ...prevData,
        reservationRooms: updatedReservationRooms,
        rooms: updatedReservationRooms.map((rr) => rr.room.roomNumber),
      };
    });
  };

  const handleGenerateInvoice = (reservationId) => {
    navigate("/RecepcionistDashboard/Reservations/NewInvoice", {
      state: { reservationId: reservationId },
    });
  };

  const getInvoice = async () => {
    try {
      const response = await api.get(`/invoices/reservation/${reservationId}`);
      setInvoiceData(response.data.id);
    } catch (error) {
      if (error.response?.status === 404) {
        setInvoiceData(null);
      } else {
        console.error("Błąd podczas pobierania faktury:", error);
      }
    }
  };
  const handleDeleteInvoice = async () => {
    if (!invoiceData) return;
    formData.invoiceId = "";
    try {
      await api.put(`/reservations/${reservationId}`, formData);
    } catch (error) {
      console.error("Błąd podczas aktualizacji id faktury:", error);
    }
    try {
      await api.delete(`/invoices/${invoiceData}`);
      showNotification("success", "Faktura została usunięta.");
      setInvoiceData(null);
    } catch (error) {
      console.error("Błąd podczas usuwania faktury:", error);
      showNotification("error", "Wystąpił błąd.");
    } finally {
      setShowDeleteInvoiceModal(false);
    }
  };

  const handleGuestCountChange = (roomId, e) => {
    const { value } = e.target;
    const newGuestCount = parseInt(value);

    setRoomGuests((prevGuests) => ({
      ...prevGuests,
      [roomId]: newGuestCount,
    }));

    setFormData((prev) => ({
      ...prev,
      reservationRooms: prev.reservationRooms.map((rr) =>
        rr.room.id === roomId ? { ...rr, guestCount: value } : rr,
      ),
    }));
  };

  useEffect(() => {
    calculateTotalPrice();
  }, [formData.startDate, formData.endDate, formData.reservationRooms, formData.rooms]);

  const calculateTotalPrice = () => {
    const { startDate, endDate, reservationRooms } = formData;
    if (!startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));

    let total = 0;
    reservationRooms.forEach(({ room, guestCount }) => {
      const { bedCount, pricePerNight } = room;
      const roomPrice = (guestCount / bedCount) * pricePerNight * days;
      total += roomPrice;
    });
    if (originalKwota === 0) {
      setOriginalKwota(total);
    }
    setKwota(total.toFixed(2));
  };

  useEffect(() => {
    if (formData?.reservationRooms?.length > 0) {
      const initialGuests = {};
      formData.reservationRooms.forEach((rr) => {
        initialGuests[rr.room.id] = rr.guestCount;
      });
      setRoomGuests(initialGuests);
    }
  }, [formData]);
  const validateForm = () => {
    const today = new Date().toISOString().split("T")[0];
    const { startDate, endDate, guestPesel, guestPhone } = formData;

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
  return (
    <div className="card-body">
      <h2 className="mb-4">Rezerwacja</h2>

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
              disabled={!isEditable || formData.status == "ACTIVE"}
              min={
                formData.status == "UPCOMING"
                  ? new Date().toISOString().split("T")[0]
                  : formData.startDate
              }
              max={formData.endDate}
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
              disabled={!isEditable}
              min={formData.startDate}
            />
          </div>
        </div>

        <h3 className="card-title mt-4">Informacje o gościu</h3>
        <div className="row g-3">
          <div className="col-md">
            <div className="form-label">Imię</div>
            <input
              type="text"
              className="form-control"
              name="guestFirstName"
              value={formData.guestFirstName}
              onChange={handleChange}
              disabled={!isEditable}
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
              disabled={!isEditable}
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
              disabled={!isEditable}
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
              disabled={!isEditable}
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
            disabled={!isEditable}
          />
        </div>

        <div className="form-group mb-3">
          <label className="form-label">Liczba łóżek</label>
          <select
            className="form-select"
            value={bedFilter}
            onChange={handleBedFilterChange}
            disabled={!isEditable}
          >
            <option value="all">Wszystkie</option>
            <option value="1">1 łóżko</option>
            <option value="2">2 łóżka</option>
            <option value="3">3 łóżka</option>
          </select>
        </div>

        <div style={{ maxHeight: "300px", overflowY: "auto" }}>
          {filteredRooms.length > 0 ? (
            filteredRooms.map((room) => {
              const isSelected = formData.reservationRooms?.some((rr) => rr.room.id === room.id);

              return (
                <div key={room.id} className="form-fieldset d-flex flex-column gap-2">
                  <div className="d-flex gap-2">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={`room${room.id}`}
                      name="rooms"
                      value={room.id}
                      checked={isSelected}
                      onChange={() => handleRoomToggle(room)}
                      disabled={!isEditable}
                    />
                    <label className="form-check-label" htmlFor={`room${room.id}`}>
                      Pokój {room.roomNumber} - Piętro {room.floor}, {room.bedCount} łóżek -{" "}
                      {room.pricePerNight} PLN za noc
                    </label>
                  </div>
                  {isSelected && (
                    <div>
                      <label className={`form-label ${isEditable ? "" : "text-muted"}`}>
                        Liczba osób w pokoju:
                      </label>
                      <div className="d-flex align-items-center gap-2">
                        <input
                          type="number"
                          className="form-control"
                          style={{ maxWidth: "100px" }}
                          value={roomGuests[room.id]}
                          onChange={(e) => handleGuestCountChange(room.id, e)}
                          min={1}
                          max={room.bedCount}
                          disabled={!isEditable}
                        />
                        <div className={`fw-semibold ${isEditable ? "" : "text-muted"}`}>
                          {roomGuests[room.id]
                            ? `${((roomGuests[room.id] / room.bedCount) * room.pricePerNight).toFixed(2)} PLN`
                            : "0.00 PLN"}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div>Brak dostępnych pokoi spełniających kryteria wyszukiwania.</div>
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
              disabled={!isEditable}
              style={!isEditable ? { resize: "none", overflow: "auto" } : {}}
            ></textarea>
          </div>
          <div className="col-md">
            <div className="form-label">Catering</div>
            <label className="form-check form-switch">
              <input
                type="checkbox"
                className="form-check-input"
                name="catering"
                checked={formData.catering}
                onChange={handleChange}
                disabled={!isEditable}
              />
              <span className="form-check-label">Dołącz catering dla gości hotelowych</span>
            </label>
          </div>
        </div>

        <h3 className="card-title mt-4">Status</h3>
        <div className="form-check">
          <input
            type="radio"
            className="form-check-input"
            name="status"
            id="UPCOMING"
            value="UPCOMING"
            checked={formData.status === "UPCOMING"}
            onChange={handleChange}
            disabled={!isEditable}
          />
          <label className="form-check-label" htmlFor="UPCOMING">
            Nadchodząca
          </label>
        </div>
        <div className="form-check">
          <input
            type="radio"
            className="form-check-input"
            name="status"
            id="ACTIVE"
            value="ACTIVE"
            checked={formData.status === "ACTIVE"}
            onChange={handleChange}
            disabled={!isEditable || formData.startDate != new Date().toISOString().split("T")[0]}
          />
          <label className="form-check-label" htmlFor="ACTIVE">
            Aktywna
          </label>
        </div>
        <div className="form-check">
          <input
            type="radio"
            className="form-check-input"
            name="status"
            id="CANCELLED"
            value="CANCELLED"
            checked={formData.status === "CANCELLED"}
            onChange={handleChange}
            disabled={!isEditable}
          />
          <label className="form-check-label" htmlFor="CANCELLED">
            Anulowana
          </label>
        </div>
        <div className="form-check">
          <input
            type="radio"
            className="form-check-input"
            name="status"
            value="COMPLETED"
            id="COMPLETED"
            checked={formData.status === "COMPLETED"}
            onChange={handleChange}
            disabled={!isEditable}
          />
          <label className="form-check-label" htmlFor="COMPLETED">
            Zakończona
          </label>
        </div>

        {formData.status === "COMPLETED" && (
          <div className="form-check mt-2">
            <input
              type="checkbox"
              className="form-check-input"
              id="cleaningTasksCheckbox"
              checked={shouldAddCleaningTask}
              onChange={(e) => setShouldAddCleaningTask(e.target.checked)}
              disabled={!isEditable}
            />
            <label className="form-check-label" htmlFor="cleaningTasksCheckbox">
              Utwórz zadania sprzątania dla wszystkich pokoi
            </label>
          </div>
        )}

        <h3 className="card-title mt-4">Kwota bazowa</h3>
        <h3 className="card-title">{kwota} PLN</h3>
        {originalKwota > 0 && originalKwota !== parseFloat(kwota) && (
          <div>
            <h4>
              {parseFloat(kwota) > originalKwota
                ? `Do dopłaty: ${(parseFloat(kwota) - originalKwota).toFixed(2)} PLN`
                : `Do zwrotu: ${(originalKwota - parseFloat(kwota)).toFixed(2)} PLN`}
            </h4>
          </div>
        )}
        <div className="card-footer bg-transparent mt-auto">
          <div className="btn-list justify-content-end">
            {formData.status === "COMPLETED" && !isEditable ? (
              invoiceData ? (
                <>
                  <ShowInvoiceButton reservationId={reservationId} />

                  <button
                    type="button"
                    className="btn btn-warning"
                    onClick={() =>
                      navigate("/RecepcionistDashboard/Reservations/InvoiceDetails", {
                        state: {
                          invoice: invoiceData,
                          reservationId: reservationId,
                        },
                      })
                    }
                  >
                    Edytuj fakturę
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => setShowDeleteInvoiceModal(true)}
                  >
                    Usuń fakturę
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={(e) => {
                    e.preventDefault();
                    handleGenerateInvoice(reservationId);
                  }}
                >
                  Generuj fakturę
                </button>
              )
            ) : (
              <>
                {(isEditable && (
                  <button type="submit" className="btn btn-primary">
                    Zatwierdź zmiany
                  </button>
                )) || (
                  <button
                    type="button"
                    className="btn btn-warning"
                    onClick={(e) => {
                      e.preventDefault();
                      showNotification(
                        "info",
                        "Dane rezerwacji zostały odblokowane - możesz je teraz edytować.",
                        5000,
                      );
                      setIsEditable(true);
                    }}
                  >
                    Edytuj dane rezerwacji
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </form>

      <DeleteConfirmationModal
        show={showDeleteInvoiceModal}
        handleClose={() => setShowDeleteInvoiceModal(false)}
        handleConfirm={handleDeleteInvoice}
        message="Czy na pewno chcesz usunąć tę fakturę? Jest to operacja nieodwracalna."
      />
    </div>
  );
};

export default ModifyReservation;
