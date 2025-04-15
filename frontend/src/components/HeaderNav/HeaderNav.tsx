import { useUser, RoleName } from "../../contexts/user";
import { useAuth } from "../../contexts/auth";
import { useNavigate, Link, useLocation } from "react-router";
import { getNavItemClass } from "../../utils/navigationUtils";
import UserDropdown from "./UserDropdown";

import ReceptionistMenu from "./Menu/ReceptionistMenu";
import ManagerMenu from "./Menu/ManagerMenu";
import HousekeeperMenu from "./Menu/HousekeeperMenu";
import MaintenanceMenu from "./Menu/MaintenanceMenu";

const HeaderNav = () => {
  const { userRoleName } = useUser();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const renderMenuForRole = () => {
    switch (userRoleName) {
      case RoleName.RECEPTIONIST:
        return <ReceptionistMenu />;
      case RoleName.MANAGER:
        return <ManagerMenu />;
      case RoleName.HOUSEKEEPER:
        return <HousekeeperMenu />;
      case RoleName.MAINTENANCE:
        return <MaintenanceMenu />;
      default:
        return <></>;
    }
  };

  return (
    <header className="navbar navbar-expand">
      <div className="container-xl">
        <div className="row flex-fill align-items-center">
          <div className="col">
            <ul className="navbar-nav">
              <li className={getNavItemClass("/", location.pathname)}>
                <Link className="nav-link" to="/">
                  <span className="nav-link-icon">
                    <i className="ti ti-home fs-2"></i>
                  </span>
                  <span className="nav-link-title">Dashboard</span>
                </Link>
              </li>
              {renderMenuForRole()}
            </ul>
          </div>
        </div>
        <UserDropdown handleLogout={handleLogout} />
      </div>
    </header>
  );
};

export default HeaderNav;
