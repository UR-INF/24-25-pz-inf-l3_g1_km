async function loginUser(email, password) {
	try {
		const response = await window.electronAPI.post("/auth/login", {
			email,
			password,
		});

		if (response && response.token) {
			console.log("Zalogowano pomyślnie!");

			// Przekazujemy token do main (electron-store)
			window.electronAPI.setToken(response.token);

			// Przenosimy użytkownika do strony głównej
			window.location.href = "../home/home.html";
		} else {
			console.log("Błąd logowania.")
			// alert("Błąd logowania! Spróbuj ponownie.");
		}
	} catch (error) {
		if (error.response && error.response.status === 401) {
			// alert("Nieprawidłowy login lub hasło.");
			return;
		}
		alert("Inny błąd.");
	}
}

function handleLoginFormSubmit(event) {
	event.preventDefault();
	const email = document.getElementById("email").value;
	const password = document.getElementById("password").value;

	loginUser(email, password);
}

document
	.getElementById("loginForm")
	.addEventListener("submit", handleLoginFormSubmit);
