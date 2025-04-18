import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import NotificationContainer from "../components/NotificationContainer";

type NotificationType = "success" | "error" | "warning" | "info";

/**
 * Reprezentuje jedno powiadomienie.
 */
interface Notification {
  id: number;
  type: NotificationType;
  message: string;
}

/**
 * API udostępniane przez kontekst powiadomień.
 */
interface NotificationContextType {
  showNotification: (type: NotificationType, message: string, timeout?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);
let nextId = 0;

/**
 * Provider odpowiedzialny za trzymanie i wyświetlanie powiadomień.
 * @param children Komponenty potomne
 */
export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  /**
   * Wyświetla nowe powiadomienie.
   * @param type Typ powiadomienia (success, error, warning, info)
   * @param message Treść komunikatu
   * @param timeout Czas trwania w ms (domyślnie 3000); jeśli -1, powiadomienie nie zniknie automatycznie
   */
  const showNotification = (type: NotificationType, message: string, timeout = 3000) => {
    const id = nextId++;
    setNotifications((prev) => [...prev, { id, type, message }]);

    if (timeout !== -1) {
      setTimeout(() => {
        // Wywołaj animację wyjścia
        const exitEvent = new CustomEvent("notification-exit", { detail: id });
        window.dispatchEvent(exitEvent);
      }, timeout - 400); // odejmujemy czas na animację
    }

    // console.log(`Powiadomienie: ${type} - ${message}`);
  };

  useEffect(() => {
    const listener = (e: Event) => {
      const id = (e as CustomEvent).detail;
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    window.addEventListener("notification-remove", listener);
    return () => window.removeEventListener("notification-remove", listener);
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <NotificationContainer notifications={notifications} />
    </NotificationContext.Provider>
  );
};

/**
 * Hook pozwalający na korzystanie z powiadomień.
 * @returns Funkcja `showNotification`
 */
export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotification must be used within a NotificationProvider");
  return context;
};
