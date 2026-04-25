import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { LandingNav } from '../../layouts/components/LandingNav';
import { usePublishedCourses } from '../../domains/cms/hooks/useCmsPublic';
import type { CmsCourse } from '../../domains/cms/types';

/* ─── Reveal wrapper ─── */
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.75s ease ${delay}ms, transform 0.75s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

const gold = '#C9A84C';
const goldLight = '#E8C96B';
const darkBg = '#0a0608';
const textMain = '#f0ece0';
const glassBg = 'rgba(255,255,255,0.05)';

const faqs = [
  {
    q: 'Học phí có bao gồm tài liệu học không?',
    a: 'Học phí bao gồm tài liệu kỹ thuật số. Tài liệu in và sách giáo trình ABRSM được tính thêm tùy cấp độ.',
  },
  {
    q: 'Có thể tạm dừng khóa học không?',
    a: 'Có. Bạn có thể tạm dừng tối đa 1 tháng/năm với thông báo trước 7 ngày. Buổi học chưa sử dụng được bảo lưu.',
  },
  {
    q: 'Cần chuẩn bị nhạc cụ trước khi học không?',
    a: 'Không cần. Trung tâm có đầy đủ nhạc cụ cho buổi học. Chúng tôi sẽ tư vấn mua nhạc cụ phù hợp sau khi đánh giá nhu cầu của bạn.',
  },
  {
    q: 'Chính sách hoàn phí như thế nào?',
    a: 'Hoàn 100% học phí nếu hủy trước buổi học đầu tiên. Sau buổi 1, hoàn phần còn lại theo tỷ lệ buổi chưa học.',
  },
];

export function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const { courses, loading } = usePublishedCourses();

  const coursesWithPricing = courses.filter(c => c.price_groups && c.price_groups.length > 0);

  return (
    <div style={{ background: darkBg, color: textMain, fontFamily: "'Be Vietnam Pro', sans-serif", overflowX: 'hidden', minHeight: '100vh' }}>
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: `
          radial-gradient(ellipse 70% 50% at 15% 20%, rgba(107,45,62,0.28) 0%, transparent 60%),
          radial-gradient(ellipse 50% 40% at 85% 75%, rgba(27,42,74,0.35) 0%, transparent 60%)
        `,
      }} />

      <div style={{ position: 'relative', zIndex: 10 }}>
        <LandingNav />

        {/* ── HERO ── */}
        <section style={{ padding: '160px 40px 100px', textAlign: 'center' }}>
          <Reveal>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 12,
              fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.22em',
              textTransform: 'uppercase', color: gold, marginBottom: 24,
            }}>
              <span style={{ display: 'block', width: 32, height: 1, background: gold, opacity: 0.5 }} />
              Học Phí & Khóa Học
              <span style={{ display: 'block', width: 32, height: 1, background: gold, opacity: 0.5 }} />
            </div>
            <h1 style={{
              fontFamily: "'Lora', Georgia, serif",
              fontSize: 'clamp(2.8rem, 6vw, 5.5rem)',
              fontWeight: 700, lineHeight: 1.1, color: textMain, marginBottom: 20,
            }}>
              Học Phí{' '}
              <span style={{
                fontStyle: 'italic',
                background: `linear-gradient(135deg, ${gold} 0%, ${goldLight} 50%, ${gold} 100%)`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>Minh Bạch</span>
            </h1>
            <p style={{
              fontSize: 'clamp(0.95rem, 1.6vw, 1.15rem)', fontWeight: 300, lineHeight: 1.8,
              color: 'rgba(240,236,224,0.5)', maxWidth: 520, margin: '0 auto',
            }}>
              Chương trình linh hoạt theo lứa tuổi và tần suất học — minh bạch, không phát sinh.
            </p>
          </Reveal>
        </section>

        {/* ── COURSE TABS + PRICING ── */}
        {loading ? (
          <section style={{ padding: '0 40px 120px', maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ color: 'rgba(240,236,224,0.3)', fontSize: '0.9rem', letterSpacing: '0.1em' }}>
              Đang tải dữ liệu...
            </div>
          </section>
        ) : coursesWithPricing.length > 0 && (
          <section style={{ padding: '0 40px 120px', maxWidth: 1100, margin: '0 auto' }}>
            <Reveal>
              <div style={{ display: 'flex', gap: 2, marginBottom: 56, borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
                {coursesWithPricing.map((course, i) => (
                  <button
                    key={course.id}
                    onClick={() => setActiveTab(i)}
                    style={{
                      padding: '14px 36px',
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontFamily: "'Lora', Georgia, serif",
                      fontSize: '1rem', fontWeight: 600,
                      color: activeTab === i ? gold : 'rgba(240,236,224,0.35)',
                      borderBottom: `2px solid ${activeTab === i ? gold : 'transparent'}`,
                      marginBottom: -1,
                      transition: 'all 0.25s ease',
                    }}
                  >
                    {course.title}
                  </button>
                ))}
              </div>
            </Reveal>
            {coursesWithPricing[activeTab] && (
              <CoursePricingPanel course={coursesWithPricing[activeTab]} />
            )}
          </section>
        )}

        {/* ── ALL COURSES OVERVIEW ── */}
        {!loading && courses.length > 0 && (
          <section style={{ padding: '0 60px 120px', maxWidth: 1100, margin: '0 auto' }}>
            <Reveal>
              <div style={{ fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.25em', textTransform: 'uppercase', color: gold, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ display: 'block', width: 24, height: 1, background: gold, opacity: 0.6 }} />
                Các Bộ Môn
              </div>
              <h2 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', fontWeight: 700, lineHeight: 1.2, color: textMain, marginBottom: 56 }}>
                Tất Cả Khóa Học
              </h2>
            </Reveal>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 1, background: 'rgba(201,168,76,0.06)' }}>
              {courses.map((c, i) => (
                <Reveal key={c.id} delay={i * 80}>
                  <CourseCard course={c} />
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* Decorative text */}
        <div style={{
          fontFamily: "'Lora', Georgia, serif",
          fontSize: 'clamp(4rem, 11vw, 10rem)', fontWeight: 700, fontStyle: 'italic',
          color: 'rgba(201,168,76,0.035)', letterSpacing: '-0.03em', lineHeight: 1,
          userSelect: 'none', whiteSpace: 'nowrap', overflow: 'hidden', padding: '0 0 20px',
        }}>
          EXCELLENCE
        </div>

        {/* ── FAQ ── */}
        <section style={{ padding: '0 60px 120px', maxWidth: 800, margin: '0 auto' }}>
          <Reveal>
            <div style={{ fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.25em', textTransform: 'uppercase', color: gold, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ display: 'block', width: 24, height: 1, background: gold, opacity: 0.6 }} />
              Câu Hỏi Thường Gặp
            </div>
            <h2 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', fontWeight: 700, color: textMain, marginBottom: 48 }}>
              Giải Đáp Thắc Mắc
            </h2>
          </Reveal>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {faqs.map((faq, i) => (
              <Reveal key={i} delay={i * 60}>
                <div style={{
                  background: openFaq === i ? 'rgba(20,12,16,0.9)' : glassBg,
                  border: `1px solid ${openFaq === i ? 'rgba(201,168,76,0.3)' : 'rgba(201,168,76,0.1)'}`,
                  borderRadius: 2, transition: 'all 0.3s ease', overflow: 'hidden',
                }}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{
                      width: '100%', textAlign: 'left', padding: '24px 28px',
                      background: 'none', border: 'none', cursor: 'pointer',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16,
                    }}
                  >
                    <span style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: '0.95rem', fontWeight: 500, color: textMain, lineHeight: 1.4 }}>
                      {faq.q}
                    </span>
                    <span style={{
                      color: gold, fontSize: '1.4rem', lineHeight: 1, flexShrink: 0,
                      transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s ease',
                    }}>+</span>
                  </button>
                  {openFaq === i && (
                    <div style={{ padding: '0 28px 24px', fontSize: '0.88rem', fontWeight: 300, lineHeight: 1.8, color: 'rgba(240,236,224,0.5)' }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── CTA BOTTOM ── */}
        <Reveal>
          <section style={{
            textAlign: 'center', padding: '100px 60px 120px',
            borderTop: '1px solid rgba(201,168,76,0.08)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              width: 600, height: 300,
              background: 'radial-gradient(ellipse, rgba(107,45,62,0.2) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />
            <h2 style={{
              fontFamily: "'Lora', Georgia, serif",
              fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 700, lineHeight: 1.1,
              color: textMain, marginBottom: 20, position: 'relative',
            }}>
              Còn Băn Khoăn?<br />
              <span style={{
                fontStyle: 'italic',
                background: `linear-gradient(135deg, ${gold} 0%, ${goldLight} 50%, ${gold} 100%)`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>Học Thử Miễn Phí</span> Ngay Hôm Nay
            </h2>
            <p style={{ fontSize: '0.95rem', fontWeight: 300, color: 'rgba(240,236,224,0.4)', marginBottom: 44, position: 'relative' }}>
              Không cần cam kết. Một buổi trải nghiệm đủ để bạn quyết định.
            </p>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <button
                style={{
                  padding: '16px 52px',
                  background: 'linear-gradient(135deg, #6B2D3E 0%, #8B3A4E 100%)',
                  border: '1px solid rgba(201,168,76,0.3)', borderRadius: 2,
                  color: textMain, fontFamily: "'Be Vietnam Pro', sans-serif",
                  fontSize: '0.82rem', fontWeight: 500, letterSpacing: '0.14em',
                  textTransform: 'uppercase', cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 40px rgba(107,45,62,0.45)';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                }}
              >
                Đặt Lịch Học Thử
              </button>
            </Link>
          </section>
        </Reveal>

        {/* ── FOOTER ── */}
        <footer style={{
          padding: '48px 60px', borderTop: '1px solid rgba(201,168,76,0.1)',
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
    </div>
  );
}

/* ─── CoursePricingPanel ─── */
function CoursePricingPanel({ course }: { course: CmsCourse }) {
  return (
    <div>
      <Reveal>
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
            <h2 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 700, color: textMain, margin: 0 }}>
              {course.title}
            </h2>
            {course.subtitle && (
              <span style={{ fontFamily: "'Lora', Georgia, serif", fontSize: '1.05rem', fontStyle: 'italic', color: gold, opacity: 0.8 }}>
                — {course.subtitle}
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.9rem', fontWeight: 300, lineHeight: 1.8, color: 'rgba(240,236,224,0.45)', maxWidth: 700, marginBottom: 16 }}>
            {course.description}
          </p>
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            {course.duration && (
              <div style={{ fontSize: '0.78rem', color: 'rgba(201,168,76,0.6)' }}>
                <span style={{ color: 'rgba(240,236,224,0.3)', marginRight: 8 }}>Thời lượng:</span>
                {course.duration}
              </div>
            )}
            {course.age_range && (
              <div style={{ fontSize: '0.78rem', color: 'rgba(201,168,76,0.6)' }}>
                <span style={{ color: 'rgba(240,236,224,0.3)', marginRight: 8 }}>Độ tuổi:</span>
                {course.age_range}
              </div>
            )}
          </div>
        </div>
      </Reveal>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 1, background: 'rgba(201,168,76,0.06)' }}>
        {course.price_groups.map((group, gi) => (
          <Reveal key={gi} delay={gi * 80}>
            <div style={{
              background: 'rgba(10,6,8,0.88)', padding: '36px 32px',
              borderTop: gi === 0 ? `2px solid ${gold}` : '2px solid transparent',
              position: 'relative',
            }}>
              {gi === 0 && (
                <div style={{
                  position: 'absolute', top: 14, right: 16,
                  fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.14em',
                  textTransform: 'uppercase', color: darkBg,
                  background: gold, padding: '3px 10px', borderRadius: 1,
                }}>
                  Phổ biến
                </div>
              )}
              <div style={{ fontFamily: "'Lora', Georgia, serif", fontSize: '1.05rem', fontWeight: 600, color: textMain, marginBottom: 24 }}>
                {group.group}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {group.items.map((item, ii) => (
                  <div
                    key={ii}
                    style={{
                      borderBottom: ii < group.items.length - 1 ? '1px solid rgba(201,168,76,0.07)' : 'none',
                      paddingBottom: ii < group.items.length - 1 ? 16 : 0,
                    }}
                  >
                    <div style={{ fontSize: '0.76rem', color: 'rgba(240,236,224,0.35)', marginBottom: 8 }}>
                      {item.level}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
                      <span style={{
                        fontFamily: "'Lora', Georgia, serif", fontSize: '1.2rem', fontWeight: 700,
                        color: gi === 0 ? gold : textMain,
                      }}>
                        {item.sale}
                      </span>
                      {item.original && (
                        <span style={{ fontSize: '0.76rem', color: 'rgba(240,236,224,0.22)', textDecoration: 'line-through', fontWeight: 300 }}>
                          {item.original}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

/* ─── CourseCard ─── */
function CourseCard({ course }: { course: CmsCourse }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'rgba(18,12,14,0.95)' : 'rgba(10,6,8,0.88)',
        padding: '40px 36px', transition: 'background 0.35s ease',
      }}
    >
      <div style={{
        fontFamily: "'Lora', Georgia, serif", fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
        fontWeight: 700, fontStyle: 'italic', color: 'rgba(201,168,76,0.15)',
        lineHeight: 1, marginBottom: 16,
      }}>
        {course.number_label}
      </div>
      <div style={{ fontFamily: "'Lora', Georgia, serif", fontSize: '1.3rem', fontWeight: 700, color: textMain, marginBottom: 6 }}>
        {course.title}
      </div>
      {course.subtitle && (
        <div style={{ fontSize: '0.8rem', color: gold, opacity: 0.7, marginBottom: 16, fontStyle: 'italic' }}>
          {course.subtitle}
        </div>
      )}
      <p style={{ fontSize: '0.83rem', fontWeight: 300, lineHeight: 1.7, color: 'rgba(240,236,224,0.4)', marginBottom: 24 }}>
        {course.description}
      </p>
      {(course.duration || course.age_range) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {course.duration && (
            <div style={{ fontSize: '0.75rem', color: 'rgba(240,236,224,0.3)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 16, height: 1, background: gold, opacity: 0.4, display: 'block', flexShrink: 0 }} />
              {course.duration}
            </div>
          )}
          {course.age_range && (
            <div style={{ fontSize: '0.75rem', color: 'rgba(240,236,224,0.3)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 16, height: 1, background: gold, opacity: 0.4, display: 'block', flexShrink: 0 }} />
              {course.age_range}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
