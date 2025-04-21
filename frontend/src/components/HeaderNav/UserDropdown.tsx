import { useUser } from "../../contexts/user";
import { getRoleNameInPolish } from "../../utils/roleUtils";
import { getNavItemClass } from "../../utils/navigationUtils";
import { useLocation, Link } from "react-router";

interface UserDropdownProps {
  handleLogout: () => void;
}

const UserDropdown = ({ handleLogout }: UserDropdownProps) => {
  const { user, userFirstName, userLastName, userRoleName, userAvatarFilename } = useUser();
  
  const avatarUrl = user?.avatarUrl;

  const location = useLocation();

  return (
    <div className={`${getNavItemClass("/Settings", location.pathname)} navbar-nav dropdown`}>
      <a
        href="#"
        className="nav-link d-flex lh-1 p-0 px-2"
        data-bs-toggle="dropdown"
        aria-label="Open user menu"
      >
        <span
          className="avatar avatar-sm"
          style={{
            backgroundImage: `url(${avatarUrl})`,
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
        <Link className="dropdown-item" to="/Settings">
          Ustawienia
        </Link>

        <a href="#" className="dropdown-item text-danger" onClick={handleLogout}>
          Wyloguj się
        </a>
      </div>
    </div>
  );
};

export default UserDropdown;
