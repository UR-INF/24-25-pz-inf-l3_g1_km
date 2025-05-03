import { RoleName, useUser } from "../contexts/user";
import { getRoleNameInPolish } from "../utils/roleUtils";
import { api } from "../services/api";
import { useState, useEffect } from "react";
import { useNotification } from "../contexts/notification";
import { validateEmailFormat } from "../utils/regexUtils";
import { useTheme } from "../contexts/theme";

const SettingsView = () => {
  const {
    userId,
    userFirstName,
    userLastName,
    userRoleName,
    userEmail,
    fetchUser,
    userAvatarFilename,
    userAvatarUrl,
    userNotificationsEnabled,
  } = useUser();

  const { themeMode, setTheme } = useTheme();

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [email, setEmail] = useState(userEmail);
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const { showNotification } = useNotification();

  const handleToggleNotifications = async () => {
    if (!("Notification" in window)) {
      showNotification("error", "Twój system nie obsługuje powiadomień.");
      return;
    }

    let granted = Notification.permission === "granted";
    if (!granted) {
      const permission = await Notification.requestPermission();
      granted = permission === "granted";
      if (!granted) {
        showNotification("error", "Nie udzielono zgody na powiadomienia.");
        return;
      }
    }

    try {
      const updated = !userNotificationsEnabled;
      await api.put("/employees/me/notifications", {
        notificationsEnabled: updated,
      });
      showNotification("success", updated ? "Powiadomienia włączone." : "Powiadomienia wyłączone.");
      await fetchUser();
    } catch (err) {
      console.error("Błąd podczas zapisu ustawień powiadomień:", err);
      showNotification("error", "Wystąpił błąd podczas zapisu ustawień.");
    }
  };

  const avatarUrl = avatarPreview ?? userAvatarUrl;

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      showNotification("error", "Hasło musi zawierać co najmniej 6 znaków.");
      return;
    }
    if (newPassword !== repeatPassword) {
      showNotification("error", "Hasła nie są identyczne.");
      return;
    }

    try {
      await api.put(`/employees/${userId}/password`, {
        password: newPassword,
      });
      showNotification("success", "Hasło zostało pomyślnie zmienione.");

      setNewPassword("");
      setRepeatPassword("");
    } catch (err) {
      console.error("Błąd podczas zmiany hasła:", err);
      showNotification("error", "Wystąpił błąd podczas zmiany hasła.");
    }
  };

  const handleChangeEmail = async () => {
    if (!validateEmailFormat(email)) {
      showNotification("error", "Podaj poprawny adres e-mail.");
      return;
    }

    if (email.toLowerCase() === userEmail.toLowerCase()) {
      showNotification("error", "Podany adres e-mail jest taki sam jak aktualny.");
      return;
    }

    try {
      const response = await api.put(`/employees/${userId}/email`, {
        email: email,
      });

      if (response.data && response.data.token) {
        localStorage.setItem("token", response.data.token);

        showNotification("success", "E-mail został zmieniony i sesja została odświeżona.");
      } else {
        showNotification("success", "E-mail został pomyślnie zaktualizowany.");
      }
    } catch (err: any) {
      console.error("Błąd podczas zmiany e-maila:", err);

      if (err.response?.status === 400) {
        showNotification("error", err.response.data || "Nieprawidłowy adres e-mail.");
      } else {
        showNotification("error", "Wystąpił błąd podczas zmiany e-maila.");
      }
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));

      showNotification(
        "info",
        "Wybrane zdjęcie profilowe zostało załadowane. Zatwierdź zmiany przyciskając 'Zapisz nowe zdjęcie profilowe'.",
        5000,
      );
    }
  };

  const handleUploadAvatar = async () => {
    if (!avatarFile) return;

    const formData = new FormData();
    formData.append("file", avatarFile);

    try {
      await api.post(`/employees/${userId}/avatar`, formData);

      showNotification("success", "Zdjęcie profilowe zostało zaktualizowane.");
      fetchUser();
    } catch (err) {
      console.error("Błąd podczas aktualizacji zdjęcia profilowego:", err);
      showNotification("error", "Wystąpił błąd podczas aktualizacji zdjęcia profilowego.");
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      await api.delete(`/employees/${userId}/avatar`);
      setAvatarPreview(null);
      setAvatarFile(null);
      showNotification("success", "Zdjęcie profilowe zostało usunięte.");
      fetchUser(); // odśwież dane
    } catch (err) {
      console.error("Błąd podczas usuwania zdjęcia profilowego:", err);
      showNotification("error", "Wystąpił błąd podczas usuwania zdjęcia profilowego.");
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="container-xl">
          <div className="row g-2 align-items-center">
            <div className="col">
              <h1 className="page-title">Ustawienia</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="page-body">
        <div className="container-xl">
          <div className="card">
            <div className="card-body">
              {/* Sekcja zdjęcia profilowego */}
              <h3 className="card-title">Szczegóły konta</h3>
              <div className="row align-items-center">
                <div className="col-auto">
                  <img
                    src={avatarUrl}
                    alt="Zdjęcie profilowe"
                    className="avatar shadow avatar-xl rounded"
                  />
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
                    Zapisz nowe zdjęcie profilowe
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

              {/* Sekcja danych użytkownika */}
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

              {/* Sekcja adresu e-mail */}
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

              {/* Sekcja hasła */}
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

              {/* Sekcja motywu */}
              <div>
                <div className="theme-settings mt-4">
                  <h3 className="card-title mt-4">Motyw</h3>
                  <div className="row g-3">
                    <div className="col-auto">
                      <div className="form-check">
                        <input
                          type="radio"
                          id="theme-light"
                          name="theme"
                          value="light"
                          checked={themeMode === "light"}
                          onChange={() => setTheme("light")}
                          className="form-check-input"
                        />
                        <label className="form-check-label" htmlFor="theme-light">
                          Jasny motyw
                        </label>
                      </div>
                    </div>

                    <div className="col-auto">
                      <div className="form-check">
                        <input
                          type="radio"
                          id="theme-dark"
                          name="theme"
                          value="dark"
                          checked={themeMode === "dark"}
                          onChange={() => setTheme("dark")}
                          className="form-check-input"
                        />
                        <label className="form-check-label" htmlFor="theme-dark">
                          Ciemny motyw
                        </label>
                      </div>
                    </div>

                    <div className="col-auto">
                      <div className="form-check">
                        <input
                          type="radio"
                          id="theme-system"
                          name="theme"
                          value="system"
                          checked={themeMode === "system"}
                          onChange={() => setTheme("system")}
                          className="form-check-input"
                        />
                        <label className="form-check-label" htmlFor="theme-system">
                          Automatyczny (motyw systemowy)
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sekcja powiadomień */}
              {(userRoleName === RoleName.HOUSEKEEPER || userRoleName === RoleName.MAINTENANCE) && (
                <>
                  <h3 className="card-title mt-4">Powiadomienia systemowe</h3>
                  <p className="text-muted">
                    Włączenie tej opcji pozwoli na otrzymywanie powiadomień systemowych, gdy
                    zostanie dodane nowe zadanie dla konserwatora lub pokojówki. Powiadomienia te
                    pojawiają się na Twoim urządzeniu, np. w systemie Windows w formie komunikatu
                    nad zegarkiem.
                  </p>

                  <div className="form-check form-switch d-flex align-items-center gap-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="notificationSwitch"
                      checked={userNotificationsEnabled}
                      onChange={handleToggleNotifications}
                    />
                    <span>{userNotificationsEnabled ? "Włączone" : "Wyłączone"}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
