import { Link } from 'react-router-dom';
import { useEffect, useRef, useState, useCallback } from 'react';
import { LandingNav } from '../../layouts/components/LandingNav';
import { usePublishedCourses, usePublishedTestimonials, usePublishedStats } from '../../domains/cms/hooks/useCmsPublic';

/* ─── useInView: fires once when element enters viewport ─── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ─── AnimatedCounter ─── */
function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const { ref, visible } = useInView(0.3);
  useEffect(() => {
    if (!visible) return;
    const duration = 1800;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [visible, target]);
  return <span ref={ref}>{count}{suffix}</span>;
}

/* ─── FadeIn reveal wrapper ─── */
function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useInView(0.12);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.8s ease ${delay}ms, transform 0.8s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ─── Canvas 2D Music Notes Background ─── */
function DarkMusicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const animRef = useRef<number>(0);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseRef.current.tx = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseRef.current.ty = -(e.clientY / window.innerHeight - 0.5) * 2;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);

    const symbols = ['♩', '♪', '♫', '♬', '𝄞', '𝄢', '𝅗𝅥', '𝄽'];
    const colors = ['#C9A84C', '#E8C96B', '#8B3A4E', '#C9A84C', '#f0ece0', '#6B2D3E', '#C9A84C', '#8B3A4E'];
    const glows  = ['#E8C96B', '#C9A84C', '#C9A84C', '#ffffff', '#C9A84C', '#C9A84C', '#E8C96B', '#ffffff'];

    type Note = {
      x: number; y: number; baseX: number; baseY: number;
      size: number; opacity: number; baseOpacity: number;
      vx: number; vy: number;
      phaseX: number; phaseY: number; freqX: number; freqY: number;
      ampX: number; ampY: number;
      pulsePhase: number; pulseFreq: number;
      parallax: number;
      sym: string; color: string; glow: string;
    };

    const notes: Note[] = Array.from({ length: 90 }, () => {
      const idx = Math.floor(Math.random() * symbols.length);
      const sizeClass = Math.random();
      const size = sizeClass < 0.15
        ? 28 + Math.random() * 18
        : sizeClass < 0.55
          ? 11 + Math.random() * 12
          : 4 + Math.random() * 6;
      const baseOpacity = 0.06 + Math.random() * 0.55;
      return {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        baseX: Math.random() * window.innerWidth,
        baseY: Math.random() * window.innerHeight,
        size,
        opacity: baseOpacity,
        baseOpacity,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -(0.18 + Math.random() * 0.32),
        phaseX: Math.random() * Math.PI * 2,
        phaseY: Math.random() * Math.PI * 2,
        freqX: 0.3 + Math.random() * 0.5,
        freqY: 0.2 + Math.random() * 0.4,
        ampX: 18 + Math.random() * 40,
        ampY: 10 + Math.random() * 30,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseFreq: 0.4 + Math.random() * 1.0,
        parallax: 0.3 + Math.random() * 1.2,
        sym: symbols[idx],
        color: colors[idx],
        glow: glows[idx],
      };
    });

    let t = 0;
    const animate = () => {
      animRef.current = requestAnimationFrame(animate);
      t += 0.004;

      const m = mouseRef.current;
      m.x += (m.tx - m.x) * 0.1;
      m.y += (m.ty - m.y) * 0.1;

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Staff lines
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      for (let i = 0; i < 5; i++) {
        const ly = h * 0.55 + i * (h * 0.04);
        ctx.beginPath();
        ctx.moveTo(0, ly);
        ctx.lineTo(w, ly);
        ctx.strokeStyle = `rgba(201,168,76,${0.018 + Math.sin(t + i) * 0.004})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
      ctx.restore();

      // Notes
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      notes.forEach(n => {
        n.baseY += n.vy;
        n.baseX += n.vx;
        if (n.baseY < -40) { n.baseY = h + 20; n.baseX = Math.random() * w; }
        if (n.baseX < -20) n.baseX = w + 10;
        if (n.baseX > w + 20) n.baseX = -10;

        const wx = Math.sin(t * n.freqX + n.phaseX) * n.ampX;
        const wy = Math.sin(t * n.freqY + n.phaseY) * n.ampY;
        const px = m.x * n.parallax * 55;
        const py = m.y * n.parallax * 40;
        n.x = n.baseX + wx + px;
        n.y = n.baseY + wy + py;
        n.opacity = n.baseOpacity * (0.7 + 0.3 * Math.sin(t * n.pulseFreq + n.pulsePhase));

        // Glow halo
        const grad = ctx.createRadialGradient(n.x, n.y, 1, n.x, n.y, n.size * 1.8);
        grad.addColorStop(0, n.glow + '55');
        grad.addColorStop(0.5, n.glow + '18');
        grad.addColorStop(1, 'transparent');
        ctx.globalAlpha = n.opacity * 0.6;
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.size * 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Symbol
        ctx.globalAlpha = n.opacity;
        ctx.fillStyle = n.color;
        ctx.font = `${n.size}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = n.glow;
        ctx.shadowBlur = n.size * 0.8;
        ctx.fillText(n.sym, n.x, n.y);
        ctx.shadowBlur = 0;
      });

      ctx.restore();
    };

    animate();
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleMouseMove]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}
    />
  );
}

/* ─── SVG Icons for courses ─── */
const PianoIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#C9A84C" strokeWidth="1.5">
    <rect x="2" y="6" width="20" height="14" rx="1"/>
    <line x1="7" y1="6" x2="7" y2="14"/>
    <line x1="12" y1="6" x2="12" y2="14"/>
    <line x1="17" y1="6" x2="17" y2="14"/>
    <rect x="4.5" y="6" width="3" height="8" rx="0.5" fill="rgba(201,168,76,0.35)" stroke="none"/>
    <rect x="9.5" y="6" width="3" height="8" rx="0.5" fill="rgba(201,168,76,0.35)" stroke="none"/>
    <rect x="14.5" y="6" width="3" height="8" rx="0.5" fill="rgba(201,168,76,0.35)" stroke="none"/>
  </svg>
);

const GuitarIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#C9A84C" strokeWidth="1.5">
    <ellipse cx="12" cy="16" rx="5" ry="5.5"/>
    <rect x="11" y="2" width="2" height="9" rx="1"/>
    <line x1="9" y1="5" x2="15" y2="5" strokeWidth="1.2"/>
    <line x1="8.5" y1="7" x2="15.5" y2="7" strokeWidth="0.8"/>
    <circle cx="12" cy="16" r="1.2" fill="rgba(201,168,76,0.5)" stroke="none"/>
  </svg>
);

const MicIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#C9A84C" strokeWidth="1.5">
    <path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="22"/>
    <line x1="9" y1="22" x2="15" y2="22"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
  </svg>
);

const UserIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
  </svg>
);

/* ═══════════════════════════════════════════════════
   MAIN PAGE COMPONENT
═══════════════════════════════════════════════════ */
export function HomePage() {
  const { courses: cmsCourses } = usePublishedCourses();
  const { testimonials: cmsTestimonials } = usePublishedTestimonials();
  const { stats: cmsStats } = usePublishedStats();

  // Fallback data
  const fallbackStats = [
    { value: 2400, suffix: '+', label: 'Học Viên Đã Tốt Nghiệp' },
    { value: 18, suffix: '', label: 'Năm Kinh Nghiệm' },
    { value: 98, suffix: '%', label: 'Tỉ Lệ Hài Lòng' },
    { value: 42, suffix: '', label: 'Giảng Viên Quốc Tế' },
  ];

  const fallbackCourses = [
    {
      id: '1', number: '01', Icon: PianoIcon,
      title: 'Piano Cổ Điển & Đương Đại',
      desc: 'Từ kỹ thuật cơ bản đến biểu diễn nâng cao — chương trình được thiết kế theo chuẩn quốc tế ABRSM, phù hợp mọi lứa tuổi.',
      duration: '6 tháng — 3 năm', age: 'Mọi độ tuổi',
    },
    {
      id: '2', number: '02', Icon: GuitarIcon,
      title: 'Guitar Đệm Hát, Solo & Fingerstyle',
      desc: 'Từ hợp âm đệm hát cơ bản đến solo giai điệu và kỹ thuật fingerstyle — đàn được ngay những bản nhạc bạn yêu thích.',
      duration: '3 tháng — 2 năm', age: '8 tuổi trở lên',
    },
    {
      id: '3', number: '03', Icon: MicIcon,
      title: 'Nhạc Lý & Thanh Nhạc',
      desc: 'Nền tảng lý thuyết âm nhạc vững chắc kết hợp kỹ thuật hơi thở, phát âm và biểu diễn thanh nhạc chuyên nghiệp.',
      duration: '3 tháng — 2 năm', age: '10 tuổi trở lên',
    },
  ];

  const fallbackTestimonials = [
    {
      id: '1', initial: 'M', stars: 5,
      quote: 'YayaMusic đã thay đổi hoàn toàn cách tôi cảm nhận âm nhạc. Sau 2 năm học piano, tôi tự tin biểu diễn trên sân khấu quốc tế.',
      name: 'Nguyễn Minh Anh', role: 'Học viên Piano — 2 năm',
    },
    {
      id: '2', initial: 'T', stars: 5,
      quote: 'Đội ngũ giảng viên tuyệt vời, phương pháp giảng dạy khoa học. Con tôi từ không biết gì đến đạt chứng chỉ ABRSM Grade 5 chỉ trong 18 tháng.',
      name: 'Trần Thị Hoa', role: 'Phụ huynh học viên Violin',
    },
    {
      id: '3', initial: 'L', stars: 5,
      quote: 'Môi trường học tập chuyên nghiệp, trang thiết bị hiện đại. Tôi đặc biệt ấn tượng với hệ thống theo dõi tiến trình học tập online.',
      name: 'Lê Quang Vinh', role: 'Học viên Thanh Nhạc — 1 năm',
    },
  ];

  // Use CMS data if available, else fallback
  const displayStats = cmsStats.length > 0
    ? cmsStats.map(s => ({ value: s.value, suffix: s.suffix, label: s.label }))
    : fallbackStats;

  const displayTestimonials = cmsTestimonials.length > 0
    ? cmsTestimonials.map(t => ({
        id: t.id, initial: (t.author_name?.[0] ?? 'A'),
        stars: 5, quote: t.quote,
        name: t.author_name, role: t.author_role ?? '',
      }))
    : fallbackTestimonials;

  const displayCourses = cmsCourses.length > 0
    ? cmsCourses.map((c, i) => ({
        id: c.id,
        number: String(i + 1).padStart(2, '0'),
        Icon: i === 0 ? PianoIcon : i === 1 ? GuitarIcon : MicIcon,
        title: c.title ?? '',
        desc: c.description ?? '',
        duration: c.duration ?? '',
        age: c.age_range ?? '',
      }))
    : fallbackCourses;

  // inline styles for the dark luxury theme
  const darkBg = '#0a0608';
  const gold = '#C9A84C';
  const goldLight = '#E8C96B';
  const textMain = '#f0ece0';
  const glassBg = 'rgba(255,255,255,0.06)';
  const glassBorder = 'rgba(201,168,76,0.25)';

  return (
    <div style={{ background: darkBg, color: textMain, fontFamily: "'Be Vietnam Pro', sans-serif", overflowX: 'hidden', minHeight: '100vh' }}>
      {/* Fixed canvas background */}
      <DarkMusicBackground />

      {/* Radial overlay gradients */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none',
        background: `
          radial-gradient(ellipse 80% 60% at 20% 10%, rgba(107,45,62,0.35) 0%, transparent 60%),
          radial-gradient(ellipse 60% 50% at 80% 80%, rgba(27,42,74,0.4) 0%, transparent 60%),
          radial-gradient(ellipse 100% 100% at 50% 50%, rgba(10,6,8,0.5) 0%, transparent 100%)
        `,
      }} />

      {/* Cursor glow — CSS-only via pointer-events none div following mouse */}
      <CursorGlow />

      {/* All content sits above the canvas */}
      <div style={{ position: 'relative', zIndex: 10 }}>

        {/* ── NAVBAR ── */}
        <LandingNav />

        {/* ── HERO ── */}
        <section style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', textAlign: 'center',
          padding: '120px 40px 80px', position: 'relative',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 12,
            fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.22em',
            textTransform: 'uppercase', color: gold, marginBottom: 32,
            animation: 'heroFadeUp 0.8s 0.2s both',
          }}>
            <span style={{ display: 'block', width: 40, height: 1, background: gold, opacity: 0.5 }} />
            Trung Tâm Đào Tạo Âm Nhạc
            <span style={{ display: 'block', width: 40, height: 1, background: gold, opacity: 0.5 }} />
          </div>

          <h1 style={{
            fontFamily: "'Lora', Georgia, serif",
            fontSize: 'clamp(3rem, 7vw, 6.5rem)',
            fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.01em',
            color: textMain, marginBottom: 8,
            animation: 'heroFadeUp 0.9s 0.35s both',
          }}>
            Nơi Nghệ Thuật<br />
            <span style={{
              fontStyle: 'italic',
              background: `linear-gradient(135deg, ${gold} 0%, ${goldLight} 50%, ${gold} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              display: 'inline-block',
              paddingRight: '0.08em',
            }}>
              Khai Mở
            </span>{' '}Tâm Hồn
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 1.8vw, 1.25rem)', fontWeight: 300, lineHeight: 1.7,
            color: 'rgba(240,236,224,0.55)', maxWidth: 560, margin: '24px auto 0',
            animation: 'heroFadeUp 0.9s 0.55s both',
          }}>
            Hành trình âm nhạc đỉnh cao — từ những nốt nhạc đầu tiên đến sân khấu chuyên nghiệp,
            với đội ngũ giảng viên đẳng cấp quốc tế.
          </p>

          <div style={{
            display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'center',
            marginTop: 52, animation: 'heroFadeUp 0.9s 0.75s both',
          }}>
            <Link to="/login">
              <button style={{
                padding: '16px 44px',
                background: 'linear-gradient(135deg, #6B2D3E 0%, #8B3A4E 100%)',
                border: '1px solid rgba(201,168,76,0.3)', borderRadius: 2,
                color: textMain, fontFamily: "'Be Vietnam Pro', sans-serif",
                fontSize: '0.82rem', fontWeight: 500, letterSpacing: '0.12em',
                textTransform: 'uppercase', cursor: 'pointer',
                transition: 'all 0.35s ease',
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 40px rgba(107,45,62,0.5), 0 0 80px rgba(107,45,62,0.2)';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                }}
              >
                Khám Phá Khóa Học
              </button>
            </Link>

            <button style={{
              padding: '16px 44px', background: 'transparent',
              border: '1px solid rgba(240,236,224,0.15)', borderRadius: 2,
              color: 'rgba(240,236,224,0.7)', fontFamily: "'Be Vietnam Pro', sans-serif",
              fontSize: '0.82rem', fontWeight: 400, letterSpacing: '0.12em',
              textTransform: 'uppercase', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
              transition: 'all 0.3s ease',
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(240,236,224,0.35)';
                (e.currentTarget as HTMLButtonElement).style.color = textMain;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(240,236,224,0.15)';
                (e.currentTarget as HTMLButtonElement).style.color = 'rgba(240,236,224,0.7)';
              }}
            >
              <span style={{
                width: 32, height: 32, borderRadius: '50%',
                border: '1px solid rgba(201,168,76,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <svg viewBox="0 0 12 14" width="12" height="12">
                  <polygon points="0,0 12,7 0,14" fill={gold} />
                </svg>
              </span>
              Xem Giới Thiệu
            </button>
          </div>

          {/* Scroll hint */}
          <div style={{
            position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase',
            color: 'rgba(240,236,224,0.3)', animation: 'heroFadeUp 1s 1.2s both',
          }}>
            <div style={{
              width: 1, height: 48,
              background: `linear-gradient(to bottom, ${gold}, transparent)`,
              animation: 'scrollPulse 2s ease-in-out infinite',
            }} />
            Cuộn xuống
          </div>
        </section>

        {/* ── STATS ── */}
        <Reveal>
          <div style={{
            display: 'flex', justifyContent: 'center',
            borderTop: '1px solid rgba(201,168,76,0.12)',
            borderBottom: '1px solid rgba(201,168,76,0.12)',
            background: 'rgba(10,6,8,0.6)',
            backdropFilter: 'blur(12px)',
          }}>
            {displayStats.slice(0, 4).map((stat, i) => (
              <div key={i} style={{
                flex: '1', maxWidth: 280, padding: '52px 40px', textAlign: 'center',
                borderRight: i < 3 ? '1px solid rgba(201,168,76,0.08)' : 'none',
                transition: 'background 0.3s',
              }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'rgba(201,168,76,0.04)'}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}
              >
                <div style={{ fontFamily: "'Lora', Georgia, serif", fontSize: '3rem', fontWeight: 700, color: gold, lineHeight: 1, marginBottom: 8 }}>
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 400, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(240,236,224,0.4)' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* ── WAVE TEXT 1 ── */}
        <div style={{
          fontFamily: "'Lora', Georgia, serif",
          fontSize: 'clamp(5rem, 14vw, 12rem)', fontWeight: 700, fontStyle: 'italic',
          color: 'rgba(201,168,76,0.04)', letterSpacing: '-0.03em', lineHeight: 1,
          userSelect: 'none', whiteSpace: 'nowrap', overflow: 'hidden', padding: '20px 0',
        }}>
          YAYAMUSIC
        </div>

        {/* ── COURSES ── */}
        <section style={{ padding: '120px 60px' }}>
          <Reveal>
            <div style={{ fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.25em', textTransform: 'uppercase', color: gold, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ display: 'block', width: 24, height: 1, background: gold, opacity: 0.6 }} />
              Chương Trình Đào Tạo
            </div>
            <h2 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 700, lineHeight: 1.15, color: textMain, marginBottom: 20 }}>
              Khóa Học<br />Được Thiết Kế Tỉ Mỉ
            </h2>
          </Reveal>

          <Reveal delay={150}>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 1, background: 'rgba(201,168,76,0.08)',
              marginTop: 72, border: '1px solid rgba(201,168,76,0.08)',
            }}>
              {displayCourses.map((c, idx) => (
                <CourseCard key={c.id} course={c} index={idx} textMain={textMain} gold={gold} />
              ))}
            </div>
          </Reveal>
        </section>

        {/* ── WAVE TEXT 2 ── */}
        <div style={{
          fontFamily: "'Lora', Georgia, serif",
          fontSize: 'clamp(5rem, 14vw, 12rem)', fontWeight: 700, fontStyle: 'italic',
          color: 'rgba(201,168,76,0.04)', letterSpacing: '-0.03em', lineHeight: 1,
          userSelect: 'none', whiteSpace: 'nowrap', overflow: 'hidden', padding: '20px 0',
          textAlign: 'right',
        }}>
          EXCELLENCE
        </div>

        {/* ── TESTIMONIALS ── */}
        <section style={{ padding: '120px 60px' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 0 }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.25em', textTransform: 'uppercase', color: gold, marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                <span style={{ display: 'block', width: 24, height: 1, background: gold, opacity: 0.6 }} />
                Học Viên Chia Sẻ
                <span style={{ display: 'block', width: 24, height: 1, background: gold, opacity: 0.6 }} />
              </div>
              <h2 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 700, lineHeight: 1.15, color: textMain, textAlign: 'center' }}>
                Những Câu Chuyện<br />Truyền Cảm Hứng
              </h2>
            </div>
          </Reveal>

          <Reveal delay={150}>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 1, background: 'rgba(201,168,76,0.06)',
              border: '1px solid rgba(201,168,76,0.06)', marginTop: 72,
            }}>
              {displayTestimonials.map(t => (
                <TestimonialCard key={t.id} t={t} gold={gold} />
              ))}
            </div>
          </Reveal>
        </section>

        {/* ── CTA ── */}
        <Reveal>
          <section style={{
            textAlign: 'center', padding: '140px 60px',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 800, height: 400,
              background: 'radial-gradient(ellipse, rgba(107,45,62,0.25) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />
            <h2 style={{
              fontFamily: "'Lora', Georgia, serif",
              fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: 700, lineHeight: 1.1,
              color: textMain, marginBottom: 24, position: 'relative',
            }}>
              Bắt Đầu Hành Trình<br />
              <span style={{
                fontStyle: 'italic',
                background: `linear-gradient(135deg, ${gold} 0%, ${goldLight} 50%, ${gold} 100%)`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>Âm Nhạc</span> Của Bạn
            </h2>
            <p style={{ fontSize: '1rem', fontWeight: 300, color: 'rgba(240,236,224,0.45)', marginBottom: 52, position: 'relative' }}>
              Đăng ký tư vấn miễn phí — Chúng tôi sẽ thiết kế lộ trình học tập<br />phù hợp nhất với bạn trong vòng 24 giờ.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', position: 'relative' }}>
              <Link to="/login">
                <button style={{
                  padding: '16px 44px',
                  background: 'linear-gradient(135deg, #6B2D3E 0%, #8B3A4E 100%)',
                  border: '1px solid rgba(201,168,76,0.3)', borderRadius: 2,
                  color: textMain, fontFamily: "'Be Vietnam Pro', sans-serif",
                  fontSize: '0.82rem', fontWeight: 500, letterSpacing: '0.12em',
                  textTransform: 'uppercase', cursor: 'pointer',
                  transition: 'all 0.35s ease',
                }}>
                  Đặt Lịch Tư Vấn Miễn Phí
                </button>
              </Link>
              <button style={{
                padding: '16px 44px', background: 'transparent',
                border: '1px solid rgba(240,236,224,0.15)', borderRadius: 2,
                color: 'rgba(240,236,224,0.7)', fontFamily: "'Be Vietnam Pro', sans-serif",
                fontSize: '0.82rem', fontWeight: 400, letterSpacing: '0.12em',
                textTransform: 'uppercase', cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}>
                Xem Học Phí
              </button>
            </div>
          </section>
        </Reveal>

        {/* ── FOOTER ── */}
        <footer style={{
          padding: 60, borderTop: '1px solid rgba(201,168,76,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(6,4,5,0.8)',
        }}>
          <div style={{ fontFamily: "'Lora', Georgia, serif", fontSize: '1.2rem', color: 'rgba(240,236,224,0.4)' }}>
            Yaya<span style={{ color: gold, opacity: 0.6 }}>Music</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'rgba(240,236,224,0.2)', letterSpacing: '0.08em' }}>
            © 2025 YayaMusic. All rights reserved.
          </div>
        </footer>
      </div>

      {/* Global keyframes */}
      <style>{`
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scrollPulse {
          0%, 100% { opacity: 0.3; transform: scaleY(1); }
          50%       { opacity: 0.8; transform: scaleY(1.1); }
        }
        @keyframes rotateSlow {
          to { transform: rotate(360deg); }
        }
        @keyframes floatAnim {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-12px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(1.4); }
        }
      `}</style>
    </div>
  );
}

/* ─── Cursor glow (follows mouse via JS) ─── */
function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (ref.current) {
        ref.current.style.left = e.clientX + 'px';
        ref.current.style.top = e.clientY + 'px';
      }
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);
  return (
    <div ref={ref} style={{
      position: 'fixed', pointerEvents: 'none',
      width: 400, height: 400, borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(107,45,62,0.12) 0%, transparent 70%)',
      transform: 'translate(-50%, -50%)',
      zIndex: 2, transition: 'left 0.1s ease, top 0.1s ease',
    }} />
  );
}

/* ─── CourseCard sub-component ─── */
type CourseItem = {
  id: string; number: string; Icon: React.FC;
  title: string; desc: string; duration: string; age: string;
};

function CourseCard({ course, textMain, gold }: { course: CourseItem; index: number; textMain: string; gold: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'rgba(20,12,16,0.9)' : 'rgba(10,6,8,0.85)',
        padding: '52px 44px', position: 'relative', overflow: 'hidden', cursor: 'pointer',
        transition: 'background 0.4s ease',
      }}
    >
      {/* Hover gradient overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(107,45,62,0.12) 0%, transparent 60%)',
        opacity: hovered ? 1 : 0, transition: 'opacity 0.4s', pointerEvents: 'none',
      }} />

      <div style={{ fontFamily: "'Lora', Georgia, serif", fontSize: '0.7rem', fontWeight: 400, letterSpacing: '0.2em', color: 'rgba(201,168,76,0.35)', marginBottom: 32 }}>
        {course.number}
      </div>

      <div style={{
        width: 56, height: 56, border: '1px solid rgba(201,168,76,0.2)', borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 28,
        transform: hovered ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.3s ease',
      }}>
        <course.Icon />
      </div>

      <h3 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: '1.4rem', fontWeight: 600, lineHeight: 1.3, color: textMain, marginBottom: 16 }}>
        {course.title}
      </h3>
      <p style={{ fontSize: '0.88rem', fontWeight: 300, lineHeight: 1.75, color: 'rgba(240,236,224,0.45)', marginBottom: 36 }}>
        {course.desc}
      </p>

      <div style={{ display: 'flex', gap: 20, alignItems: 'center', fontSize: '0.72rem', letterSpacing: '0.08em', color: 'rgba(240,236,224,0.3)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><ClockIcon />{course.duration}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><UserIcon />{course.age}</span>
      </div>

      <div style={{
        position: 'absolute', right: 44, bottom: 52,
        opacity: hovered ? 1 : 0, transform: hovered ? 'translateX(0)' : 'translateX(-8px)',
        transition: 'all 0.3s ease', color: gold, fontSize: '1.2rem',
      }}>→</div>
    </div>
  );
}

/* ─── TestimonialCard sub-component ─── */
type TestiItem = { id: string; initial: string; stars: number; quote: string; name: string; role: string };

function TestimonialCard({ t, gold }: { t: TestiItem; gold: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'rgba(18,12,14,0.95)' : 'rgba(12,8,10,0.9)',
        padding: '48px 40px', position: 'relative',
        transition: 'background 0.3s ease',
      }}
    >
      <div style={{ color: gold, fontSize: '0.7rem', letterSpacing: 2, marginBottom: 20 }}>
        {'★'.repeat(t.stars)}
      </div>
      <div style={{ fontFamily: "'Lora', Georgia, serif", fontSize: '3rem', fontWeight: 700, lineHeight: 1, color: 'rgba(201,168,76,0.2)', marginBottom: 16 }}>
        "
      </div>
      <p style={{ fontSize: '0.92rem', fontWeight: 300, lineHeight: 1.85, color: 'rgba(240,236,224,0.6)', fontStyle: 'italic', marginBottom: 32 }}>
        {t.quote}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          border: '1px solid rgba(201,168,76,0.25)', overflow: 'hidden',
          background: 'linear-gradient(135deg, #6B2D3E, #1B2A4A)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Lora', Georgia, serif", fontSize: '1rem', color: gold,
        }}>
          {t.initial}
        </div>
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#f0ece0' }}>{t.name}</div>
          <div style={{ fontSize: '0.72rem', color: 'rgba(240,236,224,0.35)', letterSpacing: '0.05em' }}>{t.role}</div>
        </div>
      </div>
    </div>
  );
}
