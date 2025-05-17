import { useUser, RoleName } from "../../contexts/user";
import { useAuth } from "../../contexts/auth";
import { useNavigate, Link, useLocation } from "react-router";
import { getNavItemClass } from "../../utils/navigationUtils";
import UserDropdown from "./UserDropdown";
import { useNotification } from "../../contexts/notification";

import ReceptionistMenu from "./Menu/ReceptionistMenu";
import ManagerMenu from "./Menu/ManagerMenu";
import HousekeeperMenu from "./Menu/HousekeeperMenu";
import MaintenanceMenu from "./Menu/MaintenanceMenu";

const HeaderNav = () => {
  const { userRoleName, userId } = useUser();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showNotification } = useNotification();
  const { state } = useAuth();

  const handleLogout = () => {
    logout();

    // odczekaj aż reducer zaktualizuje stan
    setTimeout(() => {
      navigate("/login", { replace: true });
      showNotification("info", "Pomyślnie wylogowano z systemu!");
    }, 50);
  };

  const renderMenuForRole = () => {
    switch (userRoleName) {
      case RoleName.RECEPTIONIST:
        return <ReceptionistMenu />;
      case RoleName.MANAGER:
        return (
          <>
            <ReceptionistMenu />
            <ManagerMenu />
          </>
        );
      case RoleName.HOUSEKEEPER:
        return <HousekeeperMenu />;
      case RoleName.MAINTENANCE:
        return <MaintenanceMenu />;
      default:
        return <></>;
    }
  };

  return (
    <header className="navbar navbar-expand-lg">
      <div className="container-xl">
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbar-menu"
          aria-controls="navbar-menu"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navbar-menu">
          <ul className="navbar-nav me-auto">
            <li className={getNavItemClass("/", location.pathname)}>
              <Link className="nav-link" to="/">
                <i className="ti ti-home fs-2 me-1" />
                Dashboard
              </Link>
            </li>
            {Boolean(userId) && renderMenuForRole()}
          </ul>
          <UserDropdown handleLogout={handleLogout} />
        </div>
      </div>
    </header>
  );
};

export default HeaderNav;
