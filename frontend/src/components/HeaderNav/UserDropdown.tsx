import { useUser } from "../../contexts/user";
import { getRoleNameInPolish } from "../../utils/roleUtils";
import { getNavItemClass } from "../../utils/navigationUtils";
import { useLocation, Link } from "react-router";

interface UserDropdownProps {
  handleLogout: () => void;
}

const UserDropdown = ({ handleLogout }: UserDropdownProps) => {
  const { userFirstName, userLastName, userRoleName, userAvatarUrl, userId } = useUser();
  const location = useLocation();

  return (
    <div className={`${getNavItemClass("/Settings", location.pathname)} navbar-nav dropdown`}>
      <a
        href="#"
        className="nav-link d-flex lh-1 p-0 px-2"
        data-bs-toggle="dropdown"
        aria-label="Otwórz menu użytkownika"
      >
        {userAvatarUrl && (
          <span
            className="avatar shadow avatar-sm"
            style={{
              backgroundImage: `url(${userAvatarUrl})`,
            }}
          ></span>
        )}

        <div className="ps-2">
          {(Boolean(userId) && userFirstName && userLastName && (
            <div>
              {userFirstName} {userLastName}
            </div>
          )) || <div>Brak danych</div>}

          {Boolean(userId) && (
            <div className="mt-1 small text-secondary">
              {userRoleName ? getRoleNameInPolish(userRoleName) : "Brak roli"}
            </div>
          )}
        </div>
      </a>
      <div className="dropdown-menu dropdown-menu-end">
        {Boolean(userId) && (
          <Link className="dropdown-item" to="/Settings">
            Ustawienia
          </Link>
        )}

        <a href="#" className="dropdown-item text-danger" onClick={handleLogout}>
          Wyloguj się
        </a>
      </div>
    </div>
  );
};

export default UserDropdown;
