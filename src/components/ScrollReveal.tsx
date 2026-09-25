import React, { useEffect, useRef, useState } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  animation?: 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'zoom-in' | 'fade';
  delay?: number; // delay in milliseconds
  threshold?: number;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className = '',
  animation = 'fade-up',
  delay = 0,
  threshold = 0.12,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If IntersectionObserver is not supported, reveal immediately
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Once visible, stop observing to conserve performance
          if (elementRef.current) {
            observer.unobserve(elementRef.current);
          }
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    const currentEl = elementRef.current;
    if (currentEl) {
      observer.observe(currentEl);
    }

    return () => {
      if (currentEl) {
        observer.unobserve(currentEl);
      }
    };
  }, [threshold]);

  const getAnimationClass = () => {
    switch (animation) {
      case 'fade-down':
        return isVisible ? 'reveal-visible' : 'reveal-hidden-down';
      case 'fade-left':
        return isVisible ? 'reveal-visible' : 'reveal-hidden-left';
      case 'fade-right':
        return isVisible ? 'reveal-visible' : 'reveal-hidden-right';
      case 'zoom-in':
        return isVisible ? 'reveal-visible' : 'reveal-hidden-zoom';
      case 'fade':
        return isVisible ? 'reveal-visible' : 'reveal-hidden-fade';
      case 'fade-up':
      default:
        return isVisible ? 'reveal-visible' : 'reveal-hidden';
    }
  };

  return (
    <div
      ref={elementRef}
      style={{
        transitionDelay: delay ? `${delay}ms` : undefined,
      }}
      className={`${getAnimationClass()} ${className}`}
    >
      {children}
    </div>
  );
};
