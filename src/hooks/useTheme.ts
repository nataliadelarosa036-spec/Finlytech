import { useEffect } from 'react';
import { useStore } from '@/state/store';

export function useTheme() {
  const darkMode = useStore((s) => s.darkMode);
  const a11yPrefs = useStore((s) => s.a11yPrefs);

  useEffect(() => {
    const root = document.documentElement;

    // Dark / light
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Theme color meta tag
    const metas = document.querySelectorAll('meta[name="theme-color"]');
    metas.forEach((m) => m.setAttribute('content', darkMode ? '#0b1020' : '#f4f6fb'));

    // Accessibility
    root.style.fontSize = a11yPrefs?.largeText ? '17px' : '';
    if (a11yPrefs?.highContrast) root.classList.add('high-contrast');
    else root.classList.remove('high-contrast');

  }, [darkMode, a11yPrefs?.largeText, a11yPrefs?.highContrast]);

  return darkMode;
}
