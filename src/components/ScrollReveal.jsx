import React, { useEffect, useRef, useState } from 'react';

/**
 * Hook to observe scroll visibility using IntersectionObserver
 */
export function useScrollReveal(options = {}) {
  const { threshold = 0.1, rootMargin = '0px 0px -40px 0px', triggerOnce = true } = options;
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Check if element is already in viewport on mount
    const checkInitialVisibility = () => {
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      if (rect.top <= windowHeight && rect.bottom >= 0) {
        setIsVisible(true);
      }
    };
    checkInitialVisibility();

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (triggerOnce) {
              observer.unobserve(element);
            }
          } else if (!triggerOnce) {
            setIsVisible(false);
          }
        },
        { threshold, rootMargin }
      );

      observer.observe(element);
      return () => observer.disconnect();
    } else {
      setIsVisible(true);
    }
  }, [threshold, rootMargin, triggerOnce]);

  return [ref, isVisible];
}

/**
 * Top Scroll Progress Indicator Bar
 */
export function ScrollProgressBar() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const currentProgress = (window.scrollY / totalScroll) * 100;
        setScrollProgress(currentProgress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-[3px] z-[100] bg-transparent pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-violet-500 via-indigo-500 to-magenta-500 shadow-[0_0_12px_rgba(168,85,247,0.8)] transition-all duration-150 ease-out"
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  );
}

/**
 * Container that rolls into view with 3D perspective and de-blur
 */
export function ScrollRoll({
  children,
  className = '',
  delay = 0,
  direction = 'up', // 'up', 'down', 'left', 'right', 'scale'
  duration = 950,
  threshold = 0.1,
  style = {}
}) {
  const [ref, isVisible] = useScrollReveal({ threshold, triggerOnce: false });

  let transformInitial = 'translateY(45px) rotateX(7deg) scale(0.96)';
  if (direction === 'left') transformInitial = 'translateX(-45px) rotateY(6deg) scale(0.96)';
  if (direction === 'right') transformInitial = 'translateX(45px) rotateY(-6deg) scale(0.96)';
  if (direction === 'down') transformInitial = 'translateY(-45px) scale(0.96)';
  if (direction === 'scale') transformInitial = 'scale(0.92) translateY(25px)';

  return (
    <div
      ref={ref}
      className={`scroll-roll-box native-scroll-roll ${className}`}
      style={{
        ...style,
        perspective: '1200px',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0) translateX(0) rotateX(0deg) rotateY(0deg) scale(1)' : transformInitial,
        filter: isVisible ? 'blur(0px)' : 'blur(6px)',
        transition: `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, filter ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`
      }}
    >
      {children}
    </div>
  );
}

/**
 * Slowly reveals text word-by-word with de-blur and smooth fade
 */
export function SlowWordReveal({
  text,
  className = '',
  as = 'div',
  staggerMs = 70,
  initialDelay = 100,
  highlightWord = '',
  highlightClass = 'text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-blue-400 to-magenta-400'
}) {
  const [ref, isVisible] = useScrollReveal({ threshold: 0.15, triggerOnce: false });
  const Tag = as;
  const words = text.split(' ');

  return (
    <Tag ref={ref} className={`inline-block ${className}`}>
      {words.map((word, idx) => {
        const isHighlight = highlightWord && word.toLowerCase().includes(highlightWord.toLowerCase());
        return (
          <span
            key={idx}
            className={`inline-block mr-[0.25em] transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isHighlight ? highlightClass : ''
            }`}
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.95)',
              filter: isVisible ? 'blur(0px)' : 'blur(8px)',
              transitionDelay: `${initialDelay + idx * staggerMs}ms`
            }}
          >
            {word}
          </span>
        );
      })}
    </Tag>
  );
}

/**
 * Slow paragraph / text block reveal with slow drift & de-blur
 */
export function SlowTextReveal({
  children,
  className = '',
  delay = 180,
  duration = 1100
}) {
  const [ref, isVisible] = useScrollReveal({ threshold: 0.1, triggerOnce: false });

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(26px)',
        filter: isVisible ? 'blur(0px)' : 'blur(6px)',
        transition: `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, filter ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`
      }}
    >
      {children}
    </div>
  );
}
