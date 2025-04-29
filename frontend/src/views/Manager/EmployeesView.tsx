import { useState, useCallback } from "react";
import { Link } from "react-router";
import EmployeesTable from "../../components/EmployeesTable";

const EmployeesView = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationData, setPaginationData] = useState({
    totalItems: 0,
    startIndex: 0,
    endIndex: 0,
  });

  const pageSize = 8; // Liczba pracowników na stronę

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1); // Reset paginacji po wpisaniu wyszukiwania
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDataUpdate = useCallback(
    (data: { totalItems: number; startIndex: number; endIndex: number }) => {
      setPaginationData(data);
    },
    [],
  );

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="container-xl">
          <div className="row g-2 align-items-center">
            <div className="col">
              <h2 className="page-title">Pracownicy</h2>
              <div className="text-secondary mt-1">
                {paginationData.totalItems > 0
                  ? `${paginationData.startIndex}-${paginationData.endIndex} z ${paginationData.totalItems} pracowników`
                  : "Brak pracowników"}
              </div>
            </div>

            <div className="col-auto ms-auto">
              <div className="d-flex gap-2">
                <div className="input-icon">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Szukaj pracownika..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                  <span className="input-icon-addon">
                    <i className="ti ti-search fs-2 me-2"></i>
                  </span>
                </div>

                <Link
                  type="button"
                  className="btn btn-primary"
                  to="/ManagerDashboard/Employees/Create"
                >
                  <i className="ti ti-plus fs-2 me-2"></i>
                  Dodaj nowego pracownika
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="page-body">
        <div className="container-xl">
          <div className="row row-cards">
            <div className="col-lg-12">
              <EmployeesTable
                searchQuery={searchQuery}
                currentPage={currentPage}
                pageSize={pageSize}
                onDataUpdate={handleDataUpdate}
              />
            </div>
          </div>

          {paginationData.totalItems > pageSize && (
            <div className="d-flex mt-4">
              <ul className="pagination ms-auto">
                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <i className="ti ti-chevron-left me-1"></i>
                    poprzednia
                  </button>
                </li>

                {Array.from({ length: Math.ceil(paginationData.totalItems / pageSize) }, (_, i) => (
                  <li key={i} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
                    <button className="page-link" onClick={() => handlePageChange(i + 1)}>
                      {i + 1}
                    </button>
                  </li>
                ))}

                <li className="page-item">
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={paginationData.endIndex === paginationData.totalItems}
                  >
                    następna
                    <i className="ti ti-chevron-right me-1"></i>
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeesView;
