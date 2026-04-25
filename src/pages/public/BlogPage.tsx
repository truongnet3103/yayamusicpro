import { useEffect, useRef, useState } from 'react';
import { LandingNav } from '../../layouts/components/LandingNav';
import { usePublishedPosts } from '../../domains/cms/hooks/useCmsPublic';
import type { CmsPost } from '../../domains/cms/types';

/* ─── tokens ─── */
const gold = '#C9A84C';
const goldLight = '#E8C96B';
const darkBg = '#0D0A0B';
const cardBg = '#161012';
const cardBgHover = '#1E161A';
const textMain = '#F0ECE0';
const textMuted = 'rgba(240,236,224,0.45)';
const textDim = 'rgba(240,236,224,0.22)';
const borderFaint = 'rgba(201,168,76,0.12)';

const CATEGORY_LABELS: Record<string, string> = {
  news: 'Kiến Thức',
  event: 'Sự Kiện',
  highlight: 'Nổi Bật',
};

const CARD_GRADIENTS: Record<string, string> = {
  news: 'linear-gradient(135deg, #1a2a3a 0%, #0d1520 100%)',
  event: 'linear-gradient(135deg, #251530 0%, #120a1a 100%)',
  highlight: 'linear-gradient(135deg, #2a1e08 0%, #160f04 100%)',
};

const ACCENT_COLORS: Record<string, string> = {
  news: '#5B9BD5',
  event: '#9B6BC5',
  highlight: gold,
};

/* ─── Reveal ─── */
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(32px)',
      transition: `opacity 0.7s cubic-bezier(.22,1,.36,1) ${delay}ms, transform 0.7s cubic-bezier(.22,1,.36,1) ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

/* ─── Markdown renderer ─── */
function renderMarkdown(text: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ color: textMain, fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

function renderBody(body: string): React.ReactNode {
  return body.split(/\n\n+/).filter(p => p.trim()).map((para, i) => (
    <p key={i} style={{ fontSize: '0.95rem', fontWeight: 300, lineHeight: 1.9, color: 'rgba(240,236,224,0.65)', marginBottom: 22 }}>
      {renderMarkdown(para.trim())}
    </p>
  ));
}

/* ════════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════════ */
export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedPost, setSelectedPost] = useState<CmsPost | null>(null);
  const { posts, loading } = usePublishedPosts();

  const categories = ['all', ...Array.from(new Set(posts.map(p => p.category)))];
  const filtered = activeCategory === 'all' ? posts : posts.filter(p => p.category === activeCategory);
  const [featured, ...rest] = filtered;

  return (
    <div style={{ background: darkBg, color: textMain, fontFamily: "'Be Vietnam Pro', sans-serif", minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ── ambient glow ── */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: `
          radial-gradient(ellipse 60% 45% at 10% 20%, rgba(107,45,62,0.18) 0%, transparent 55%),
          radial-gradient(ellipse 40% 35% at 90% 75%, rgba(27,42,74,0.2) 0%, transparent 55%)
        `,
      }} />

      <div style={{ position: 'relative', zIndex: 10 }}>
        <LandingNav />

        {/* ════ HERO ════ */}
        <section style={{ padding: '140px 0 72px', textAlign: 'center' }}>
          <Reveal>
            <p style={{
              fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.28em',
              textTransform: 'uppercase', color: gold, marginBottom: 20,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14,
            }}>
              <span style={{ display: 'block', width: 40, height: 1, background: `linear-gradient(90deg, transparent, ${gold})` }} />
              YayaMusic Journal
              <span style={{ display: 'block', width: 40, height: 1, background: `linear-gradient(90deg, ${gold}, transparent)` }} />
            </p>

            <h1 style={{
              fontFamily: "'Lora', Georgia, serif",
              fontSize: 'clamp(3rem, 7vw, 5.5rem)',
              fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.02em',
              color: textMain, margin: '0 0 18px',
            }}>
              Góc <em style={{
                fontStyle: 'italic',
                background: `linear-gradient(120deg, ${gold} 0%, ${goldLight} 45%, ${gold} 100%)`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>Âm Nhạc</em>
            </h1>

            <p style={{
              fontSize: '1rem', fontWeight: 300, lineHeight: 1.8,
              color: textMuted, maxWidth: 440, margin: '0 auto',
            }}>
              Kiến thức, câu chuyện và sự kiện từ đội ngũ YayaMusic.
            </p>
          </Reveal>
        </section>

        {/* ════ DIVIDER ════ */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 48px 48px' }}>
          <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${borderFaint}, transparent)` }} />
        </div>

        {/* ════ FILTER PILLS ════ */}
        {!loading && posts.length > 0 && (
          <Reveal>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 48px 52px', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {categories.map(cat => {
                const active = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    style={{
                      padding: '9px 24px',
                      background: active ? gold : 'transparent',
                      border: `1px solid ${active ? gold : 'rgba(201,168,76,0.2)'}`,
                      borderRadius: 40, cursor: 'pointer',
                      color: active ? '#0D0A0B' : textMuted,
                      fontFamily: "'Be Vietnam Pro', sans-serif",
                      fontSize: '0.72rem', fontWeight: active ? 700 : 500,
                      letterSpacing: '0.12em', textTransform: 'uppercase',
                      transition: 'all 0.22s ease',
                    }}
                  >
                    {cat === 'all' ? 'Tất Cả' : CATEGORY_LABELS[cat] ?? cat}
                  </button>
                );
              })}
            </div>
          </Reveal>
        )}

        {/* ════ CONTENT ════ */}
        <main style={{ maxWidth: 1200, margin: '0 auto', padding: '0 48px 120px' }}>
          {loading ? (
            <SkeletonGrid />
          ) : filtered.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {/* Featured post */}
              {featured && (
                <Reveal delay={0}>
                  <FeaturedCard post={featured} onOpen={() => setSelectedPost(featured)} />
                </Reveal>
              )}

              {/* Rest grid */}
              {rest.length > 0 && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                  gap: 24, marginTop: 24,
                }}>
                  {rest.map((post, i) => (
                    <Reveal key={post.id} delay={i * 80}>
                      <PostCard post={post} onOpen={() => setSelectedPost(post)} />
                    </Reveal>
                  ))}
                </div>
              )}
            </>
          )}
        </main>

        {/* ════ FOOTER ════ */}
        <footer style={{
          padding: '44px 48px',
          borderTop: `1px solid ${borderFaint}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(8,5,6,0.9)',
        }}>
          <span style={{ fontFamily: "'Lora', Georgia, serif", fontSize: '1.1rem', color: 'rgba(240,236,224,0.35)' }}>
            Yaya<span style={{ color: gold }}>Music</span>
          </span>
          <span style={{ fontSize: '0.68rem', color: textDim, letterSpacing: '0.1em' }}>
            © 2025 YayaMusic. All rights reserved.
          </span>
        </footer>
      </div>

      {/* ════ MODAL ════ */}
      {selectedPost && <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} />}
    </div>
  );
}

/* ════════════════════════════════════════════════
   FEATURED CARD — full-width hero card
   ════════════════════════════════════════════════ */
function FeaturedCard({ post, onOpen }: { post: CmsPost; onOpen: () => void }) {
  const [hovered, setHovered] = useState(false);
  const accent = ACCENT_COLORS[post.category] ?? gold;
  const gradient = CARD_GRADIENTS[post.category] ?? CARD_GRADIENTS.news;
  const dateStr = new Date(post.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div
      onClick={onOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative', overflow: 'hidden', cursor: 'pointer',
        borderRadius: 16, marginBottom: 0,
        background: cardBg,
        border: `1px solid ${hovered ? 'rgba(201,168,76,0.25)' : borderFaint}`,
        boxShadow: hovered
          ? '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,168,76,0.15)'
          : '0 8px 32px rgba(0,0,0,0.4)',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        transition: 'all 0.35s cubic-bezier(.22,1,.36,1)',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
      }}
    >
      {/* Left: visual panel */}
      <div style={{
        background: gradient,
        position: 'relative', overflow: 'hidden',
        minHeight: 320,
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        padding: '40px',
      }}>
        {/* Noise texture overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E")`,
          opacity: 0.4,
        }} />
        {/* Musical notation decoration */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          fontFamily: "'Lora', Georgia, serif",
          fontSize: '10rem', fontWeight: 700, fontStyle: 'italic',
          color: 'rgba(255,255,255,0.04)',
          userSelect: 'none', whiteSpace: 'nowrap',
          lineHeight: 1,
        }}>
          ♪
        </div>
        {/* Issue badge */}
        <div style={{
          position: 'relative', zIndex: 1,
          fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.22em',
          textTransform: 'uppercase', color: accent, opacity: 0.9,
          marginBottom: 12,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ width: 20, height: 1, background: accent, display: 'block' }} />
          Bài Viết Nổi Bật
        </div>
        <div style={{
          position: 'relative', zIndex: 1,
          fontFamily: "'Lora', Georgia, serif",
          fontSize: 'clamp(1.4rem, 2.5vw, 2rem)',
          fontWeight: 700, lineHeight: 1.25,
          color: textMain,
        }}>
          {post.title}
        </div>
      </div>

      {/* Right: content panel */}
      <div style={{
        padding: '44px 44px',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      }}>
        <div>
          {/* Category + date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <span style={{
              fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.2em',
              textTransform: 'uppercase', color: accent,
              background: `${accent}18`, padding: '5px 12px', borderRadius: 40,
              border: `1px solid ${accent}30`,
            }}>
              {CATEGORY_LABELS[post.category] ?? post.category}
            </span>
            <span style={{ fontSize: '0.72rem', color: textDim }}>{dateStr}</span>
          </div>

          {post.subtitle && (
            <p style={{ fontSize: '0.88rem', fontStyle: 'italic', color: textMuted, marginBottom: 16, lineHeight: 1.6 }}>
              {post.subtitle}
            </p>
          )}

          {post.excerpt && (
            <p style={{
              fontSize: '0.92rem', fontWeight: 300, lineHeight: 1.85, color: textMuted,
              display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {post.excerpt}
            </p>
          )}
        </div>

        {/* Footer row */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingTop: 28, marginTop: 28,
          borderTop: `1px solid ${borderFaint}`,
        }}>
          {post.tags && post.tags.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {post.tags.slice(0, 3).map(tag => (
                <span key={tag} style={{
                  fontSize: '0.62rem', color: 'rgba(201,168,76,0.5)',
                  border: '1px solid rgba(201,168,76,0.15)',
                  padding: '3px 10px', borderRadius: 40, letterSpacing: '0.06em',
                }}>
                  {tag}
                </span>
              ))}
            </div>
          )}
          <span style={{
            fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.1em',
            color: hovered ? gold : textDim,
            transition: 'color 0.22s ease', whiteSpace: 'nowrap', marginLeft: 'auto',
          }}>
            Đọc Bài →
          </span>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   POST CARD — grid cards
   ════════════════════════════════════════════════ */
function PostCard({ post, onOpen }: { post: CmsPost; onOpen: () => void }) {
  const [hovered, setHovered] = useState(false);
  const accent = ACCENT_COLORS[post.category] ?? gold;
  const gradient = CARD_GRADIENTS[post.category] ?? CARD_GRADIENTS.news;
  const dateStr = new Date(post.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div
      onClick={onOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? cardBgHover : cardBg,
        border: `1px solid ${hovered ? 'rgba(201,168,76,0.22)' : borderFaint}`,
        borderRadius: 14, cursor: 'pointer', overflow: 'hidden',
        boxShadow: hovered ? '0 20px 48px rgba(0,0,0,0.5)' : '0 4px 20px rgba(0,0,0,0.3)',
        transform: hovered ? 'translateY(-5px)' : 'translateY(0)',
        transition: 'all 0.32s cubic-bezier(.22,1,.36,1)',
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Color band top */}
      <div style={{
        height: 120, background: gradient,
        position: 'relative', overflow: 'hidden',
        display: 'flex', alignItems: 'flex-end', padding: '16px 24px',
      }}>
        <div style={{
          position: 'absolute', top: '50%', right: 24,
          transform: 'translateY(-50%)',
          fontSize: '5rem', lineHeight: 1,
          fontFamily: "'Lora', Georgia, serif", fontStyle: 'italic',
          color: 'rgba(255,255,255,0.05)', userSelect: 'none',
        }}>
          {post.category === 'event' ? '♫' : '♩'}
        </div>
        <span style={{
          position: 'relative', zIndex: 1,
          fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.22em',
          textTransform: 'uppercase', color: accent,
          background: `${accent}1A`, padding: '4px 12px', borderRadius: 40,
          border: `1px solid ${accent}28`,
        }}>
          {CATEGORY_LABELS[post.category] ?? post.category}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3 style={{
          fontFamily: "'Lora', Georgia, serif", fontSize: '1.12rem', fontWeight: 700,
          lineHeight: 1.4, marginBottom: 10,
          color: hovered ? gold : textMain,
          transition: 'color 0.22s ease',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {post.title}
        </h3>

        {post.subtitle && (
          <p style={{
            fontSize: '0.78rem', fontStyle: 'italic', color: textMuted,
            marginBottom: 10, lineHeight: 1.5,
          }}>
            {post.subtitle}
          </p>
        )}

        {post.excerpt && (
          <p style={{
            fontSize: '0.82rem', fontWeight: 300, lineHeight: 1.75, color: textMuted,
            marginBottom: 20, flex: 1,
            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {post.excerpt}
          </p>
        )}

        {/* Footer */}
        <div style={{
          borderTop: `1px solid ${borderFaint}`, paddingTop: 16,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: '0.68rem', color: textDim, letterSpacing: '0.05em' }}>{dateStr}</span>
          <span style={{
            fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: hovered ? gold : textDim,
            transition: 'color 0.22s ease',
          }}>
            Đọc →
          </span>
        </div>

        {post.tags && post.tags.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
            {post.tags.slice(0, 3).map(tag => (
              <span key={tag} style={{
                fontSize: '0.6rem', color: 'rgba(201,168,76,0.45)',
                border: '1px solid rgba(201,168,76,0.14)',
                padding: '2px 9px', borderRadius: 40, letterSpacing: '0.05em',
              }}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   SKELETON
   ════════════════════════════════════════════════ */
function SkeletonCard({ tall }: { tall?: boolean }) {
  return (
    <div style={{
      borderRadius: tall ? 16 : 14, background: cardBg,
      border: `1px solid ${borderFaint}`,
      height: tall ? 340 : 280, overflow: 'hidden',
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.04) 50%, transparent 100%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.8s infinite',
      }} />
    </div>
  );
}

function SkeletonGrid() {
  return (
    <>
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
      <SkeletonCard tall />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: 24, marginTop: 24 }}>
        {[0, 1, 2].map(i => <SkeletonCard key={i} />)}
      </div>
    </>
  );
}

function EmptyState() {
  return (
    <div style={{
      textAlign: 'center', padding: '80px 0',
      color: textDim, fontSize: '0.9rem', letterSpacing: '0.08em',
    }}>
      Chưa có bài viết trong danh mục này.
    </div>
  );
}

/* ════════════════════════════════════════════════
   POST MODAL
   ════════════════════════════════════════════════ */
function PostModal({ post, onClose }: { post: CmsPost; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', handler); document.body.style.overflow = ''; };
  }, [onClose]);

  const accent = ACCENT_COLORS[post.category] ?? gold;
  const gradient = CARD_GRADIENTS[post.category] ?? CARD_GRADIENTS.news;
  const dateStr = new Date(post.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(4,2,3,0.88)', backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '32px 20px',
        animation: 'fadeIn 0.25s ease',
      }}
    >
      <style>{`
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: cardBg,
          border: `1px solid rgba(201,168,76,0.18)`,
          borderRadius: 18, maxWidth: 760, width: '100%', maxHeight: '88vh',
          overflow: 'hidden', display: 'flex', flexDirection: 'column',
          boxShadow: '0 40px 100px rgba(0,0,0,0.8)',
          animation: 'slideUp 0.3s cubic-bezier(.22,1,.36,1)',
        }}
      >
        {/* Top band */}
        <div style={{
          background: gradient, height: 8, flexShrink: 0,
        }} />

        {/* Header */}
        <div style={{ padding: '32px 40px 24px', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{
                fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.2em',
                textTransform: 'uppercase', color: accent,
                background: `${accent}18`, padding: '5px 12px', borderRadius: 40,
                border: `1px solid ${accent}28`,
              }}>
                {CATEGORY_LABELS[post.category] ?? post.category}
              </span>
              <span style={{ fontSize: '0.72rem', color: textDim }}>{dateStr}</span>
            </div>

            <button
              onClick={onClose}
              style={{
                background: 'rgba(240,236,224,0.05)', border: `1px solid ${borderFaint}`,
                borderRadius: '50%', width: 36, height: 36,
                cursor: 'pointer', color: textMuted,
                fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s ease', flexShrink: 0,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(201,168,76,0.15)'; (e.currentTarget as HTMLButtonElement).style.color = gold; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(240,236,224,0.05)'; (e.currentTarget as HTMLButtonElement).style.color = textMuted; }}
            >
              ✕
            </button>
          </div>

          <h2 style={{
            fontFamily: "'Lora', Georgia, serif",
            fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
            fontWeight: 700, lineHeight: 1.25, color: textMain, marginBottom: 10,
          }}>
            {post.title}
          </h2>
          {post.subtitle && (
            <p style={{ fontSize: '0.9rem', fontStyle: 'italic', color: textMuted, lineHeight: 1.6 }}>
              {post.subtitle}
            </p>
          )}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: borderFaint, flexShrink: 0, margin: '0 40px' }} />

        {/* Body */}
        <div style={{ padding: '32px 40px', overflowY: 'auto', flex: 1 }}>
          {post.body ? renderBody(post.body) : (
            post.excerpt && (
              <p style={{ fontSize: '0.95rem', fontWeight: 300, lineHeight: 1.9, color: textMuted }}>
                {post.excerpt}
              </p>
            )
          )}

          {post.tags && post.tags.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 36, paddingTop: 24, borderTop: `1px solid ${borderFaint}` }}>
              {post.tags.map(tag => (
                <span key={tag} style={{
                  fontSize: '0.65rem', color: 'rgba(201,168,76,0.55)',
                  border: '1px solid rgba(201,168,76,0.2)',
                  padding: '4px 12px', borderRadius: 40, letterSpacing: '0.06em',
                }}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
