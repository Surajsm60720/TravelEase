import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "dark",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const { user } = useAuth();
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [loading, setLoading] = useState(true);

  // Load theme preference from database
  useEffect(() => {
    async function loadThemePreference() {
      if (!user) {
        const localTheme = localStorage.getItem(storageKey) as Theme;
        setTheme(localTheme || defaultTheme);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("user_preferences")
          .select("theme")
          .eq("user_id", user.id)
          .single();

        if (error) throw error;

        if (data) {
          setTheme(data.theme as Theme);
          localStorage.setItem(storageKey, data.theme);
        } else {
          // Create initial preference
          const localTheme = localStorage.getItem(storageKey) as Theme;
          const initialTheme = localTheme || defaultTheme;
          await supabase
            .from("user_preferences")
            .insert([{ user_id: user.id, theme: initialTheme }]);
          setTheme(initialTheme);
        }
      } catch (error) {
        console.error("Error loading theme preference:", error);
      } finally {
        setLoading(false);
      }
    }

    loadThemePreference();
  }, [user, defaultTheme, storageKey]);

  useEffect(() => {
    const root = window.document.documentElement;
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";

    root.classList.remove("light", "dark");
    root.classList.add(theme === "system" ? systemTheme : theme);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        root.classList.remove("light", "dark");
        root.classList.add(mediaQuery.matches ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const value = {
    theme,
    setTheme: async (newTheme: Theme) => {
      setTheme(newTheme);
      localStorage.setItem(storageKey, newTheme);

      if (user) {
        try {
          const { error } = await supabase.from("user_preferences").upsert(
            {
              user_id: user.id,
              theme: newTheme,
            },
            {
              onConflict: "user_id",
            },
          );

          if (error) throw error;
        } catch (error) {
          console.error("Error saving theme preference:", error);
        }
      }
    },
  };

  if (loading) {
    return null;
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
