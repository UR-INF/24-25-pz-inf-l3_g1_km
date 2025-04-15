import { useUser } from "../../contexts/user";
import { getRoleNameInPolish } from "../../utils/roleUtils";

interface UserDropdownProps {
  handleLogout: () => void;
}

const UserDropdown = ({ handleLogout }: UserDropdownProps) => {
  const { userFirstName, userLastName, userRoleName } = useUser();
  const avatarUrl =
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRpAklFXnBaXsEsy_Y08157gUwnacNh7gQgLQ&s";

  return (
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
        <a href="#" className="dropdown-item">
          Ustawienia
        </a>
        <a href="#" className="dropdown-item text-danger" onClick={handleLogout}>
          Wyloguj się
        </a>
      </div>
    </div>
  );
};

export default UserDropdown;
