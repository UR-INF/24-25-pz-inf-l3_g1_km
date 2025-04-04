/**
 * Wyświetla alert w formie toasta w prawym górnym rogu
 * @param {"success"|"danger"|"warning"|"info"} type
 * @param {string} message
 * @param {number} duration czas widoczności w ms (domyślnie 4000)
 */
export function showAlert(type, message, duration = 4000) {
	const icons = {
		success: "ti-check",
		danger: "ti-alert-circle",
		warning: "ti-alert-triangle",
		info: "ti-info-circle",
	};

	const toastId = `toast-${Date.now()}`;

	const toast = document.createElement("div");
	toast.className = `toast align-items-center text-bg-${type} border-0 show fade`;
	toast.setAttribute("role", "alert");
	toast.setAttribute("aria-live", "assertive");
	toast.setAttribute("aria-atomic", "true");
	toast.id = toastId;
	toast.innerHTML = `
		<div class="d-flex">
			<div class="toast-body d-flex align-items-center gap-2">
				<i class="ti ${icons[type]} fs-4"></i>
				<span>${message}</span>
			</div>
			<button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
		</div>
	`;

	const container = getOrCreateToastContainer();
	container.appendChild(toast);

	const bsToast = new bootstrap.Toast(toast, {
		delay: duration,
		autohide: duration === 0 ? false : true,
	});

	bsToast.show();

	if (duration > 0) {
		// automatyczne usunięcie z DOM po zniknięciu
		setTimeout(() => toast.remove(), duration + 500);
	}
}

function getOrCreateToastContainer() {
	let container = document.getElementById("toast-container");
	if (!container) {
		container = document.createElement("div");
		container.id = "toast-container";
		container.className =
			"toast-container position-fixed top-0 start-50 translate-middle-x p-2";
		document.body.appendChild(container);
	}
	return container;
}
