import Lenis from 'lenis';

let lenisInstance: Lenis | null = null;

export const initLenis = (): Lenis => {
  if (typeof window === 'undefined') return null as any;

  if (lenisInstance) {
    return lenisInstance;
  }

  lenisInstance = new Lenis({
    duration: 1.1,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // smooth exponential ease
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    touchMultiplier: 1.5,
    infinite: false,
  });

  function raf(time: number) {
    lenisInstance?.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);

  return lenisInstance;
};

export const getLenis = (): Lenis | null => lenisInstance;

export const scrollToTop = (immediate = false) => {
  if (lenisInstance) {
    lenisInstance.scrollTo(0, { immediate });
  } else {
    window.scrollTo({ top: 0, behavior: immediate ? 'auto' : 'smooth' });
  }
};

export const scrollToPosition = (targetY: number, immediate = false) => {
  if (lenisInstance) {
    lenisInstance.scrollTo(targetY, { immediate });
  } else {
    window.scrollTo({ top: targetY, behavior: immediate ? 'auto' : 'smooth' });
  }
};

export const pauseLenis = () => {
  lenisInstance?.stop();
};

export const resumeLenis = () => {
  lenisInstance?.start();
};
