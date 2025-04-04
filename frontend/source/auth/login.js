import { showAlert } from "../shared/alertService.js";

// logowanie użytkownika
async function loginUser(email, password) {
	try {
		const response = await window.electronAPI.post("/auth/login", {
			email,
			password,
		});

		if (response?.token) {
			window.electronAPI.setToken(response.token);
			window.location.href = "../home/home.html";
		} else {
			showAlert("danger", "Nie udało się zalogować. Spróbuj ponownie.");
		}
	} catch (error) {
		if (error.response?.status === 401) {
			showAlert("danger", "Nieprawidłowy e-mail lub hasło.");
		} else {
			showAlert("danger", "Wystąpił błąd serwera. Spróbuj później.");
		}
	}
}

// resetowanie hasła
async function handlePasswordReset() {
	const email = document.getElementById("email").value;

	if (!email) {
		showAlert("warning", "Wprowadź najpierw swój adres e-mail.");
		return;
	}

	try {
		await window.electronAPI.post("/auth/password/reset-request", {
			email,
		});
		showAlert("info", "Link do resetu hasła został wysłany.");
	} catch (err) {
		showAlert(
			"danger",
			err?.response?.data || "Nie udało się wysłać linku resetującego."
		);
	}
}

// obsługa formularza logowania
function handleLoginFormSubmit(event) {
	event.preventDefault();
	const email = document.getElementById("email").value;
	const password = document.getElementById("password").value;
	loginUser(email, password);
}

// obsługa przełącznika widoczności hasła
document.addEventListener("DOMContentLoaded", () => {
	document
		.getElementById("loginForm")
		.addEventListener("submit", handleLoginFormSubmit);
	document.getElementById("forgotPassword").addEventListener("click", (e) => {
		e.preventDefault();
		handlePasswordReset();
	});

	const toggle = document.getElementById("toggle-password");
	const passwordInput = document.getElementById("password");
	const eyeIcon = document.getElementById("eye-icon");

	toggle.addEventListener("click", (e) => {
		e.preventDefault();
		const isHidden = passwordInput.type === "password";
		passwordInput.type = isHidden ? "text" : "password";
		toggle.title = isHidden ? "Ukryj hasło" : "Pokaż hasło";
		eyeIcon.classList.toggle("ti-eye");
		eyeIcon.classList.toggle("ti-eye-off");
	});
});
