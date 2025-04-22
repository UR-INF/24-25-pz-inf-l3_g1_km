import { Link, useLocation } from "react-router";
import { getNavItemClass } from "../../../utils/navigationUtils";

const HousekeeperMenu = () => {
  const location = useLocation();

  return (
    <>
      <li className={getNavItemClass("/HousekeeperDashboard/CleaningTasks", location.pathname)}>
        <Link className="nav-link" to="/HousekeeperDashboard/CleaningTasks">
          <span className="nav-link-icon">
            <i className="ti ti-broom fs-2"></i>
          </span>
        </Link>
      </li>
    </>
  );
};

export default HousekeeperMenu;
