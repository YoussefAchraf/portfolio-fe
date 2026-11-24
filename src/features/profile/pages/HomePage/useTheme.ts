/** LAYER features/profile/pages - applies and remembers the public color theme. */
import { useEffect, useState } from 'react';

const key = 'portfolio-theme';
type Theme = 'dark' | 'light' | 'system';

function readTheme(): Theme {
  try {
    const value = document.cookie.split('; ').find((entry) => entry.startsWith(`${key}=`))?.slice(key.length + 1);
    if (value === 'light' || value === 'system') return value;
  } catch {
    return 'dark';
  }
  return 'dark';
}

export function useTheme(): { theme: Theme; setTheme: (value: string) => void } {
  const [theme, updateTheme] = useState(readTheme);
  useEffect(() => {
    if (theme === 'system') delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = theme;
  }, [theme]);

  function setTheme(value: string): void {
    if (value !== 'dark' && value !== 'light' && value !== 'system') return;
    updateTheme(value);
    try {
      const secure = location.protocol === 'https:' ? '; Secure' : '';
      document.cookie = `${key}=${value}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
    } catch {
      // The in-memory preference still applies when storage is unavailable.
    }
  }
  return { theme, setTheme };
}
