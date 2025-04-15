import { Link, useLocation } from "react-router";
import { getNavItemClass } from "../../../utils/navigationUtils";

const ReceptionistMenu = () => {
  const location = useLocation();

  return (
    <>
      <li className={getNavItemClass("/RecepcionistDashboard/Reservations", location.pathname)}>
        <Link className="nav-link" to="/RecepcionistDashboard/Reservations" replace>
          <span className="nav-link-icon">
            <i className="ti ti-calendar-check fs-2"></i>
          </span>
          <span className="nav-link-title">Rezerwacje</span>
        </Link>
      </li>
      <li
        className={`${getNavItemClass("/RecepcionistDashboard/Orders/", location.pathname)} dropdown`}
      >
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
          <Link className="dropdown-item" to="/RecepcionistDashboard/Orders/Cleaning" replace>
            Zgłoszenia sprzątania
          </Link>

          <Link className="dropdown-item" to="/RecepcionistDashboard/Orders/Repairs" replace>
            Zgłoszenia naprawy
          </Link>
        </div>
      </li>
    </>
  );
};

export default ReceptionistMenu;
