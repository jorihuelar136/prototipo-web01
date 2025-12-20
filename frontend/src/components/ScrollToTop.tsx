import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top and move focus to main region for accessibility
    window.scrollTo({ top: 0, behavior: 'auto' });
    const main = document.querySelector('main');
    if (main && main instanceof HTMLElement) {
      if (!main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1');
      main.focus();
    }
  }, [pathname]);

  return null;
}
