import React, { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { api } from "../services/api";
import { AxiosResponse } from "axios";

export enum RoleName {
  RECEPTIONIST = "RECEPTIONIST",
  HOUSEKEEPER = "HOUSEKEEPER",
  MAINTENANCE = "MAINTENANCE",
  MANAGER = "MANAGER",
}

interface Role {
  id: number;
  name: RoleName;
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: Role;
  avatarFilename?: string;
  avatarUrl: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  fetchUser: () => void;

  userId: number;
  userFirstName: string;
  userLastName: string;
  userEmail: string;
  userPhoneNumber: string;
  userRole: Role;
  userRoleName: RoleName;
  userAvatarFilename?: string;
  userAvatarUrl: string;
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

  const userId = user?.id ?? 0;
  const userFirstName = user?.firstName ?? "";
  const userLastName = user?.lastName ?? "";
  const userEmail = user?.email ?? "";
  const userPhoneNumber = user?.phoneNumber ?? "";
  const userRole = user?.role ?? { id: 0, name: RoleName.RECEPTIONIST };
  const userRoleName = user?.role?.name ?? RoleName.RECEPTIONIST;
  const userAvatarFilename = user?.avatarFilename ?? "";
  const userAvatarUrl = user?.avatarUrl ?? "";

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Opóźniamy sprawdzenie tokenu i pobieranie danych o sekundę
    const timeout = setTimeout(() => {
      if (token) {
        fetchUser();
      } else {
        setLoading(false);
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, []); // Uruchamia się tylko raz, przy pierwszym renderze komponentu

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        error,
        fetchUser,
        userId,
        userFirstName,
        userLastName,
        userEmail,
        userPhoneNumber,
        userRole,
        userRoleName,
        userAvatarFilename,
        userAvatarUrl,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
