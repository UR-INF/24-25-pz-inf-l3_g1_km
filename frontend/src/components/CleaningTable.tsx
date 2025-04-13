import React, { useState } from "react";

const CleaningTable = () => {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Zlecenia sprzątania</h3>
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
              <th className="w-1">ID Zlecenia</th>
              <th>Pokój</th>
              <th>Osoba Przypisana</th>
              <th>Data Zgłoszenia</th>
              <th>Data Zakończenia</th>
              <th>Status</th>
              <th>Opis</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <span className="text-secondary">1</span>
              </td>
              <td>101</td>
              <td>Robert Kowalski</td>
              <td>15 Dec 2022</td>
              <td>17 Dec 2022</td>
              <td>
                <span className="badge bg-warning me-1"></span> W trakcie
              </td>
              <td>Sprzątanie po gościu</td>
              <td className="text-end">
                <a href="#" className="btn btn-primary" target="_blank" rel="noopener">
                  Zobacz
                </a>
              </td>
            </tr>
            <tr>
              <td>
                <span className="text-secondary">2</span>
              </td>
              <td>102</td>
              <td>Anna Nowak</td>
              <td>18 Dec 2022</td>
              <td>20 Dec 2022</td>
              <td>
                <span className="badge bg-success me-1"></span> Zakończone
              </td>
              <td>Sprzątanie i wymiana pościeli</td>
              <td className="text-end">
                <a href="#" className="btn btn-primary" target="_blank" rel="noopener">
                  Zobacz
                </a>
              </td>
            </tr>
            <tr>
              <td>
                <span className="text-secondary">3</span>
              </td>
              <td>105</td>
              <td>Piotr Zieliński</td>
              <td>20 Dec 2022</td>
              <td>22 Dec 2022</td>
              <td>
                <span className="badge bg-danger me-1"></span> Odrzucone
              </td>
              <td>Naprawa zasłon</td>
              <td className="text-end">
                <a href="#" className="btn btn-primary" target="_blank" rel="noopener">
                  Zobacz
                </a>
              </td>
            </tr>
            <tr>
              <td>
                <span className="text-secondary">4</span>
              </td>
              <td>107</td>
              <td>Jan Kowalski</td>
              <td>25 Dec 2022</td>
              <td>26 Dec 2022</td>
              <td>
                <span className="badge bg-secondary me-1"></span> Oczekujące
              </td>
              <td>Wymiana ręczników i sprzątanie łazienki</td>
              <td className="text-end">
                <a href="#" className="btn btn-primary" target="_blank" rel="noopener">
                  Zobacz
                </a>
              </td>
            </tr>
            <tr>
              <td>
                <span className="text-secondary">5</span>
              </td>
              <td>110</td>
              <td>Maria Zielińska</td>
              <td>30 Dec 2022</td>
              <td>2 Jan 2023</td>
              <td>
                <span className="badge bg-warning me-1"></span> W trakcie
              </td>
              <td>Sprzątanie okien</td>
              <td className="text-end">
                <a href="#" className="btn btn-primary" target="_blank" rel="noopener">
                  Zobacz
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
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
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
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                className="icon icon-1"
              >
                <path d="M9 6l6 6l-6 6"></path>
              </svg>
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default CleaningTable;
