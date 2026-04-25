import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import {
  UserCheck,
  Bell,
  BarChart3,
  Users,
  MessageCircle,
  Shield,
  CheckCircle,
} from 'lucide-react';
import { LandingNav } from '../../layouts/components/LandingNav';
import MusicNotesBackground from '../../components/MusicNotesBackground';

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
    const duration = 1600;
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

/* ─── FadeIn wrapper: slides up + fades in on scroll ─── */
function FadeIn({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, visible } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ─── Floating music note ─── */
function FloatingNote({
  char,
  style,
  animClass,
}: {
  char: string;
  style: React.CSSProperties;
  animClass: string;
}) {
  return (
    <span
      className={`absolute select-none pointer-events-none font-display ${animClass}`}
      style={style}
    >
      {char}
    </span>
  );
}

export function HomePage() {
  /* Hero entrance */
  const [heroReady, setHeroReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setHeroReady(true), 80);
    return () => clearTimeout(t);
  }, []);

  const features = [
    {
      icon: UserCheck,
      title: 'Điểm Danh Thông Minh',
      description: 'Theo dõi điểm danh tự động, thông báo tức thì đến phụ huynh và báo cáo theo thời gian thực.',
    },
    {
      icon: Bell,
      title: 'Thông Báo Tức Thời',
      description: 'Cập nhật liên tục cho phụ huynh và học viên về lịch học, bài tập và các sự kiện âm nhạc.',
    },
    {
      icon: BarChart3,
      title: 'Phân Tích Mạnh Mẽ',
      description: 'Dữ liệu chuyên sâu để theo dõi tiến độ học viên, xu hướng điểm danh và chỉ số tương tác.',
    },
    {
      icon: Users,
      title: 'Quản Lý Đa Vai Trò',
      description: 'Giao diện riêng cho quản trị viên, giảng viên, phụ huynh và học viên với quyền hạn phù hợp.',
    },
    {
      icon: MessageCircle,
      title: 'Trung Tâm Liên Lạc',
      description: 'Kết nối liền mạch giữa giảng viên, phụ huynh và ban quản lý trong một nền tảng duy nhất.',
    },
    {
      icon: Shield,
      title: 'Bảo Mật Doanh Nghiệp',
      description: 'Bảo mật cấp doanh nghiệp với kiểm soát truy cập theo vai trò và mã hóa dữ liệu.',
    },
  ];

  const pricingPlans = [
    {
      name: 'Cơ Bản',
      price: '690.000₫',
      period: '/tháng',
      limit: '≤200 học viên',
      features: [
        'Theo dõi điểm danh cơ bản',
        'Thông báo email',
        'Cổng phụ huynh',
        'Hỗ trợ email',
      ],
      highlighted: false,
      cta: 'Bắt Đầu Ngay',
    },
    {
      name: 'Chuyên Nghiệp',
      price: '1.890.000₫',
      period: '/tháng',
      limit: '≤1.000 học viên',
      badge: 'Phổ biến nhất',
      features: [
        'Điểm danh & phân tích nâng cao',
        'Thông báo SMS & email',
        'Thương hiệu tùy chỉnh',
        'API access',
        'Hỗ trợ ưu tiên',
        'Buổi đào tạo',
      ],
      highlighted: true,
      cta: 'Bắt Đầu Ngay',
    },
    {
      name: 'Doanh Nghiệp',
      price: 'Liên hệ',
      period: '',
      limit: 'Không giới hạn',
      features: [
        'Toàn bộ tính năng',
        'Quản lý đa trung tâm',
        'Quản lý tài khoản riêng',
        'Tích hợp tùy chỉnh',
        'Hỗ trợ 24/7',
      ],
      highlighted: false,
      cta: 'Liên Hệ',
    },
  ];

  const testimonials = [
    {
      quote: 'YayaMusic đã thay đổi cách chúng tôi quản lý trung tâm. Điểm danh giờ đây thật dễ dàng, và sự tương tác của phụ huynh tăng lên rõ rệt.',
      name: 'Nguyễn Thị Lan',
      role: 'Giám đốc, Trung tâm Âm nhạc Thăng Long',
    },
    {
      quote: 'Phần mềm rất trực quan và dễ dùng. Tôi có thể theo dõi tiến độ từng học viên và liên lạc với phụ huynh chỉ trong vài cú nhấp chuột.',
      name: 'Trần Văn Minh',
      role: 'Giảng viên, Trung tâm Piano Melody',
    },
    {
      quote: 'Từ khi dùng YayaMusic, chúng tôi tiết kiệm hơn 10 giờ mỗi tuần cho công việc hành chính và tập trung nhiều hơn vào chất lượng giảng dạy.',
      name: 'Lê Thị Hương',
      role: 'Quản lý, Học viện Âm nhạc Hà Nội',
    },
  ];

  /* Decorative floating notes data */
  const floatingNotes = [
    { char: '♩', style: { top: '18%', left: '8%', fontSize: '2.2rem', color: 'rgba(201,168,76,0.18)' }, animClass: 'anim-float-a' },
    { char: '♪', style: { top: '55%', left: '5%', fontSize: '1.6rem', color: 'rgba(255,255,255,0.12)' }, animClass: 'anim-float-b' },
    { char: '♫', style: { top: '30%', right: '6%', fontSize: '2.5rem', color: 'rgba(201,168,76,0.14)' }, animClass: 'anim-float-c' },
    { char: '♬', style: { top: '70%', right: '9%', fontSize: '1.8rem', color: 'rgba(255,255,255,0.10)' }, animClass: 'anim-float-a' },
    { char: '𝄞', style: { top: '12%', right: '20%', fontSize: '2.8rem', color: 'rgba(201,168,76,0.10)' }, animClass: 'anim-float-b' },
    { char: '♩', style: { top: '80%', left: '18%', fontSize: '1.4rem', color: 'rgba(255,255,255,0.08)' }, animClass: 'anim-float-c' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* CSS keyframe animations — scoped inline */}
      <style>{`
        @keyframes floatA {
          0%, 100% { transform: translateY(0px) rotate(-4deg); }
          50%       { transform: translateY(-22px) rotate(4deg); }
        }
        @keyframes floatB {
          0%, 100% { transform: translateY(0px) rotate(3deg); }
          50%       { transform: translateY(-16px) rotate(-5deg); }
        }
        @keyframes floatC {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33%       { transform: translateY(-12px) rotate(-3deg); }
          66%       { transform: translateY(-20px) rotate(3deg); }
        }
        @keyframes heroBadge {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroTitle {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroSub {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroButtons {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .anim-float-a { animation: floatA 7s ease-in-out infinite; }
        .anim-float-b { animation: floatB 9s ease-in-out infinite; }
        .anim-float-c { animation: floatC 11s ease-in-out infinite; }
        .hero-badge   { animation: heroBadge 0.7s ease both; animation-delay: 100ms; }
        .hero-title   { animation: heroTitle 0.8s ease both; animation-delay: 300ms; }
        .hero-sub     { animation: heroSub   0.8s ease both; animation-delay: 500ms; }
        .hero-buttons { animation: heroButtons 0.7s ease both; animation-delay: 680ms; }
        .hero-checks  { animation: heroButtons 0.7s ease both; animation-delay: 820ms; }
        .gold-shimmer {
          background: linear-gradient(90deg, #C9A84C 0%, #f0d27a 40%, #C9A84C 60%, #a87c2a 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3.5s linear infinite;
        }
        .card-hover {
          transition: transform 0.28s ease, box-shadow 0.28s ease;
        }
        .card-hover:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 40px rgba(107,45,62,0.12);
        }
        .pulse-dot {
          animation: floatA 2s ease-in-out infinite;
        }
      `}</style>

      <LandingNav />

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center bg-gradient-to-br from-navy via-primary-dark to-navy overflow-hidden pt-16">
        <MusicNotesBackground />

        {/* Extra floating notes layered on top */}
        {floatingNotes.map((n, i) => (
          <FloatingNote key={i} char={n.char} style={n.style} animClass={n.animClass} />
        ))}

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 w-full">
          <div className="text-center max-w-4xl mx-auto">

            <div
              className="hero-badge inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2 mb-10"
              style={{ opacity: heroReady ? undefined : 0 }}
            >
              <span className="text-gold text-lg pulse-dot inline-block">♪</span>
              <span className="text-sm font-body font-medium text-white/90">500+ trung tâm âm nhạc tin dùng</span>
            </div>

            <h1
              className="hero-title font-display text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
              style={{ opacity: heroReady ? undefined : 0 }}
            >
              Nâng Tầm Âm Nhạc —<br />
              <span className="gold-shimmer">Tinh Tế Từng Nốt Nhạc</span>
            </h1>

            <p
              className="hero-sub text-white/80 text-xl font-body mb-10 max-w-3xl mx-auto leading-relaxed"
              style={{ opacity: heroReady ? undefined : 0 }}
            >
              Phần mềm quản lý trung tâm âm nhạc chuyên nghiệp — Đơn giản, sang trọng, hiệu quả
            </p>

            <div
              className="hero-buttons flex flex-col sm:flex-row gap-4 justify-center items-center"
              style={{ opacity: heroReady ? undefined : 0 }}
            >
              <Link
                to="/login"
                className="bg-gold text-navy px-8 py-4 rounded-lg font-body font-semibold text-lg hover:bg-gold-light transition-all shadow-elegant hover:shadow-lg inline-flex items-center gap-2 hover:scale-105 active:scale-95"
                style={{ transition: 'transform 0.18s ease, background 0.2s ease, box-shadow 0.2s ease' }}
              >
                Bắt Đầu Miễn Phí
              </Link>
              <a
                href="#features"
                className="border border-white/30 text-white px-8 py-4 rounded-lg font-body font-semibold text-lg hover:bg-white/10 transition-all backdrop-blur-sm"
              >
                Xem Demo
              </a>
            </div>

            <div
              className="hero-checks mt-12 flex flex-wrap justify-center gap-6 text-sm font-body"
              style={{ opacity: heroReady ? undefined : 0 }}
            >
              {['500+ trung tâm tin dùng', 'Không cần thẻ tín dụng', 'Hủy bất kỳ lúc nào'].map((text, i) => (
                <div key={i} className="flex items-center gap-2 text-white/80">
                  <CheckCircle className="w-5 h-5 text-gold" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-cream to-transparent" />
      </section>

      {/* ── Stats Bar ── */}
      <section className="bg-cream border-y border-gold/30 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { targetNum: 10, suffix: '+', label: 'Tiết kiệm giờ/tuần' },
              { targetNum: 40, suffix: '%', label: 'Tăng tương tác' },
              { targetNum: 99, suffix: '.9%', label: 'Uptime đảm bảo' },
              { targetNum: 500, suffix: '+', label: 'Trung tâm tin dùng' },
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 80} className="text-center">
                <p className="font-display text-4xl font-bold text-primary mb-1">
                  <AnimatedCounter target={item.targetNum} suffix={item.suffix} />
                </p>
                <p className="font-body text-charcoal text-sm">{item.label}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <p className="text-gold font-body font-medium mb-3 tracking-wider uppercase text-sm">Tính Năng</p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-navy mb-4">
              Mọi Thứ Bạn Cần Để Quản Lý Chuyên Nghiệp
            </h2>
            <p className="font-body text-charcoal text-xl max-w-3xl mx-auto">
              Tính năng mạnh mẽ được thiết kế để đơn giản hóa quản lý và nâng cao chất lượng đào tạo âm nhạc
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FadeIn key={index} delay={index * 70}>
                <div className="bg-white border border-gold/20 rounded-2xl p-8 group card-hover h-full">
                  <div
                    className="bg-primary/10 rounded-xl p-3 w-12 h-12 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors"
                    style={{ transition: 'background 0.25s ease' }}
                  >
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-navy mb-3">{feature.title}</h3>
                  <p className="font-body text-charcoal leading-relaxed">{feature.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <p className="text-gold font-body font-medium mb-3 tracking-wider uppercase text-sm">Học Phí</p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-navy mb-4">
              Gói Dịch Vụ Phù Hợp
            </h2>
            <p className="font-body text-charcoal text-xl">
              Linh hoạt theo quy mô và nhu cầu của trung tâm bạn
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <FadeIn key={index} delay={index * 100}>
                <div
                  className={`rounded-2xl p-8 transition-all h-full card-hover ${
                    plan.highlighted
                      ? 'ring-2 ring-gold bg-navy text-white shadow-elegant scale-105'
                      : 'bg-white border border-gold/20 shadow-card'
                  }`}
                >
                  {plan.badge && (
                    <div className="bg-gold text-navy text-sm font-body font-semibold px-4 py-1 rounded-full inline-block mb-4">
                      {plan.badge}
                    </div>
                  )}
                  <h3 className={`font-display text-2xl font-bold mb-2 ${plan.highlighted ? 'text-white' : 'text-navy'}`}>
                    {plan.name}
                  </h3>
                  <p className={`font-body text-sm mb-6 ${plan.highlighted ? 'text-white/70' : 'text-charcoal/70'}`}>
                    {plan.limit}
                  </p>
                  <div className="mb-6">
                    <span className={`font-display text-4xl font-bold ${plan.highlighted ? 'text-gold' : 'text-primary'}`}>
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className={`font-body ml-1 ${plan.highlighted ? 'text-white/70' : 'text-charcoal/70'}`}>
                        {plan.period}
                      </span>
                    )}
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-start gap-3 font-body">
                        <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.highlighted ? 'text-gold' : 'text-primary'}`} />
                        <span className={plan.highlighted ? 'text-white/90' : 'text-charcoal'}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <button
                    className={`w-full py-3 px-6 rounded-lg font-body font-semibold transition-all hover:scale-105 active:scale-95 ${
                      plan.highlighted
                        ? 'bg-gold text-navy hover:bg-gold-light shadow-md'
                        : 'bg-primary text-white hover:bg-primary-light'
                    }`}
                  >
                    {plan.cta}
                  </button>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="about" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <p className="text-gold font-body font-medium mb-3 tracking-wider uppercase text-sm">Đánh Giá</p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-navy mb-4">
              Được Tin Dùng Bởi Các Trung Tâm Hàng Đầu
            </h2>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <FadeIn key={index} delay={index * 90}>
                <div className="bg-cream-dark rounded-xl border border-gold/20 shadow-card p-8 card-hover h-full flex flex-col">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className="text-gold text-lg"
                        style={{
                          animation: `floatB ${1.2 + i * 0.15}s ease-in-out infinite`,
                          display: 'inline-block',
                        }}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="font-accent italic text-charcoal text-lg leading-relaxed mb-6 flex-1">
                    "{testimonial.quote}"
                  </p>
                  <div>
                    <p className="font-body font-semibold text-navy">{testimonial.name}</p>
                    <p className="font-body text-sm text-charcoal/70 mt-1">{testimonial.role}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24 bg-gradient-to-r from-primary to-primary-dark relative overflow-hidden">
        {/* Background floating note accents */}
        <span className="absolute top-6 left-8 text-5xl text-white/5 font-display anim-float-a select-none">𝄞</span>
        <span className="absolute bottom-6 right-10 text-4xl text-white/5 font-display anim-float-b select-none">♫</span>
        <span className="absolute top-1/2 left-1/4 text-3xl text-white/5 font-display anim-float-c select-none">♩</span>

        <FadeIn className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-6">
            Sẵn Sàng Nâng Tầm Trung Tâm Của Bạn?
          </h2>
          <p className="font-body text-white/80 text-xl mb-10 max-w-2xl mx-auto">
            Tham gia cùng 500+ trung tâm âm nhạc đang dùng YayaMusic để quản lý chuyên nghiệp hơn
          </p>
          <Link
            to="/login"
            className="bg-gold text-navy px-10 py-4 rounded-lg font-body font-semibold text-lg hover:bg-gold-light transition-all shadow-elegant inline-block hover:scale-105 active:scale-95"
            style={{ transition: 'transform 0.18s ease, background 0.2s ease' }}
          >
            Bắt Đầu Miễn Phí Ngay
          </Link>
        </FadeIn>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-navy text-white/70 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-10 mb-10">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl text-gold font-display anim-float-b inline-block">♪</span>
                <span className="text-xl font-display font-bold text-white">YayaMusic</span>
              </div>
              <p className="font-body text-sm text-white/60 leading-relaxed">
                Nâng tầm âm nhạc Việt — Phần mềm quản lý trung tâm âm nhạc chuyên nghiệp.
              </p>
            </div>
            <div>
              <h4 className="font-body font-semibold text-white mb-4">Sản phẩm</h4>
              <ul className="space-y-2 text-sm font-body">
                <li><a href="#" className="hover:text-white transition-colors">Tính năng</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Học phí</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Bảo mật</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tích hợp</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-body font-semibold text-white mb-4">Công ty</h4>
              <ul className="space-y-2 text-sm font-body">
                <li><a href="#" className="hover:text-white transition-colors">Về chúng tôi</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tuyển dụng</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Liên hệ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-body font-semibold text-white mb-4">Hỗ trợ</h4>
              <ul className="space-y-2 text-sm font-body">
                <li><a href="#" className="hover:text-white transition-colors">Trung tâm trợ giúp</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tài liệu</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Đăng nhập</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="font-body text-sm text-white/50">
              © 2025 YayaMusic. Bảo lưu mọi quyền.
            </p>
            <div className="flex gap-6 text-sm font-body">
              <a href="#" className="hover:text-white transition-colors">Chính sách bảo mật</a>
              <a href="#" className="hover:text-white transition-colors">Điều khoản dịch vụ</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
