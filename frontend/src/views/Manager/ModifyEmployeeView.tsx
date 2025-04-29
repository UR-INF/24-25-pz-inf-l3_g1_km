import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { api } from "../../services/api";
import { useNotification } from "../../contexts/notification";
import { validateEmailFormat, validatePhoneNumber } from "../../utils/regexUtils";
import { getRoleNameInPolish } from "../../utils/roleUtils";
import { RoleName } from "../../contexts/user";

const ModifyEmployeeView = () => {
  const { id } = useParams<{ id: string }>();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState<RoleName>(RoleName.RECEPTIONIST);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDefaultAvatar = avatarPreview?.includes("default.png");
  const [originalAvatar, setOriginalAvatar] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await api.get(`/employees/${id}`);
        const data = response.data;
        setFirstName(data.firstName);
        setLastName(data.lastName);
        setEmail(data.email);
        setPhoneNumber(data.phoneNumber);
        setRole(data.role.name);
        setAvatarPreview(data.avatarUrl || null);
        setAvatarPreview(data.avatarUrl || null);
        setOriginalAvatar(data.avatarUrl || null);
      } catch (error) {
        showNotification("error", "Nie udało się pobrać danych pracownika.");
      }
    };

    fetchEmployee();
  }, [id]);

  const handleSubmit = async () => {
    if (!firstName || !lastName || !email || !phoneNumber) {
      showNotification("error", "Wszystkie pola są wymagane.");
      return;
    }

    if (!validateEmailFormat(email)) {
      showNotification("error", "Nieprawidłowy adres e-mail.");
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      showNotification("error", "Nieprawidłowy numer telefonu.");
      return;
    }

    if (newPassword && newPassword !== repeatPassword) {
      showNotification("error", "Hasła się nie zgadzają.");
      return;
    }

    try {
      await api.put(`/employees/${id}`, {
        firstName,
        lastName,
        email,
        phoneNumber,
        role: {
          name: role,
        },
      });

      if (newPassword) {
        await api.put(`/employees/${id}/password`, {
          password: newPassword,
        });
      }

      showNotification("success", "Dane pracownika zostały zaktualizowane.");
      navigate("/ManagerDashboard/Employees");
    } catch (error: any) {
      const message = error.response?.data?.error || "Wystąpił błąd podczas aktualizacji.";
      showNotification("error", message);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      showNotification("info", "Wybrano nowe zdjęcie profilowe. Kliknij 'Zapisz nowe'.", 3000);
    }
  };

  const handleUploadAvatar = async () => {
    if (!avatarFile) return;
    const formData = new FormData();
    formData.append("file", avatarFile);
    try {
      await api.post(`/employees/${id}/avatar`, formData);
      showNotification("success", "Zdjęcie profilowe zostało zapisane.");
    } catch (err) {
      showNotification("error", "Błąd podczas zapisu zdjęcia profilowego.");
    }
  };

  const handleDeleteAvatar = async () => {
    if (avatarFile) {
      setAvatarPreview(originalAvatar);
      setAvatarFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } else {
      try {
        await api.delete(`/employees/${id}/avatar`);
        setAvatarPreview(null);
        setOriginalAvatar(null);
        setAvatarFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        showNotification("success", "Zdjęcie profilowe zostało usunięte.");
      } catch (err) {
        showNotification("error", "Błąd podczas usuwania zdjęcia profilowego.");
      }
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="container-xl">
          <h1 className="page-title">Edycja danych pracownika</h1>
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
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Nazwisko</label>
                <input
                  type="text"
                  className="form-control"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">E-mail</label>
                <input
                  type="email"
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
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
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
                <label className="form-label">Nowe hasło (opcjonalnie)</label>
                <div className="input-group input-group-flat">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <span className="input-group-text">
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowPassword(!showPassword);
                      }}
                      className="link-secondary"
                    >
                      <i className={`ti ${showPassword ? "ti-eye-off" : "ti-eye"} fs-2`}></i>
                    </a>
                  </span>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Powtórz nowe hasło</label>
                <div className="input-group input-group-flat">
                  <input
                    type={showRepeatPassword ? "text" : "password"}
                    className="form-control"
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
                    >
                      <i className={`ti ${showRepeatPassword ? "ti-eye-off" : "ti-eye"} fs-2`}></i>
                    </a>
                  </span>
                </div>
              </div>

              <div className="mb-3">
                <h3 className="card-title">Zdjęcie profilowe</h3>
                <div className="row align-items-center">
                  {avatarPreview && (
                    <div className="col-auto">
                      <img
                        src={avatarPreview}
                        alt="Zdjęcie profilowe"
                        className="avatar shadow avatar-xl rounded"
                      />
                    </div>
                  )}
                  <div className="col-auto">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="form-control"
                      ref={fileInputRef}
                    />
                  </div>
                  <div className="col-auto">
                    <button
                      className="btn btn-1"
                      onClick={handleUploadAvatar}
                      disabled={!avatarFile}
                    >
                      Zapisz nowe zdjęcie profilowe
                    </button>
                  </div>
                  <div className="col-auto">
                    <button
                      className="btn btn-ghost-danger btn-3"
                      onClick={handleDeleteAvatar}
                      disabled={!avatarPreview || isDefaultAvatar}
                    >
                      Usuń zdjęcie profilowe
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-footer d-flex justify-content-end">
              <button className="btn btn-primary" onClick={handleSubmit}>
                Zapisz zmiany
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModifyEmployeeView;
