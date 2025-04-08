import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/auth";
import { api } from "../services/api";
import { AxiosError } from "axios";

const LoginView = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [alertMessage, setAlertMessage] = useState<{
		text: string;
		type: "danger" | "success" | "warning" | "info";
		title?: string;
		details?: string[];
	} | null>(null);
	const navigate = useNavigate();
	const { login } = useAuth();

	const loginUser = async () => {
		try {
			const response = await api.post("/auth/login", {
				email,
				password,
			});

			if (response?.data?.token) {
				login({ email, token: response.data.token });
				navigate("/");
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
		}
	};

	const togglePasswordVisibility = () => {
		const passwordInput = document.getElementById(
			"password"
		) as HTMLInputElement;
		const eyeIcon = document.getElementById("eye-icon") as HTMLElement;
		const isHidden = passwordInput.type === "password";
		passwordInput.type = isHidden ? "text" : "password";
		eyeIcon.classList.toggle("ti-eye");
		eyeIcon.classList.toggle("ti-eye-off");
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
		<div className="page page-center d-flex justify-content-center align-items-center min-vh-100">
			<div className="container container-tight px-6">
				<h2 className="h2 text-center mb-4">Zaloguj się</h2>
				<form id="loginForm" onSubmit={handleSubmit} autoComplete="off">
					<div className="mb-3">
						<label className="form-label">E-mail</label>
						<input
							type="email"
							id="email"
							className="form-control"
							placeholder="wpisz email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
					</div>

					<div className="mb-2">
						<label className="form-label">
							Hasło
							<span className="form-label-description">
								<a
									href="#"
									id="forgotPassword"
									onClick={handlePasswordReset}>
									Zapomniałeś hasła?
								</a>
							</span>
						</label>

						<div className="input-group input-group-flat">
							<input
								type="password"
								id="password"
								className="form-control"
								placeholder="wpisz hasło"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
							<span className="input-group-text">
								<a
									href="#"
									id="toggle-password"
									onClick={togglePasswordVisibility}
									className="link-secondary"
									title="Pokaż hasło">
									<i
										id="eye-icon"
										className="ti ti-eye fs-2"></i>
								</a>
							</span>
						</div>
					</div>

					{alertMessage && (
						<div
							className={`alert alert-important alert-${alertMessage.type} alert-dismissible mt-3`}
							role="alert">
							<div className="alert-icon">
								<i className={`ti ${getAlertIcon()} fs-1`}></i>
							</div>
							<div>
								{alertMessage.title && (
									<h4 className="alert-heading">
										{alertMessage.title}
									</h4>
								)}
								<div className="alert-description">
									{alertMessage.text}
									{alertMessage.details && (
										<ul className="alert-list mt-2">
											{alertMessage.details.map(
												(detail, index) => (
													<li key={index}>
														{detail}
													</li>
												)
											)}
										</ul>
									)}
								</div>
							</div>
							<a
								className="btn-close"
								onClick={() => setAlertMessage(null)}
								aria-label="close"></a>
						</div>
					)}

					<div className="form-footer">
						<button type="submit" className="btn btn-primary w-100">
							Zaloguj
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default LoginView;
