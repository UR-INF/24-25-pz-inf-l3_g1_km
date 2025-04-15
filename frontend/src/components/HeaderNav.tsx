import { useUser } from "../contexts/user";
import { useAuth } from "../contexts/auth";
import { useNavigate } from "react-router";
import { getRoleNameInPolish } from "../utils/roleUtils";
import { Link } from "react-router";

const HeaderNav = () => {
  const { userFirstName, userLastName, userRoleName } = useUser();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="navbar navbar-expand">
      <div className="container-xl">
        <div className="row flex-fill align-items-center">
          <div className="col">
            <ul className="navbar-nav">
              <li className="nav-item active">
                <Link className="nav-link" to="/" replace>
                  <span className="nav-link-icon">
                    <i className="ti ti-home fs-2"></i>
                  </span>
                  <span className="nav-link-title">Dashboard</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/RecepcionistDashboard/Reservations" replace>
                  <span className="nav-link-icon">
                    <i className="ti ti-calendar-check fs-2"></i>
                  </span>
                  <span className="nav-link-title">Rezerwacje</span>
                </Link>
              </li>
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#navbar-extra"
                  data-bs-toggle="dropdown"
                  data-bs-auto-close="outside"
                  role="button"
                  aria-expanded="false"
                >
                  <span className="nav-link-icon">
                    <i className="ti ti-report fs-2"></i>
                  </span>

                  <span className="nav-link-title">Zgłoszenia</span>
                </a>
                <div className="dropdown-menu">
                  <Link
                    className="dropdown-item"
                    to="/RecepcionistDashboard/CleaningOrders"
                    replace
                  >
                    Zgłoszenia sprzątania
                  </Link>

                  <Link className="dropdown-item" to="/RecepcionistDashboard/RepairsOrders" replace>
                    Zgłoszenia naprawy
                  </Link>
                </div>
              </li>
              <li></li>
            </ul>
          </div>
        </div>
        <div className="nav-item dropdown">
          <a
            href="#"
            className="nav-link d-flex lh-1 p-0 px-2"
            data-bs-toggle="dropdown"
            aria-label="Open user menu"
          >
            <span
              className="avatar avatar-sm"
              style={{
                backgroundImage:
                  "url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRpAklFXnBaXsEsy_Y08157gUwnacNh7gQgLQ&s')",
              }}
            ></span>

            <div className="ps-2">
              <div>
                {userFirstName} {userLastName}
              </div>
              <div className="mt-1 small text-secondary">{getRoleNameInPolish(userRoleName)}</div>
            </div>
          </a>
          <div className="dropdown-menu dropdown-menu-end dropdown-menu-arrow">
            <a href="#" className="dropdown-item">
              Ustawienia
            </a>
            <a href="#" className="dropdown-item text-danger" onClick={handleLogout}>
              Wyloguj się
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderNav;
