import { useState, useEffect } from 'react';

export function useScrollSpy(sectionIds: string[], offset = 140): string {
  const [activeSection, setActiveSection] = useState<string>(sectionIds[0] || 'home');

  useEffect(() => {
    let ticking = false;

    const calculateActiveSection = () => {
      // 1. If at or near the very top of the page, activate the first section ('home')
      if (window.scrollY < 60) {
        return sectionIds[0] || 'home';
      }

      // 2. If at or near the very bottom of the page, activate the last section
      const windowHeight = window.innerHeight;
      const documentHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      );
      if (windowHeight + window.scrollY >= documentHeight - 50) {
        return sectionIds[sectionIds.length - 1] || 'contact';
      }

      // 3. Viewport-based detection using getBoundingClientRect
      // Find the element whose top is closest to the offset line or spans across it
      let bestMatch = sectionIds[0] || 'home';
      let foundActive = false;

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (!el) continue;

        const rect = el.getBoundingClientRect();
        // Section is covering the offset reference line
        if (rect.top <= offset && rect.bottom > offset) {
          bestMatch = id;
          foundActive = true;
          break;
        } else if (rect.top <= offset) {
          // Passed this section, candidate for active if no later section covers the line
          bestMatch = id;
        }
      }

      return bestMatch;
    };

    const handleScroll = () => {
      if (ticking) return;

      ticking = true;
      requestAnimationFrame(() => {
        const current = calculateActiveSection();
        setActiveSection((prev) => (prev !== current ? current : prev));
        ticking = false;
      });
    };

    // Calculate immediately on mount
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [sectionIds, offset]);

  return activeSection;
}
