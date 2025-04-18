import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { AuthProvider } from "./contexts/auth.tsx";
import { UserProvider } from "./contexts/user.tsx";
import { AuthInterceptor } from "./components/AuthInterceptor.tsx";
import { NotificationProvider } from "./contexts/notification";
import { BrowserRouter } from "react-router";
import "./assets/notifications.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <NotificationProvider>
        <AuthProvider>
          <AuthInterceptor />
          <UserProvider>
            <App />
          </UserProvider>
        </AuthProvider>
      </NotificationProvider>
    </BrowserRouter>
  </React.StrictMode>,
);

// Use contextBridge
window.ipcRenderer.on("main-process-message", (_event, message) => {
  console.log(message);
});
