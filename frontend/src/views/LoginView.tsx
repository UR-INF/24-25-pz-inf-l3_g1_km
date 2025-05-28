import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/auth";
import { api } from "../services/api";
import { AxiosError } from "axios";
import { useUser } from "../contexts/user";
import Titlebar from "../components/Titlebar";
import { useNotification } from "../contexts/notification";
import Footer from "../components/Footer";

const LoginView = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [alertMessage, setAlertMessage] = useState<{
    text: string;
    type: "danger" | "success" | "warning" | "info";
    title?: string;
    details?: string[];
  } | null>(null);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { fetchUser } = useUser();
  const { showNotification } = useNotification();
  const [showPassword, setShowPassword] = useState(false);

  const loginUser = async () => {
    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      if (response?.data?.token) {
        login({ email, token: response.data.token });

        // Pobieranie danych z /api/employee/me do kontekstu użytkownika
        fetchUser();

        navigate("/");
        showNotification("success", "Pomyślnie zalogowano do systemu!");
      } else {
        setAlertMessage({
          title: "Błąd logowania",
          text: "Nie udało się zalogować. Spróbuj ponownie.",
          type: "danger",
        });
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          setAlertMessage({
            title: "Błąd uwierzytelniania",
            text: "Nieprawidłowy e-mail lub hasło.",
            type: "danger",
            details: [
              "Sprawdź czy wprowadziłeś poprawny adres e-mail",
              "Upewnij się, że hasło jest poprawne",
            ],
          });
        } else {
          setAlertMessage({
            title: "Błąd serwera",
            text: "Wystąpił błąd serwera. Spróbuj później.",
            type: "danger",
          });
        }
      } else {
        setAlertMessage({
          title: "Nieznany błąd",
          text: "Wystąpił nieznany błąd.",
          type: "danger",
        });
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAlertMessage(null);
    loginUser();
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setAlertMessage({
        title: "Brak adresu e-mail",
        text: "Wprowadź najpierw swój adres e-mail.",
        type: "warning",
      });
      return;
    }

    setIsResettingPassword(true);

    try {
      await api.post("/auth/password/reset-request", { email });
      setAlertMessage({
        title: "Link wysłany",
        text: "Link do resetu hasła został wysłany na podany adres e-mail.",
        type: "success",
        details: [
          "Sprawdź swoją skrzynkę odbiorczą",
          "Jeśli nie widzisz wiadomości, sprawdź folder SPAM",
        ],
      });
    } catch (err) {
      setAlertMessage({
        title: "Błąd wysyłania",
        text: "Nie udało się wysłać linku resetującego.",
        type: "danger",
      });
    } finally {
      setIsResettingPassword(false);
    }
  };

  const getAlertIcon = () => {
    switch (alertMessage?.type) {
      case "danger":
        return "ti-alert-circle";
      case "success":
        return "ti-check";
      case "warning":
        return "ti-alert-triangle";
      case "info":
        return "ti-info-circle";
      default:
        return "ti-info-circle";
    }
  };

  return (
    <>
      <div className="sticky-top">
        <Titlebar />
      </div>

      <div className="page page-center" style={{ paddingBottom: "4.5rem" }}>
        <div className="container container-tight p-6">
          <div className="card">
            <form id="loginForm" onSubmit={handleSubmit} autoComplete="off">
              <div className="card-body">
                <h2 className="h2 text-center">Zaloguj się</h2>
                <div className="mb-3">
                  <label className="form-label required">E-mail</label>
                  <input
                    type="email"
                    id="email"
                    autoComplete="email"
                    className="form-control"
                    placeholder="wpisz e-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <style>
                  {`
                    @keyframes spin {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                    }
                    .spinner-rotate {
                      animation: spin 1s linear infinite;
                      display: inline-block;
                    }
                  `}
                </style>

                <div className="mb-2">
                  <label className="form-label">
                    Hasło
                    <span className="form-label-description">
                      <a
                        href="#"
                        id="forgotPassword"
                        onClick={handlePasswordReset}
                        className="d-inline-flex align-items-center"
                        style={{ pointerEvents: isResettingPassword ? "none" : "auto" }}
                      >
                        {isResettingPassword ? (
                          <>
                            <i className="ti ti-loader spinner-rotate me-1"></i>
                            Wysyłanie...
                          </>
                        ) : (
                          "Zapomniałeś hasła?"
                        )}
                      </a>
                    </span>
                  </label>

                  <div className="input-group input-group-flat">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      autoComplete="current-password"
                      className="form-control"
                      placeholder="wpisz hasło"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <span className="input-group-text">
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setShowPassword((prev) => !prev);
                        }}
                        className="link-secondary"
                        title={showPassword ? "Ukryj hasło" : "Pokaż hasło"}
                      >
                        <i className={`ti ${showPassword ? "ti-eye-off" : "ti-eye"} fs-2`} />
                      </a>
                    </span>
                  </div>
                </div>

                {alertMessage && (
                  <div
                    className={`alert alert-important alert-${alertMessage.type} alert-dismissible mt-3`}
                    role="alert"
                  >
                    <div className="alert-icon">
                      <i className={`ti ${getAlertIcon()} fs-1`}></i>
                    </div>
                    <div>
                      {alertMessage.title && (
                        <h4 className="alert-heading">{alertMessage.title}</h4>
                      )}
                      <div className="alert-description">
                        {alertMessage.text}
                        {alertMessage.details && (
                          <ul className="alert-list mt-2">
                            {alertMessage.details.map((detail, index) => (
                              <li key={index}>{detail}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                    <a
                      className="btn-close"
                      onClick={() => setAlertMessage(null)}
                      aria-label="close"
                    ></a>
                  </div>
                )}
              </div>

              <div className="card-footer">
                <button type="submit" className="btn btn-primary w-100">
                  Zaloguj
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default LoginView;
