import { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
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
  const [apiUrl, setApiUrl] = useState("");
  const [defaultApiUrl] = useState("http://localhost:8080");
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
    setApiUrl(config.API_URL || "");
  };

  const saveConfig = async () => {
    await window.electronAPI.setConfig({ API_URL: apiUrl });
    showNotification("success", "Zapisano konfigurację.");
    onClose();
    setStep("pin");
    setPin("");

    resetAxiosInstance();
    fetchUser();
  };

  const handleClose = () => {
    onClose();
    setStep("pin");
    setPin("");
  };

  return (
    <Modal className="modal-sm" show={show} onHide={handleClose} centered>
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
            <Form.Group controlId="apiUrlInput">
              <Form.Label>Adres backendu</Form.Label>
              <Form.Control
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
              />
              <Form.Text muted>
                Domyślny adres: <code>{defaultApiUrl}</code>
              </Form.Text>
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
                  <Button className="w-100" variant="success" onClick={saveConfig}>
                    Zapisz
                  </Button>
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
