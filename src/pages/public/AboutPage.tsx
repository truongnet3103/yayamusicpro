import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Music, Award, Users, Heart, Star, ChevronRight } from 'lucide-react';

// ─── Design Tokens ───────────────────────────────────────────────
const darkBg = '#0a0608';
const gold = '#C9A84C';
const goldLight = '#E8C96B';
const textMain = '#f0ece0';
const textMuted = 'rgba(240,236,224,0.6)';
const glassBg = 'rgba(255,255,255,0.05)';
const glassBorder = `rgba(201,168,76,0.2)`;

// ─── Reveal Animation ─────────────────────────────────────────────
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ─── Data ─────────────────────────────────────────────────────────
const milestones = [
  { year: '2015', title: 'Thành Lập', desc: 'YayaMusic ra đời tại TP.HCM với 3 giáo viên và 20 học viên đầu tiên, mang theo giấc mơ lan tỏa âm nhạc cổ điển châu Âu đến Việt Nam.' },
  { year: '2017', title: 'Mở Rộng', desc: 'Khai giảng cơ sở thứ hai tại Hà Nội. Số lượng học viên vượt 500 người. Ra mắt chương trình học trực tuyến đầu tiên.' },
  { year: '2019', title: 'Giải Thưởng', desc: 'Nhận giải "Trung Tâm Âm Nhạc Xuất Sắc" từ Bộ Văn Hóa. Giáo viên đội ngũ của YayaMusic tham gia giảng dạy tại Nhạc Viện TP.HCM.' },
  { year: '2021', title: 'Chuyển Đổi Số', desc: 'Ra mắt nền tảng học trực tuyến toàn diện. Kết nối với 1.200+ học viên trên cả nước trong thời kỳ đại dịch.' },
  { year: '2024', title: 'Hiện Tại', desc: 'Hơn 2.000 học viên đang theo học. 45 giáo viên được đào tạo chuyên sâu. Tỷ lệ học viên thi đỗ đại học ngành âm nhạc đạt 94%.' },
];

const values = [
  { icon: Music, title: 'Nghệ Thuật Đích Thực', desc: 'Chúng tôi truyền dạy âm nhạc cổ điển châu Âu theo đúng kỹ thuật và cảm xúc nguyên bản, không đơn giản hóa hay thương mại hóa nghệ thuật.' },
  { icon: Heart, title: 'Tâm Huyết Từng Giờ', desc: 'Mỗi buổi học là một hành trình. Giáo viên YayaMusic không chỉ dạy kỹ thuật mà còn lắng nghe, đồng hành cùng từng học viên.' },
  { icon: Award, title: 'Chuẩn Mực Quốc Tế', desc: 'Chương trình học được xây dựng dựa trên giáo trình của các nhạc viện hàng đầu tại Vienna, London và Paris.' },
  { icon: Users, title: 'Cộng Đồng Âm Nhạc', desc: 'YayaMusic là nơi gặp gỡ của những người yêu âm nhạc — học viên, phụ huynh và nghệ sĩ cùng chia sẻ niềm đam mê.' },
];

const teachers = [
  {
    name: 'Nguyễn Minh Châu',
    role: 'Trưởng Bộ Môn Piano',
    bio: 'Tốt nghiệp xuất sắc Nhạc Viện Vienna. 15 năm kinh nghiệm giảng dạy. Từng biểu diễn tại Carnegie Hall.',
    specialty: 'Piano Cổ Điển • Nhạc Thính Phòng',
    initial: 'C',
  },
  {
    name: 'Trần Văn Đức',
    role: 'Giảng Viên Guitar',
    bio: 'Học bổng toàn phần tại Berklee College of Music. Chuyên gia guitar cổ điển và flamenco. Hơn 200 buổi hòa nhạc quốc tế.',
    specialty: 'Guitar Cổ Điển • Flamenco',
    initial: 'Đ',
  },
  {
    name: 'Lê Thu Hương',
    role: 'Giảng Viên Thanh Nhạc',
    bio: 'Cựu nghệ sĩ opera tại Nhà Hát Lớn Hà Nội. Chuyên đào tạo thanh nhạc cổ điển và contemporary.',
    specialty: 'Thanh Nhạc • Opera • Contemporary',
    initial: 'H',
  },
  {
    name: 'Phạm Quốc Bảo',
    role: 'Giảng Viên Violin',
    bio: 'Thành viên cũ của Vietnam National Symphony Orchestra. Thạc sĩ tại Conservatoire de Paris.',
    specialty: 'Violin • Viola • Nhạc Thính Phòng',
    initial: 'B',
  },
];

const stats = [
  { value: '2.000+', label: 'Học Viên' },
  { value: '45', label: 'Giáo Viên' },
  { value: '9', label: 'Năm Kinh Nghiệm' },
  { value: '94%', label: 'Tỷ Lệ Đỗ Nhạc Viện' },
];

// ─── Main Component ───────────────────────────────────────────────
export default function AboutPage() {
  return (
    <div style={{ background: darkBg, color: textMain, fontFamily: "'Be Vietnam Pro', sans-serif", minHeight: '100vh' }}>

      {/* ── HERO ── */}
      <section style={{ paddingTop: '140px', paddingBottom: '100px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Background radial glow */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '800px', height: '400px',
          background: `radial-gradient(ellipse, rgba(201,168,76,0.08) 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px', position: 'relative' }}>
          <Reveal>
            <p style={{ color: gold, fontFamily: "'Be Vietnam Pro', sans-serif", letterSpacing: '4px', fontSize: '12px', textTransform: 'uppercase', marginBottom: '20px' }}>
              Câu Chuyện Của Chúng Tôi
            </p>
            <h1 style={{
              fontFamily: "'Lora', Georgia, serif",
              fontSize: 'clamp(40px, 6vw, 72px)',
              fontWeight: 700,
              lineHeight: 1.15,
              marginBottom: '24px',
            }}>
              <span style={{ display: 'block' }}>Nơi Âm Nhạc</span>
              <span style={{ display: 'block', color: gold }}>Chạm Đến Tâm Hồn</span>
            </h1>
            <p style={{ fontSize: '18px', color: textMuted, lineHeight: 1.8, maxWidth: '600px', margin: '0 auto' }}>
              Từ năm 2015, YayaMusic đã và đang là người bạn đồng hành trên hành trình âm nhạc của hơn 2.000 học viên Việt Nam — nơi kỹ thuật cổ điển gặp gỡ tâm hồn hiện đại.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ padding: '60px 24px', borderTop: `1px solid ${glassBorder}`, borderBottom: `1px solid ${glassBorder}` }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '40px', textAlign: 'center' }}>
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 100}>
              <div style={{ fontSize: 'clamp(36px, 5vw, 52px)', fontFamily: "'Lora', Georgia, serif", color: gold, fontWeight: 700, lineHeight: 1 }}>
                {s.value}
              </div>
              <div style={{ marginTop: '8px', color: textMuted, fontSize: '14px', letterSpacing: '2px', textTransform: 'uppercase' }}>
                {s.label}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── STORY ── */}
      <section style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '60px', alignItems: 'center' }}>
          <Reveal>
            <p style={{ color: gold, letterSpacing: '4px', fontSize: '12px', textTransform: 'uppercase', marginBottom: '16px' }}>Sứ Mệnh</p>
            <h2 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, lineHeight: 1.25, marginBottom: '24px' }}>
              Mang Âm Nhạc Đến Mọi Nhà
            </h2>
            <p style={{ color: textMuted, lineHeight: 1.9, fontSize: '16px', marginBottom: '20px' }}>
              YayaMusic được thành lập với một niềm tin đơn giản: âm nhạc cổ điển không phải đặc quyền của số ít — đó là di sản văn hóa thuộc về tất cả mọi người.
            </p>
            <p style={{ color: textMuted, lineHeight: 1.9, fontSize: '16px' }}>
              Chúng tôi xây dựng môi trường học tập nơi mỗi học viên, dù 5 tuổi hay 50 tuổi, đều được tiếp cận với giáo trình chuẩn mực quốc tế trong bầu không khí ấm áp và chuyên nghiệp.
            </p>
          </Reveal>

          <Reveal delay={150}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* Decorative mosaic */}
              {[
                { h: '160px', bg: `rgba(201,168,76,0.12)`, text: '♪', size: '48px' },
                { h: '120px', bg: `rgba(201,168,76,0.06)`, text: '𝄞', size: '36px' },
                { h: '120px', bg: `rgba(201,168,76,0.06)`, text: '♫', size: '36px' },
                { h: '160px', bg: `rgba(201,168,76,0.12)`, text: '𝄢', size: '48px' },
              ].map((item, i) => (
                <div key={i} style={{
                  height: item.h,
                  background: item.bg,
                  border: `1px solid ${glassBorder}`,
                  borderRadius: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: item.size,
                  color: gold,
                }}>
                  {item.text}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section style={{ padding: '80px 24px', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: '64px' }}>
              <p style={{ color: gold, letterSpacing: '4px', fontSize: '12px', textTransform: 'uppercase', marginBottom: '16px' }}>Giá Trị Cốt Lõi</p>
              <h2 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700 }}>
                Điều Chúng Tôi Tin
              </h2>
            </div>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 100}>
                <div style={{
                  background: glassBg,
                  border: `1px solid ${glassBorder}`,
                  borderRadius: '16px',
                  padding: '32px',
                  transition: 'border-color 0.3s, transform 0.3s',
                }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = gold;
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = glassBorder;
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `rgba(201,168,76,0.15)`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                    <v.icon size={22} color={gold} />
                  </div>
                  <h3 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: '20px', fontWeight: 600, marginBottom: '12px' }}>{v.title}</h3>
                  <p style={{ color: textMuted, lineHeight: 1.75, fontSize: '15px' }}>{v.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── TIMELINE ── */}
      <section style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: '64px' }}>
              <p style={{ color: gold, letterSpacing: '4px', fontSize: '12px', textTransform: 'uppercase', marginBottom: '16px' }}>Hành Trình</p>
              <h2 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700 }}>
                9 Năm Phát Triển
              </h2>
            </div>
          </Reveal>

          <div style={{ position: 'relative', paddingLeft: '32px' }}>
            {/* Vertical line */}
            <div style={{ position: 'absolute', left: '8px', top: '8px', bottom: '8px', width: '1px', background: `linear-gradient(to bottom, ${gold}, transparent)` }} />

            {milestones.map((m, i) => (
              <Reveal key={m.year} delay={i * 120}>
                <div style={{ position: 'relative', marginBottom: '48px', paddingLeft: '24px' }}>
                  {/* Dot */}
                  <div style={{
                    position: 'absolute', left: '-28px', top: '4px',
                    width: '12px', height: '12px', borderRadius: '50%',
                    background: gold, border: `2px solid ${darkBg}`,
                    boxShadow: `0 0 8px ${gold}`,
                  }} />
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', marginBottom: '8px' }}>
                    <span style={{ color: gold, fontFamily: "'Lora', Georgia, serif", fontSize: '22px', fontWeight: 700 }}>{m.year}</span>
                    <span style={{ fontFamily: "'Lora', Georgia, serif", fontSize: '18px', fontWeight: 600 }}>{m.title}</span>
                  </div>
                  <p style={{ color: textMuted, lineHeight: 1.8, fontSize: '15px' }}>{m.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEACHERS ── */}
      <section style={{ padding: '80px 24px', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: '64px' }}>
              <p style={{ color: gold, letterSpacing: '4px', fontSize: '12px', textTransform: 'uppercase', marginBottom: '16px' }}>Đội Ngũ</p>
              <h2 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700 }}>
                Những Người Thầy Xuất Sắc
              </h2>
              <p style={{ color: textMuted, marginTop: '16px', maxWidth: '500px', margin: '16px auto 0', lineHeight: 1.7 }}>
                Mỗi giáo viên YayaMusic là một nghệ sĩ đã trải qua quá trình đào tạo chuyên sâu tại các nhạc viện hàng đầu thế giới.
              </p>
            </div>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
            {teachers.map((t, i) => (
              <Reveal key={t.name} delay={i * 100}>
                <div style={{
                  background: glassBg,
                  border: `1px solid ${glassBorder}`,
                  borderRadius: '16px',
                  padding: '32px',
                  textAlign: 'center',
                  transition: 'border-color 0.3s, transform 0.3s',
                }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = gold;
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = glassBorder;
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                  }}
                >
                  {/* Avatar placeholder */}
                  <div style={{
                    width: '72px', height: '72px', borderRadius: '50%',
                    background: `linear-gradient(135deg, rgba(201,168,76,0.3), rgba(201,168,76,0.1))`,
                    border: `2px solid ${gold}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 20px',
                    fontSize: '28px', fontFamily: "'Lora', Georgia, serif", color: gold, fontWeight: 700,
                  }}>
                    {t.initial}
                  </div>
                  <h3 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: '18px', fontWeight: 600, marginBottom: '4px' }}>{t.name}</h3>
                  <p style={{ color: gold, fontSize: '13px', letterSpacing: '1px', marginBottom: '16px' }}>{t.role}</p>
                  <p style={{ color: textMuted, fontSize: '14px', lineHeight: 1.7, marginBottom: '16px' }}>{t.bio}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
                    {t.specialty.split(' • ').map(tag => (
                      <span key={tag} style={{
                        background: 'rgba(201,168,76,0.1)', border: `1px solid rgba(201,168,76,0.3)`,
                        color: goldLight, fontSize: '11px', padding: '3px 10px', borderRadius: '20px',
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIAL QUOTE ── */}
      <section style={{ padding: '100px 24px', textAlign: 'center' }}>
        <Reveal>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <div style={{ fontSize: '64px', color: gold, lineHeight: 1, marginBottom: '24px', fontFamily: "'Lora', Georgia, serif' " }}>"</div>
            <p style={{
              fontFamily: "'Lora', Georgia, serif",
              fontSize: 'clamp(20px, 3vw, 28px)',
              lineHeight: 1.7,
              color: textMain,
              fontStyle: 'italic',
              marginBottom: '32px',
            }}>
              Âm nhạc không chỉ là tiếng đàn — đó là ngôn ngữ của tâm hồn, là cầu nối giữa những trái tim. Tại YayaMusic, chúng tôi dạy học trò không chỉ chơi đàn mà còn biết lắng nghe.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '1px', background: gold }} />
              <span style={{ color: gold, fontSize: '13px', letterSpacing: '2px' }}>NGUYỄN MINH CHÂU — Giám Đốc Âm Nhạc</span>
              <div style={{ width: '40px', height: '1px', background: gold }} />
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '80px 24px', borderTop: `1px solid ${glassBorder}` }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <Reveal>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '24px' }}>
              {[...Array(5)].map((_, i) => <Star key={i} size={16} fill={gold} color={gold} />)}
            </div>
            <h2 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700, marginBottom: '16px' }}>
              Bắt Đầu Hành Trình Của Bạn
            </h2>
            <p style={{ color: textMuted, fontSize: '16px', lineHeight: 1.8, marginBottom: '36px' }}>
              Tham gia cùng hơn 2.000 học viên đang trải nghiệm âm nhạc cổ điển châu Âu theo cách chưa từng có trước đây.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                to="/login"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  background: `linear-gradient(135deg, ${gold}, ${goldLight})`,
                  color: '#1a0e00', padding: '14px 32px', borderRadius: '8px',
                  fontWeight: 700, fontSize: '15px', textDecoration: 'none',
                  transition: 'opacity 0.2s, transform 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                Đăng Ký Học Thử Miễn Phí <ChevronRight size={16} />
              </Link>
              <Link
                to="/hoc-phi"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  border: `1px solid ${glassBorder}`, color: textMain,
                  padding: '14px 32px', borderRadius: '8px',
                  fontWeight: 500, fontSize: '15px', textDecoration: 'none',
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = gold; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = glassBorder; }}
              >
                Xem Học Phí
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: '48px 24px', borderTop: `1px solid ${glassBorder}`, textAlign: 'center' }}>
        <div style={{ fontFamily: "'Lora', Georgia, serif", fontSize: '24px', color: gold, marginBottom: '8px' }}>
          ♪ YayaMusic
        </div>
        <p style={{ color: textMuted, fontSize: '13px', marginBottom: '20px' }}>
          Trung Tâm Đào Tạo Âm Nhạc Châu Âu
        </p>
        <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { label: 'Trang Chủ', to: '/landingpage' },
            { label: 'Học Phí', to: '/hoc-phi' },
            { label: 'Đăng Nhập', to: '/login' },
          ].map(link => (
            <Link key={link.to} to={link.to} style={{ color: textMuted, fontSize: '14px', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.color = gold; }}
              onMouseLeave={e => { e.currentTarget.style.color = textMuted; }}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <p style={{ color: 'rgba(240,236,224,0.25)', fontSize: '12px', marginTop: '32px' }}>
          © 2024 YayaMusic. Tất cả quyền được bảo lưu.
        </p>
      </footer>

    </div>
  );
}
