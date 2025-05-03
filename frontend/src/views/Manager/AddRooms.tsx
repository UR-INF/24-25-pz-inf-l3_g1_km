import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { api } from "../../services/api";
import { useNotification } from "../../contexts/notification";

export default function AddRooms() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { showNotification } = useNotification();
  const [formData, setFormData] = useState({
    bedCount: "",
    floor: "",
    pricePerNight: "",
    roomNumber: "",
    status: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.roomNumber || formData.roomNumber.trim() === "") {
      return "Numer pokoju nie może być pusty.";
    } else if (!/^\d+$/.test(formData.roomNumber.trim())) {
      return "Numer pokoju może zawierać tylko cyfry.";
    }
    if (formData.bedCount <= 0) {
      return "Liczba łóżek musi być większa od zera.";
    }
    if (formData.floor <= 0) {
      return "Piętro nie może być mniejsze niż 0.";
    }
    if (formData.pricePerNight <= 0) {
      return "Cena za noc musi być większa od zera.";
    }
    if (!["OCCUPIED", "AVAILABLE", "OUT_OF_SERVICE"].includes(formData.status)) {
      return "Nieprawidłowy status pokoju.";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errorMessage = validateForm();
    if (errorMessage) {
      showNotification("error", errorMessage);
      return;
    }

    try {
      await api.post(`/rooms`, formData);
      showNotification("success", "Pokuj został dodany.");
      navigate("/ManagerDashboard/Rooms");
    } catch (error) {
      console.error("Błąd aktualizacji:", error);
      showNotification("error", "Wystąpił błąd przy dodwaniu pokoju");
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-body">
        <div className="container-xl">
          <div className="card">
            <div className="card-body">
              <h2 className="mb-4">Pokój</h2>
              <form onSubmit={handleSubmit}>
                <h3 className="card-title mt-4">Informacje o pokoju</h3>
                <div className="row g-3">
                  <div className="col-md">
                    <div className="form-label">LICZBA ŁÓŻEK</div>
                    <input
                      type="number"
                      className="form-control"
                      name="bedCount"
                      value={formData.bedCount}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md">
                    <div className="form-label">PIĘTRO</div>
                    <input
                      type="number"
                      className="form-control"
                      name="floor"
                      value={formData.floor}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md">
                    <div className="form-label">CENA ZA NOC</div>
                    <input
                      type="number"
                      className="form-control"
                      name="pricePerNight"
                      value={formData.pricePerNight}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md">
                    <div className="form-label">NUMER POKOJU</div>
                    <input
                      type="text"
                      className="form-control"
                      name="roomNumber"
                      value={formData.roomNumber}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <h3 className="card-title mt-4">Status</h3>
                <div className="form-check">
                  <input
                    type="radio"
                    className="form-check-input"
                    name="status"
                    id="OCCUPIED"
                    value="OCCUPIED"
                    checked={formData.status === "OCCUPIED"}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="AVAILABLE">
                    ZAJĘTY
                  </label>
                </div>
                <div className="form-check">
                  <input
                    type="radio"
                    className="form-check-input"
                    name="status"
                    id="AVAILABLE"
                    value="AVAILABLE"
                    checked={formData.status === "AVAILABLE"}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="ACTIVE">
                    DOSTĘPNY
                  </label>
                </div>
                <div className="form-check">
                  <input
                    type="radio"
                    className="form-check-input"
                    name="status"
                    id="OUT_OF_SERVICE"
                    value="OUT_OF_SERVICE"
                    checked={formData.status === "OUT_OF_SERVICE"}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="OUT_OF_SERVICE">
                    NIEDOSTĘPNY
                  </label>
                </div>

                <button type="submit" className="btn btn-primary">
                  Dodaj pokuj
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
