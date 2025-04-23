import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { api } from "../services/api";

const ReservationsTable = () => {
  const navigate = useNavigate();

  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [resultsPerPage, setResultsPerPage] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);

  const getReservations = async () => {
    try {
      const response = await api.get("/reservations");
      setReservations(response.data);
    } catch (error) {
      console.error("Błąd podczas dodawania rezerwacji:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Czy na pewno chcesz usunąć tę rezerwację?")) {
      try {
        const response = await api.delete(`/reservations/${id}`);
        console.log("Rezerwacja została usunięta:", response.data);
        getReservations();
      } catch (error) {
        console.error("Błąd podczas usuwania rezerwacji:", error);
      }
    }
  };

  useEffect(() => {
    getReservations();
  }, []);

  const handleShowReservation = (id) => {
    navigate("/RecepcionistDashboard/Reservations/ReservationDetails", {
      state: { reservationId: id },
    });
  };

  useEffect(() => {
    const filtered = reservations.filter((res) =>
      `${res.guestFirstName} ${res.guestLastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
    setFilteredReservations(filtered);
    setCurrentPage(1);
  }, [searchTerm, reservations]);

  const totalPages = Math.ceil(filteredReservations.length / resultsPerPage);
  const paginatedReservations = filteredReservations.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="card">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Rezerwacje</h3>
        </div>
        <div className="card-body border-bottom py-3">
          <div className="d-flex">
            <div className="text-secondary">
              Pokaż
              <div className="mx-2 d-inline-block">
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={resultsPerPage}
                min={1}
                onChange={(e) => setResultsPerPage(Number(e.target.value))}
                  aria-label="Invoices count"
                />
              </div>
              wyników
            </div>
            <div className="ms-auto text-secondary">
              Wyszukaj:
              <div className="ms-2 d-inline-block">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  aria-label="Search invoice"
                  value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Imię lub Nazwisko"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-selectable card-table table-vcenter text-nowrap datatable">
            <thead>
              <tr>
                <th className="w-1">ID Rezerwacji</th>
                <th>Osoba Rezerwująca</th>
                <th>Status</th>
                <th>Data Od</th>
                <th>Data Do</th>
                <th>Catering</th>
                <th>Liczba Pokoi</th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {paginatedReservations.map((res) => (
                <tr key={res.id}>
                  <td>
                    <span className="text-secondary">{res.id}</span>
                  </td>
                  <td>
                    {res.guestFirstName && res.guestLastName
                      ? `${res.guestFirstName} ${res.guestLastName}`
                      : "Brak danych"}
                  </td>
                  <td>
                    <span
                      className={`badge me-1 ${
                        res.status === "ACTIVE"
                          ? "bg-success"
                          : res.status === "CANCELLED"
                            ? "bg-warning"
                            : res.status === "COMPLETED"
                              ? "bg-danger"
                              : "bg-secondary"
                      }`}
                    ></span>
                    {res.status === "ACTIVE"
                      ? "Aktywna"
                      : res.status === "CANCELLED"
                        ? "Anulowana"
                        : res.status === "COMPLETED"
                          ? "Ukończona"
                          : res.status}
                  </td>
                  <td>{new Date(res.startDate).toLocaleDateString()}</td>
                  <td>{new Date(res.endDate).toLocaleDateString()}</td>
                  <td>{res.catering ? "Tak" : "Nie"}</td>
                  <td>{res.roomsCount || 1}</td>
                  <td className="text-end">
                    <a
                      href="#"
                      className="btn btn-primary"
                      onClick={(e) => {
                        e.preventDefault();
                        handleShowReservation(res.id);
                      }}
                    >
                      Zobacz
                    </a>
                  </td>
                  <td>
                    <a
                      href="#"
                      className="btn btn-danger"
                      onClick={(e) => {
                        e.preventDefault();
                        handleDelete(res.id);
                      }}
                    >
                      Usuń
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card-footer d-flex align-items-center">
          <p className="m-0 text-secondary">
            Wyświetlono{" "}
          <span>{(currentPage - 1) * resultsPerPage + 1}</span> do{" "}
          <span>
            {Math.min(currentPage * resultsPerPage, filteredReservations.length)}
          </span>{" "}
          z <span>{filteredReservations.length}</span> wyników
          </p>
          <ul className="pagination m-0 ms-auto">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <a className="page-link" href="#" tabIndex={-1} aria-disabled="true" onClick={(e) => {
                e.preventDefault();
                handlePageChange(currentPage - 1);
              }}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="icon icon-1"
                >
                  <path d="M15 6l-6 6l6 6"></path>
                </svg>
                poprzednia
              </a>
            </li>
            {[...Array(totalPages)].map((_, idx) => (
            <li
              className={`page-item ${currentPage === idx + 1 ? "active" : ""}`}
              key={idx}
            >
              <a
                className="page-link"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(idx + 1);
                }}
              >
                {idx + 1}
              </a>
            </li>
          ))}
            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
              <a className="page-link" href="#" onClick={(e) => {
                e.preventDefault();
                handlePageChange(currentPage + 1);
              }}>
                następna
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="icon icon-1"
                >
                  <path d="M9 6l6 6l-6 6"></path>
                </svg>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ReservationsTable;
