import { useNavigate } from "react-router";

const ReservationsTable = () => {
  const navigate = useNavigate();

  const handleShowReservation = () => {
    navigate('/RecepcionistDashboard/Reservations/ReservationDetails', { replace: true }); 
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
                  type="text"
                  className="form-control form-control-sm"
                  value="8"
                  size={3}
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
              <tr>
                <td>
                  <span className="text-secondary">1</span>
                </td>
                <td>Jan Kowalski</td>
                <td>
                  <span className="badge bg-success me-1"></span> Aktywna
                </td>
                <td>15 Dec 2022</td>
                <td>17 Dec 2022</td>
                <td>Tak</td>
                <td>2</td>
                <td className="text-end">
                  <a href="" className="btn btn-primary" target="_blank" rel="noopener" onClick={handleShowReservation}>
                    Zobacz
                  </a>
                </td>
                <td>
                  <a href="" className="btn btn-danger" target="_blank" rel="noopener">
                    Usuń
                  </a>
                </td>
              </tr>
              <tr>
                <td>
                  <span className="text-secondary">2</span>
                </td>
                <td>Anna Nowak</td>
                <td>
                  <span className="badge bg-warning me-1"></span> Anulowana
                </td>
                <td>20 Dec 2022</td>
                <td>22 Dec 2022</td>
                <td>Nie</td>
                <td>1</td>
                <td className="text-end">
                  <a href="" className="btn btn-primary" target="_blank" rel="noopener" onClick={handleShowReservation}>
                    Zobacz
                  </a>
                </td>
                <td>
                  <a href="" className="btn btn-danger" target="_blank" rel="noopener">
                    Usuń
                  </a>
                </td>
              </tr>
              <tr>
                <td>
                  <span className="text-secondary">3</span>
                </td>
                <td>Piotr Wójcik</td>
                <td>
                  <span className="badge bg-danger me-1"></span> Ukończona
                </td>
                <td>25 Dec 2022</td>
                <td>27 Dec 2022</td>
                <td>Tak</td>
                <td>3</td>
                <td className="text-end">
                  <a href="" className="btn btn-primary" target="_blank" rel="noopener" onClick={handleShowReservation}>
                    Zobacz
                  </a>
                </td>
                <td>
                  <a href="" className="btn btn-danger" target="_blank" rel="noopener">
                    Usuń
                  </a>
                </td>
              </tr>
              <tr>
                <td>
                  <span className="text-secondary">4</span>
                </td>
                <td>Maria Zielińska</td>
                <td>
                  <span className="badge bg-secondary me-1"></span> Aktywna
                </td>
                <td>1 Jan 2023</td>
                <td>5 Jan 2023</td>
                <td>Nie</td>
                <td>1</td>
                <td className="text-end">
                  <a href="" className="btn btn-primary" target="_blank" rel="noopener">
                    Zobacz
                  </a>
                </td>
                <td>
                  <a href="" className="btn btn-danger" target="_blank" rel="noopener">
                    Usuń
                  </a>
                </td>
              </tr>
              <tr>
                <td>
                  <span className="text-secondary">5</span>
                </td>
                <td>Adam Wiśniewski</td>
                <td>
                  <span className="badge bg-success me-1"></span> Aktywna
                </td>
                <td>3 Jan 2023</td>
                <td>8 Jan 2023</td>
                <td>Tak</td>
                <td>2</td>
                <td className="text-end">
                  <a href="" className="btn btn-primary" target="_blank" rel="noopener" onClick={handleShowReservation}>
                    Zobacz
                  </a>
                </td>
                                <td>
                  <a href="" className="btn btn-danger" target="_blank" rel="noopener">
                    Usuń
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="card-footer d-flex align-items-center">
          <p className="m-0 text-secondary">
            Wyświetlono <span>1</span> do <span>8</span> z <span>16</span> wyników
          </p>
          <ul className="pagination m-0 ms-auto">
            <li className="page-item disabled">
              <a className="page-link" href="#" tabIndex={-1} aria-disabled="true">
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
            <li className="page-item">
              <a className="page-link" href="#">
                1
              </a>
            </li>
            <li className="page-item active">
              <a className="page-link" href="#">
                2
              </a>
            </li>
            <li className="page-item">
              <a className="page-link" href="#">
                3
              </a>
            </li>
            <li className="page-item">
              <a className="page-link" href="#">
                4
              </a>
            </li>
            <li className="page-item">
              <a className="page-link" href="#">
                5
              </a>
            </li>
            <li className="page-item">
              <a className="page-link" href="#">
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
