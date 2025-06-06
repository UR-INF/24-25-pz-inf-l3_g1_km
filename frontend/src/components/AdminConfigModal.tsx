import { useState } from "react";
import { Modal, Button, Form, InputGroup } from "react-bootstrap";
import { useNotification } from "../contexts/notification";
import { resetAxiosInstance } from "../services/api";
import { useUser } from "../contexts/user";

type Props = {
  show: boolean;
  onClose: () => void;
};

const PIN_CODE = "2137";

const AdminConfigModal = ({ show, onClose }: Props) => {
  const [step, setStep] = useState<"pin" | "config">("pin");
  const [pin, setPin] = useState("");
  const [apiHost, setApiHost] = useState("");
  const [jarPath, setJarPath] = useState("");
  const [backendPort, setBackendPort] = useState<number>(8080);
  const [defaultApiHost] = useState("http://localhost");
  const [dbHost, setDbHost] = useState("");
  const [dbName, setDbName] = useState("");
  const [dbUser, setDbUser] = useState("");
  const [dbPass, setDbPass] = useState("");

  const { showNotification } = useNotification();
  const { fetchUser } = useUser();

  const handlePinSubmit = () => {
    if (pin === PIN_CODE) {
      setStep("config");
      loadConfig();
      showNotification("success", "PIN poprawny. Możesz teraz edytować konfigurację.");
    } else {
      showNotification("error", "Podano błędny PIN. Spróbuj ponownie.");
    }
  };

  const loadConfig = async () => {
    const config = await window.electronAPI.getConfig();
    setApiHost(config.API_HOST || "");
    setJarPath(config.JAR_PATH || "");
    setBackendPort(config.BACKEND_PORT || 8080);
    setDbHost(config.DB_HOST || "");
    setDbName(config.DB_NAME || "");
    setDbUser(config.DB_USER || "");
    setDbPass(config.DB_PASS || "");
  };

  const saveConfig = async () => {
    await window.electronAPI.setConfig({
      API_HOST: apiHost,
      JAR_PATH: jarPath,
      BACKEND_PORT: backendPort,
      DB_HOST: dbHost,
      DB_NAME: dbName,
      DB_USER: dbUser,
      DB_PASS: dbPass,
    });

    showNotification("success", "Zapisano konfigurację.");
    onClose();
    setStep("pin");
    setPin("");

    resetAxiosInstance();
    fetchUser();
  };

  const testDbConnection = async () => {
    try {
      const result = await window.electronAPI.testDbConnection({
        host: dbHost,
        name: dbName,
        user: dbUser,
        pass: dbPass,
      });

      if (result.success) {
        showNotification("success", "Połączenie z bazą danych działa.");
      } else {
        showNotification("error", "Błąd połączenia z bazą danych: " + result.error);
      }
    } catch (error) {
      showNotification("error", "Nie udało się przetestować połączenia z bazą danych.");
    }
  };

  const handleClose = () => {
    onClose();
    setStep("pin");
    setPin("");
  };

  const handleSelectJar = async () => {
    const selectedPath = await window.electronAPI.selectJarPath();
    if (selectedPath) setJarPath(selectedPath);
  };

  const testApiConnection = async () => {
    const fullUrl = `${apiHost}:${backendPort}/actuator/health`;
    try {
      const response = await fetch(fullUrl);
      const json = await response.json();

      if (json.status === "UP") {
        showNotification("success", "Połączenie z backendem działa!");
      } else {
        showNotification(
          "warning",
          "Połączenie nawiązane, ale backend zwrócił nieoczekiwany status.",
        );
      }
    } catch (error) {
      showNotification("error", "Nie udało się połączyć z backendem.");
    }
  };

  return (
    <Modal
      className={`modal${step === "pin" ? "-sm" : ""}`}
      show={show}
      onHide={handleClose}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Panel administracyjny</Modal.Title>
      </Modal.Header>

      <div className="modal-status bg-danger"></div>

      {step === "pin" && (
        <>
          <Modal.Body>
            <Form.Group controlId="pinInput">
              <Form.Label>Wprowadź PIN</Form.Label>
              <Form.Control
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                maxLength={4}
                autoFocus
              />
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <div className="w-100">
              <div className="row">
                <div className="col">
                  <Button className="w-100" variant="" onClick={handleClose}>
                    Anuluj
                  </Button>
                </div>
                <div className="col">
                  <Button className="w-100" variant="danger" onClick={handlePinSubmit}>
                    Zatwierdź
                  </Button>
                </div>
              </div>
            </div>
          </Modal.Footer>
        </>
      )}

      {step === "config" && (
        <>
          <Modal.Body>
            <Form>
              <div className="row">
                <div className="col-md-6">
                  <Form.Group controlId="apiHostInput" className="mb-3">
                    <Form.Label>Adres backendu (bez portu)</Form.Label>
                    <Form.Control
                      type="text"
                      value={apiHost}
                      onChange={(e) => setApiHost(e.target.value)}
                    />
                    <Form.Text muted>
                      Domyślny adres: <code>{defaultApiHost}</code>
                    </Form.Text>
                  </Form.Group>

                  <Form.Group controlId="portInput" className="mb-3">
                    <Form.Label>Port backendu</Form.Label>
                    <Form.Control
                      type="number"
                      value={backendPort}
                      onChange={(e) => setBackendPort(parseInt(e.target.value))}
                      min={1}
                      max={65535}
                    />
                  </Form.Group>
                </div>

                <div className="col-md-6">
                  <p className="text-muted mb-3">
                    Te ustawienia są wymagane tylko, jeśli backend uruchamiany jest lokalnie.
                  </p>

                  <Form.Group controlId="jarPathInput" className="mb-3">
                    <Form.Label>Ścieżka do pliku .jar</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type="text"
                        value={jarPath}
                        onChange={(e) => setJarPath(e.target.value)}
                      />
                      <Button variant="secondary" onClick={handleSelectJar}>
                        Wybierz
                      </Button>
                    </InputGroup>
                    <Form.Text muted>
                      Przykład: <code>C:\HotelApp\backend\application.jar</code>
                    </Form.Text>
                  </Form.Group>

                  <Form.Group controlId="dbHost" className="mb-3">
                    <Form.Label>Host bazy danych</Form.Label>
                    <Form.Control
                      type="text"
                      value={dbHost}
                      onChange={(e) => setDbHost(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group controlId="dbName" className="mb-3">
                    <Form.Label>Nazwa bazy danych</Form.Label>
                    <Form.Control
                      type="text"
                      value={dbName}
                      onChange={(e) => setDbName(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group controlId="dbUser" className="mb-3">
                    <Form.Label>Użytkownik</Form.Label>
                    <Form.Control
                      type="text"
                      value={dbUser}
                      onChange={(e) => setDbUser(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group controlId="dbPass" className="mb-3">
                    <Form.Label>Hasło</Form.Label>
                    <Form.Control
                      type="password"
                      value={dbPass}
                      onChange={(e) => setDbPass(e.target.value)}
                    />
                  </Form.Group>
                </div>
              </div>
            </Form>
          </Modal.Body>

          <Modal.Footer>
            <div className="w-100">
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <div className="d-grid gap-2">
                    <Button variant="secondary" onClick={handleClose}>
                      Anuluj
                    </Button>
                    <Button variant="success" onClick={saveConfig}>
                      Zapisz
                    </Button>
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="d-grid gap-2">
                    <Button variant="primary" onClick={testApiConnection}>
                      Testuj połączenie z backendem
                    </Button>
                    <Button variant="secondary" onClick={testDbConnection}>
                      Testuj połączenie z bazą danych
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Modal.Footer>
        </>
      )}
    </Modal>
  );
};

export default AdminConfigModal;
