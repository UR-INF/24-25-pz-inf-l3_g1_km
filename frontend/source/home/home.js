async function logoutUser() {
	try {
		const response = await window.electronAPI.post("/auth/logout");

		console.log("Odpowiedź z backendu:", response);

		if (response === "Wylogowano pomyślnie!") {
			console.log("Wylogowano pomyślnie!");

			window.electronAPI.clearToken();

			// Przekierowanie do ekranu logowania
			window.location.href = "../auth/login.html";
		} else {
			// alert('Błąd wylogowywania! Spróbuj ponownie.');
		}
	} catch (error) {
		console.error("Wystąpił błąd wylogowywania:", error);
		// alert('Wystąpił błąd wylogowywania! Spróbuj ponownie.');
	}
}

document.getElementById("logoutButton").addEventListener("click", logoutUser);
