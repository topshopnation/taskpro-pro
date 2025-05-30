
import { useEffect, useState } from 'react';

export function useSafeArea() {
  const [safeArea, setSafeArea] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  });

  useEffect(() => {
    const updateSafeArea = () => {
      if (typeof window !== 'undefined' && 'CSS' in window && CSS.supports('padding', 'env(safe-area-inset-top)')) {
        const computedStyle = getComputedStyle(document.documentElement);
        setSafeArea({
          top: parseInt(computedStyle.getPropertyValue('--safe-area-inset-top') || '0', 10),
          bottom: parseInt(computedStyle.getPropertyValue('--safe-area-inset-bottom') || '0', 10),
          left: parseInt(computedStyle.getPropertyValue('--safe-area-inset-left') || '0', 10),
          right: parseInt(computedStyle.getPropertyValue('--safe-area-inset-right') || '0', 10)
        });
      }
    };

    updateSafeArea();
    window.addEventListener('resize', updateSafeArea);
    
    return () => window.removeEventListener('resize', updateSafeArea);
  }, []);

  return safeArea;
}
