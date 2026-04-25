import { useState, useEffect, useRef } from 'react';

const NOTES = ['♩', '♪', '♫', '♬', '𝄞', '𝄢'];

interface Note {
  id: number;
  char: string;
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
  delay: number;
  color: 'primary' | 'gold';
  parallaxFactor: number;
}

function generateNotes(): Note[] {
  return Array.from({ length: 18 }, (_, i) => ({
    id: i,
    char: NOTES[Math.floor(Math.random() * NOTES.length)],
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 16 + Math.random() * 32,
    opacity: 0.06 + Math.random() * 0.09,
    speed: 8 + Math.random() * 7,
    delay: Math.random() * 12,
    color: Math.random() > 0.5 ? 'primary' : 'gold',
    parallaxFactor: 0.2 + Math.random() * 0.8,
  }));
}

export default function MusicNotesBackground() {
  const [notes] = useState<Note[]>(generateNotes);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        setMouseOffset({
          x: ((e.clientX - centerX) / centerX) * 30,
          y: ((e.clientY - centerY) / centerY) * 30,
        });
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      <style>{`
        @keyframes floatUp {
          from {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
          }
          20% { opacity: 1; }
          80% { opacity: 1; }
          to {
            transform: translateY(-20vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        {notes.map((note) => (
          <span
            key={note.id}
            style={{
              position: 'absolute',
              left: `${note.x}%`,
              bottom: 0,
              fontSize: `${note.size}px`,
              opacity: note.opacity,
              color: note.color === 'primary' ? '#6B2D3E' : '#C9A84C',
              animation: `floatUp ${note.speed}s linear infinite`,
              animationDelay: `${note.delay}s`,
              transform: `translate(${mouseOffset.x * note.parallaxFactor}px, ${mouseOffset.y * note.parallaxFactor}px)`,
              transition: 'transform 0.3s ease-out',
              userSelect: 'none',
            }}
          >
            {note.char}
          </span>
        ))}
      </div>
    </>
  );
}
