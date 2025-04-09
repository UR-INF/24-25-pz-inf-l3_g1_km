import React, { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { api } from "../services/api";
import { AxiosResponse } from "axios";

// Typy dla danych użytkownika
interface Role {
  id: number;
  name: string;
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: Role;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  fetchUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Funkcja do pobrania danych o użytkowniku
  const fetchUser = async () => {
    try {
      setLoading(true);
      const response: AxiosResponse<User> = await api.get("/employees/me");
      setUser(response.data);
      setError(null); // Resetujemy błąd po udanym pobraniu danych
    } catch (error) {
      setError("Nie udało się pobrać danych użytkownika.");
      setUser(null); // Resetujemy dane użytkownika, jeśli wystąpił błąd
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUser(); // Jeśli użytkownik jest zalogowany (ma token), pobierz dane
    } else {
      setLoading(false); // Jeśli nie ma tokena, zakończ ładowanie
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, error, fetchUser }}>
      {children}
    </UserContext.Provider>
  );
};
