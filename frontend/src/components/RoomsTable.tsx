import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { api } from "../services/api";

const RoomsTable = () => {
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);

  const handleDeleteRoom = async (roomId) => {
    if (window.confirm("Czy na pewno chcesz usunąć ten pokój?")) {
      try {
        await api.delete(`/rooms/${roomId}`);
        setRooms(rooms.filter((room) => room.id !== roomId));
      } catch (error) {
        console.error("Błąd przy usuwaniu pokoju:", error);
      }
    }
  };

  const handleShowRoom = (roomId) => {
    navigate(`/rooms/${roomId}`);
  };
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await api.get("/rooms");

        setRooms(response.data);
        console.log(rooms);
      } catch (error) {
        console.error("Błąd przy pobieraniu pokoi:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const filteredRooms = rooms.filter((room) =>
    room.roomNumber?.toString().toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredRooms.length / resultsPerPage);
  const startIndex = (currentPage - 1) * resultsPerPage;
  const displayedRooms = filteredRooms.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage,
  );

  const handleChangePage = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [search, resultsPerPage]);

  if (loading) {
    return <div>Ładowanie danych pokoi...</div>;
  }

  return (
    <div className="card">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Pokoje</h3>
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
                  onChange={(e) => setResultsPerPage(Number(e.target.value))}
                  min={1}
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
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-selectable card-table table-vcenter text-nowrap datatable">
            <thead>
              <tr>
                <th className="w-1">ID Pokoju</th>
                <th>Numer Pokoju</th>
                <th>Pietro</th>
                <th>Liczba Łóżek</th>
                <th>Cena za Noc</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {displayedRooms.map((room) => (
                <tr key={room.id}>
                  <td>
                    <span className="text-secondary">{room.id}</span>
                  </td>
                  <td>{room.roomNumber}</td>
                  <td>{room.floor}</td>
                  <td>{room.bedCount}</td>
                  <td>{room.pricePerNight.toFixed(2)} PLN</td>
                  <td>
                    <span
                      className={`badge me-1 ${
                        room.status === "AVAILABLE"
                          ? "bg-success"
                          : room.status === "OCCUPIED"
                            ? "bg-warning"
                            : room.status === "UNAVAILABLE"
                              ? "bg-danger"
                              : "bg-secondary"
                      }`}
                    ></span>
                    {room.status === "AVAILABLE"
                      ? "Dostępny"
                      : room.status === "OCCUPIED"
                        ? "Zajęty"
                        : room.status === "OUT_OF_SERVICE"
                          ? "Niedostępny"
                          : room.status}
                  </td>
                  <td className="text-end">
                    <a
                      href="#"
                      className="btn btn-primary"
                      onClick={(e) => {
                        e.preventDefault();
                        handleShowRoom(room.id);
                      }}
                    >
                      Zobacz
                    </a>
                  </td>
                  {/* <td>
                    <a
                      href="#"
                      className="btn btn-danger"
                      onClick={(e) => {
                        e.preventDefault();
                        handleDeleteRoom(room.id);
                      }}
                    >
                      Usuń
                    </a>
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card-footer d-flex align-items-center">
          <p className="m-0 text-secondary">
            Wyświetlono <span>{startIndex + 1}</span> do{" "}
            <span>{Math.min(startIndex + resultsPerPage, filteredRooms.length)}</span> z{" "}
            <span>{filteredRooms.length}</span> wyników
          </p>
          <ul className="pagination m-0 ms-auto">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <a
                className="page-link"
                href="#"
                tabIndex={-1}
                aria-disabled="true"
                onClick={() => handleChangePage(currentPage - 1)}
              >
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
            {Array.from({ length: totalPages }, (_, i) => (
              <li key={i} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
                <button className="page-link" onClick={() => handleChangePage(i + 1)}>
                  {i + 1}
                </button>
              </li>
            ))}
            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
              <a className="page-link" href="#" onClick={() => handleChangePage(currentPage + 1)}>
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

export default RoomsTable;
