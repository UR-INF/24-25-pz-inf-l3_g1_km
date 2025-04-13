import { RoleName } from "../contexts/user";

export const getRoleNameInPolish = (role: RoleName): string => {
  const roleMap: Record<RoleName, string> = {
    [RoleName.RECEPTIONIST]: "Recepcjonista",
    [RoleName.HOUSEKEEPER]: "Pokojówka",
    [RoleName.MAINTENANCE]: "Konserwator",
    [RoleName.MANAGER]: "Menedżer",
  };

  return roleMap[role] ?? "Nieznana rola";
};
