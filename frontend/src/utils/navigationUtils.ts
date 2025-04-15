// Funkcja pomocnicza do sprawdzania, czy ścieżka zawiera frazę i nadania klasy "active"
export const getNavItemClass = (path: string, currentPath: string) => {
  // Sprawdzamy, czy path to główny dashboard ("/")
  if (path === "/") {
    return currentPath === path ? "nav-item active" : "nav-item";
  } else {
    return currentPath.includes(path) ? "nav-item active" : "nav-item";
  }
};
