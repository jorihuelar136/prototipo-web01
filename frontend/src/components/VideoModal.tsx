import { useEffect, useRef } from 'react';
import { ShortItem } from '../data/shorts';

interface VideoModalProps {
  short: ShortItem | null;
  onClose: () => void;
}

// Reusable modal to display a YouTube short (9:16) with accessibility & focus trap
export function VideoModal({ short, onClose }: VideoModalProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  // Manage global effects (scroll lock, escape, initial focus)
  useEffect(() => {
    if (!short) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    // Focus close button next tick
    const id = setTimeout(() => closeBtnRef.current?.focus(), 0);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = prevOverflow;
      clearTimeout(id);
    };
  }, [short, onClose]);

  // Basic focus trap within modal
  useEffect(() => {
    if (!short) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], iframe, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [short]);

  if (!short) return null;

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={short.title}
    >
      {/* High visibility close button */}
      <button
        ref={closeBtnRef}
        onClick={onClose}
        className="fixed top-3 right-3 z-[60] h-11 w-11 rounded-full bg-white text-gray-900 hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-xl flex items-center justify-center"
        aria-label="Cerrar reproductor"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
      <div ref={dialogRef} className="relative w-full max-w-sm md:max-w-md aspect-[9/16] bg-black rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
        <iframe
          title={short.title}
          src={`https://www.youtube.com/embed/${short.videoId}?autoplay=1&rel=0&modestbranding=1`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
    </div>
  );
}

export default VideoModal;