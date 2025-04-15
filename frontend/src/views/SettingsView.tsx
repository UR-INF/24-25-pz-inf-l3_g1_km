const SettingsView = () => {
  return (
    <div className="page-wrapper">
      <div className="page-header d-print-none">
        <div className="container-xl">
          <div className="row g-2 align-items-center">
            <div className="col">
              <h1 className="page-title">Ustawienia</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="page-body">
        <div className="container-xl">
          <div className="card">
            <div className="card-body">
              <h3 className="card-title">Szczegóły konta</h3>
              <div className="row align-items-center">
                <div className="col-auto">
                  <span className="avatar avatar-xl"></span>
                </div>
                <div className="col-auto">
                  <a href="#" className="btn btn-1">
                    {" "}
                    Zmień zdjęcie profilowe{" "}
                  </a>
                </div>
                <div className="col-auto">
                  <a href="#" className="btn btn-ghost-danger btn-3">
                    {" "}
                    Usuń zdjęcie profilowe{" "}
                  </a>
                </div>
              </div>
              <h3 className="card-title mt-4">Twoje dane</h3>
              <div className="row g-3">
                <div className="col-md">
                  <div className="form-label">Imię</div>
                  <input type="text" className="form-control" value="Dawid" disabled />
                </div>
                <div className="col-md">
                  <div className="form-label">Nazwisko</div>
                  <input type="text" className="form-control" value="Wojcik" disabled />
                </div>
                <div className="col-md">
                  <div className="form-label">Stanowisko</div>
                  <input type="text" className="form-control" value="Recepcjonista" disabled />
                </div>
              </div>
              <h3 className="card-title mt-4">Email</h3>
              <p className="card-subtitle">
                Za pomocą tego adresu e-mail odbywa się logowanie do serwisu.
              </p>
              <div>
                <div className="row g-2">
                  <div className="col-auto">
                    <input type="text" className="form-control w-auto" value="dawid@hotel.pl" />
                  </div>
                  <div className="col-auto">
                    <a href="#" className="btn btn-1">
                      {" "}
                      Zmień{" "}
                    </a>
                  </div>
                </div>
              </div>
              <h3 className="card-title mt-4">Hasło</h3>
              <p className="card-subtitle">
                Zmień hasło, jeśli uważasz że osoba nieupoważniona może je znać.
              </p>
              <div>
                <div className="row g-2">
                  <div className="col-auto">
                    <p className="card-subtitle">Nowe hasło:</p>
                    <input type="text" className="form-control w-auto" value="" />
                  </div>
                  <div className="col-auto">
                    <p className="card-subtitle">Powtórz hasło:</p>
                    <input type="text" className="form-control w-auto" value="" />
                  </div>
                  <div className="col-auto">
                    <p className="card-subtitle">
                      Hasło powinno składać się z co najmniej 6 znaków.
                    </p>
                    <a href="#" className="btn btn-1">
                      {" "}
                      Zmień{" "}
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-footer bg-transparent mt-auto">
              <div className="btn-list justify-content-end">
                <a href="#" className="btn btn-1">
                  {" "}
                  Anuluj{" "}
                </a>
                <a href="#" className="btn btn-primary btn-2">
                  {" "}
                  Zapisz{" "}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
