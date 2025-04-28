import { Link, useLocation } from "react-router";
import { getNavItemClass } from "../../../utils/navigationUtils";

const ManagerMenu = () => {
  const location = useLocation();

  return (
    <>
      <li className={getNavItemClass("/ManagerDashboard/Rooms", location.pathname)}>
        <Link className="nav-link" to="/ManagerDashboard/Rooms">
          <span className="nav-link-icon">
            <i className="ti ti-bed fs-2"></i>
          </span>
          <span className="nav-link-title">Pokoje</span>
        </Link>
      </li>

      <li className={getNavItemClass("/ManagerDashboard/Employees", location.pathname)}>
        <Link className="nav-link" to="/ManagerDashboard/Employees">
          <span className="nav-link-icon">
            <i className="ti ti-users fs-2"></i>
          </span>
          <span className="nav-link-title">Pracownicy</span>
        </Link>
      </li>

      <li className={getNavItemClass("/ManagerDashboard/Reports", location.pathname)}>
        <Link className="nav-link" to="/ManagerDashboard/Reports">
          <span className="nav-link-icon">
            <i className="ti ti-file-text fs-2"></i>
          </span>
          <span className="nav-link-title">Raporty</span>
        </Link>
      </li>
    </>
  );
};

export default ManagerMenu;
