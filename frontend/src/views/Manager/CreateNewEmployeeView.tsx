import { useState } from "react";
import { api } from "../../services/api";
import { useNotification } from "../../contexts/notification";
import { validateEmailFormat, validatePhoneNumber } from "../../utils/regexUtils";
import { getRoleNameInPolish } from "../../utils/roleUtils";
import { RoleName } from "../../contexts/user";
import { useNavigate } from "react-router";

const CreateNewEmployeeView = () => {
  const { showNotification } = useNotification();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [role, setRole] = useState<RoleName>(RoleName.RECEPTIONIST);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!firstName || !lastName || !email || !password || !repeatPassword || !phoneNumber) {
      showNotification("error", "Wszystkie pola są wymagane.");
      return;
    }

    if (!validateEmailFormat(email)) {
      showNotification("error", "Nieprawidłowy adres e-mail.");
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      showNotification(
        "error",
        "Numer telefonu jest nieprawidłowy. Poprawny format to 9 cyfr, opcjonalnie z +48.",
      );
      return;
    }

    if (password !== repeatPassword) {
      showNotification("error", "Hasła się nie zgadzają.");
      return;
    }

    try {
      const response = await api.post("/employees", {
        firstName,
        lastName,
        email,
        password,
        phoneNumber,
        roleName: role,
      });

      const newEmployeeId = response.data.id;

      if (avatarFile) {
        const formData = new FormData();
        formData.append("file", avatarFile);
        await api.post(`/employees/${newEmployeeId}/avatar`, formData);
      }

      showNotification("success", `Pracownik ${firstName} ${lastName} został utworzony.`);
      navigate("/ManagerDashboard/Employees");
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Błąd podczas tworzenia pracownika.";
      showNotification("error", errorMessage);
      console.log(error.response?.data);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="container-xl">
          <div className="row g-2 align-items-center">
            <div className="col">
              <h1 className="page-title">Formularz tworzenia nowego pracownika</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="page-body">
        <div className="container-xl">
          <div className="card">
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Imię</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="wpisz imię"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Nazwisko</label>
                <input
                  type="text"
                  placeholder="wpisz nazwisko"
                  className="form-control"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">E-mail</label>
                <input
                  type="email"
                  placeholder="wpisz e-mail"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Numer telefonu</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="wpisz numer telefonu"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Hasło</label>
                <div className="input-group input-group-flat">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    placeholder="wpisz hasło"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <span className="input-group-text">
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowPassword(!showPassword);
                      }}
                      className="link-secondary"
                      title="Pokaż/Ukryj hasło"
                    >
                      <i className={`ti ${showPassword ? "ti-eye-off" : "ti-eye"} fs-2`}></i>
                    </a>
                  </span>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Powtórz hasło</label>
                <div className="input-group input-group-flat">
                  <input
                    type={showRepeatPassword ? "text" : "password"}
                    className="form-control"
                    placeholder="powtórz hasło"
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                  />
                  <span className="input-group-text">
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowRepeatPassword(!showRepeatPassword);
                      }}
                      className="link-secondary"
                      title="Pokaż/Ukryj hasło"
                    >
                      <i className={`ti ${showRepeatPassword ? "ti-eye-off" : "ti-eye"} fs-2`}></i>
                    </a>
                  </span>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Stanowisko</label>
                <select
                  className="form-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value as RoleName)}
                >
                  {Object.values(RoleName).map((roleKey) => (
                    <option key={roleKey} value={roleKey}>
                      {getRoleNameInPolish(roleKey)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Zdjęcie profilowe (opcjonalne)</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                />
              </div>
            </div>
            <div className="card-footer d-flex justify-content-end">
              <button className="btn btn-primary" onClick={handleSubmit}>
                Dodaj nowego pracownika
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateNewEmployeeView;
