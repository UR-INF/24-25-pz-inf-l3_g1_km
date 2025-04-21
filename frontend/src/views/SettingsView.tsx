import { useUser } from "../contexts/user";
import { getRoleNameInPolish } from "../utils/roleUtils";
import { api } from "../services/api";
import { useState } from "react";

const SettingsView = () => {
  const {
    user,
    userId,
    userFirstName,
    userLastName,
    userRoleName,
    userEmail,
    fetchUser,
    userAvatarFilename,
  } = useUser();

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [email, setEmail] = useState(userEmail);
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [message, setMessage] = useState("");

  const avatarUrl = avatarPreview ?? user?.avatarUrl;

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      setMessage("Hasło musi zawierać co najmniej 6 znaków.");
      return;
    }
    if (newPassword !== repeatPassword) {
      setMessage("Hasła nie są identyczne.");
      return;
    }

    try {
      await api.put(`/employees/${userId}/password`, {
        password: newPassword,
      });

      setMessage("Hasło zostało pomyślnie zmienione.");
      setNewPassword("");
      setRepeatPassword("");
    } catch (err) {
      console.error("Błąd podczas zmiany hasła:", err);
      setMessage("Wystąpił błąd podczas zmiany hasła.");
    }
  };

  const validateEmailFormat = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChangeEmail = async () => {
    if (!validateEmailFormat(email)) {
      setMessage("Podaj poprawny adres e-mail.");
      return;
    }

    try {
      await api.put(`/employees/${userId}/email`, {
        email: email,
      });

      setMessage("E-mail został pomyślnie zaktualizowany.");
    } catch (err: any) {
      console.error("Błąd podczas zmiany e-maila:", err);

      if (err.response?.status === 400) {
        setMessage(err.response.data || "Nieprawidłowy adres e-mail.");
      } else {
        setMessage("Wystąpił błąd podczas zmiany e-maila.");
      }
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleUploadAvatar = async () => {
    if (!avatarFile) return;

    const formData = new FormData();
    formData.append("file", avatarFile);

    try {
      await api.post(`/employees/${userId}/avatar`, formData);

      setMessage("Avatar został zaktualizowany.");
      fetchUser();
    } catch (err) {
      console.error("Błąd podczas aktualizacji avatara:", err);
      setMessage("Wystąpił błąd podczas aktualizacji avatara.");
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      await api.delete(`/employees/${userId}/avatar`);
      setAvatarPreview(null);
      setAvatarFile(null);
      setMessage("Avatar został usunięty.");
      fetchUser(); // odśwież dane
    } catch (err) {
      console.error("Błąd podczas usuwania avatara:", err);
      setMessage("Wystąpił błąd podczas usuwania avatara.");
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header d-print-none">
        <div className="container-xl">
          <div className="row g-2 align-items-center">
            <div className="col">
              {message && <div className="alert alert-info mt-3">{message}</div>}
              <h1 className="page-title">Ustawienia</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="page-body">
        <div className="container-xl">
          <div className="card">
            <div className="card-body">
              <h3 className="card-title">Szczegóły konta</h3>
              <div className="row align-items-center">
                <div className="col-auto">
                  <img src={avatarUrl} alt="Avatar" className="avatar avatar-xl rounded" />
                </div>
                <div className="col-auto">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="form-control"
                  />
                </div>
                <div className="col-auto">
                  <button className="btn btn-1" onClick={handleUploadAvatar}>
                    Zapisz nowy avatar
                  </button>
                </div>
                <div className="col-auto">
                  <button
                    className="btn btn-ghost-danger btn-3"
                    onClick={handleDeleteAvatar}
                    disabled={!userAvatarFilename}
                  >
                    Usuń zdjęcie profilowe
                  </button>
                </div>
              </div>
              <h3 className="card-title mt-4">Twoje dane</h3>
              <div className="row g-3">
                <div className="col-md">
                  <div className="form-label">Imię</div>
                  <input type="text" className="form-control" value={userFirstName} disabled />
                </div>
                <div className="col-md">
                  <div className="form-label">Nazwisko</div>
                  <input type="text" className="form-control" value={userLastName} disabled />
                </div>
                <div className="col-md">
                  <div className="form-label">Stanowisko</div>
                  <input
                    type="text"
                    className="form-control"
                    value={getRoleNameInPolish(userRoleName)}
                    disabled
                  />
                </div>
              </div>
              <h3 className="card-title mt-4">Email</h3>
              <p className="card-subtitle">
                Za pomocą tego adresu e-mail odbywa się logowanie do serwisu.
              </p>
              <div>
                <div className="row g-2">
                  <div className="col-auto">
                    <input
                      type="text"
                      className="form-control w-auto"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="col-auto">
                    <button className="btn btn-1" onClick={handleChangeEmail}>
                      Zmień
                    </button>
                  </div>
                </div>
              </div>
              <h3 className="card-title mt-4">Hasło</h3>
              <p className="card-subtitle">
                Zmień hasło, jeśli uważasz że osoba nieupoważniona może je znać.
              </p>
              <div>
                <div className="row g-2">
                  <div className="col-auto">
                    <p className="card-subtitle">Nowe hasło:</p>
                    <input
                      type="password"
                      className="form-control w-auto"
                      placeholder="Nowe hasło"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="col-auto">
                    <p className="card-subtitle">Powtórz hasło:</p>
                    <input
                      type="password"
                      className="form-control w-auto"
                      placeholder="Powtórz hasło"
                      value={repeatPassword}
                      onChange={(e) => setRepeatPassword(e.target.value)}
                    />
                  </div>
                  <div className="col-auto">
                    <p className="card-subtitle">
                      Hasło powinno składać się z co najmniej 6 znaków.
                    </p>
                    <button className="btn btn-1" onClick={handleChangePassword}>
                      Zmień
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
