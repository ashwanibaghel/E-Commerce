import { Moon, Sun } from 'lucide-react';
import React from 'react';

const STORAGE_KEY = 'baghel-theme';

export default function ThemeToggle() {
  const [theme, setTheme] = React.useState<'dark' | 'light'>('dark');

  React.useEffect(() => {
    const requestedTheme = new URL(window.location.href).searchParams.get(
      'theme'
    );
    const storedTheme = window.localStorage.getItem(STORAGE_KEY);
    const initialTheme =
      requestedTheme === 'light' || requestedTheme === 'dark'
        ? requestedTheme
        : storedTheme === 'light'
          ? 'light'
          : 'dark';
    setTheme(initialTheme);
    document.documentElement.dataset.baghelTheme = initialTheme;
    window.localStorage.setItem(STORAGE_KEY, initialTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.dataset.baghelTheme = nextTheme;
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
  };

  return (
    <button
      type="button"
      className="baghel-theme-toggle"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      title={theme === 'dark' ? 'Light theme' : 'Dark theme'}
    >
      {theme === 'dark' ? (
        <Sun size={18} aria-hidden="true" />
      ) : (
        <Moon size={18} aria-hidden="true" />
      )}
    </button>
  );
}

export const layout = {
  areaId: 'headerMiddleRight',
  sortOrder: 1
};
