import { createContext, useContext, useReducer, useEffect, ReactNode, useRef } from "react";
import { useNotification } from "./notification";

/**
 * Reprezentuje użytkownika z adresem email i tokenem JWT.
 */
interface User {
  email: string;
  token: string;
}

/**
 * Stan autoryzacji.
 */
interface AuthState {
  loggedIn: boolean;
  user: User | null;
  loading: boolean;
}

/**
 * Akcje autoryzacyjne.
 */
type AuthAction =
  | { type: "LOGIN"; payload: User }
  | { type: "LOGOUT" }
  | { type: "SET_LOADING"; payload: boolean };

const initialState: AuthState = {
  loggedIn: false,
  user: null,
  loading: true,
};

/**
 * Reducer do obsługi logowania i wylogowywania.
 */
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "LOGIN":
      return {
        loggedIn: true,
        user: action.payload,
        loading: false,
      };
    case "LOGOUT":
      return {
        loggedIn: false,
        user: null,
        loading: false,
      };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

/**
 * Typ kontekstu autoryzacji.
 */
interface AuthContextType {
  state: AuthState;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Sprawdza, czy token JWT wygasł.
 */
const isTokenExpired = (token: string): boolean => {
  try {
    const payloadBase64 = token.split(".")[1];
    const decoded = JSON.parse(atob(payloadBase64));
    const now = Date.now() / 1000;
    return decoded.exp < now;
  } catch {
    return true; // Jeśli błąd — traktujemy jako wygasły
  }
};

/**
 * Provider otaczający aplikację.
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const { showNotification } = useNotification();
  const didRunRef = useRef(false);

  const login = (user: User) => {
    localStorage.setItem("token", user.token);
    dispatch({ type: "LOGIN", payload: user });
  };

  const logout = () => {
    localStorage.removeItem("token");
    dispatch({ type: "LOGOUT" });
  };

  // Automatyczne logowanie przy starcie aplikacji
  useEffect(() => {
    if (didRunRef.current) return;
    didRunRef.current = true;

    const token = localStorage.getItem("token");
    dispatch({ type: "SET_LOADING", payload: true });

    if (token && !isTokenExpired(token)) {
      console.log("token: ", token);
      const payload = JSON.parse(atob(token.split(".")[1]));
      const email = payload.email;
      dispatch({ type: "LOGIN", payload: { email, token } });

      showNotification("success", "Pomyślnie zalogowano do systemu!");
    } else {
      logout();
    }
  }, []);

  return <AuthContext.Provider value={{ state, login, logout }}>{children}</AuthContext.Provider>;
};

/**
 * Hook do używania kontekstu.
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
