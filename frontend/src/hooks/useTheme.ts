import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const useTheme = () => {
  const getSystemTheme = (): Theme => {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  };

  const [theme, setTheme] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem("theme") as Theme;
    return storedTheme || getSystemTheme();
  });

  const [isSystemPreferred, setIsSystemPreferred] = useState<boolean>(() => {
    const systemPreference = localStorage.getItem("useSystemTheme") === "true";
    return systemPreference;
  });

  useEffect(() => {
    if (isSystemPreferred) {
      const systemTheme = getSystemTheme();
      setTheme(systemTheme);
    }
  }, [isSystemPreferred]);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.setAttribute("data-bs-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
    setIsSystemPreferred(false);
  };

  const toggleSystemPreference = () => {
    setIsSystemPreferred((prev) => !prev);
    localStorage.setItem("useSystemTheme", !isSystemPreferred ? "true" : "false");
  };

  return { theme, toggleTheme, toggleSystemPreference, isSystemPreferred };
};

export default useTheme;
