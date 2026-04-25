import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export function LandingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { name: 'Trang Chủ', to: '/landingpage' },
    { name: 'Học Phí', to: '/hoc-phi' },
    { name: 'Blog', to: '/blog' },
    { name: 'Về Chúng Tôi', to: '/ve-chung-toi' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-navy/95 backdrop-blur-md shadow-lg shadow-black/30'
          : 'bg-gradient-to-b from-black/60 to-transparent backdrop-blur-none'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/landingpage" className="flex items-center shrink-0">
            <img src="/logo.png" alt="YayaMusic" className="h-14 w-auto object-contain drop-shadow-lg" />
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = location.pathname === link.to;
              return (
                <Link
                  key={link.name}
                  to={link.to}
                  className={`relative px-4 py-2 font-body font-medium text-sm tracking-wide transition-all duration-200 rounded-md group ${
                    active
                      ? 'text-gold'
                      : 'text-white/85 hover:text-gold'
                  }`}
                >
                  {link.name}
                  <span
                    className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-gold transition-all duration-200 rounded-full ${
                      active ? 'w-4/5' : 'w-0 group-hover:w-1/2'
                    }`}
                  />
                </Link>
              );
            })}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center">
            <Link
              to="/login"
              className="px-5 py-2 border border-gold/60 text-gold font-body font-semibold text-sm rounded-full hover:bg-gold hover:text-navy transition-all duration-200 tracking-wide"
            >
              Đăng Nhập
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white/80 hover:text-gold rounded-lg transition-colors"
            aria-label="Mở menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-navy/98 backdrop-blur-md border-t border-gold/20">
          <div className="px-4 py-5 space-y-1">
            {navLinks.map((link) => {
              const active = location.pathname === link.to;
              return (
                <Link
                  key={link.name}
                  to={link.to}
                  className={`block px-4 py-3 rounded-lg font-body font-medium transition-colors ${
                    active
                      ? 'text-gold bg-gold/10'
                      : 'text-white/80 hover:text-gold hover:bg-white/5'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              );
            })}
            <div className="pt-3 border-t border-gold/20">
              <Link
                to="/login"
                className="block w-full text-center py-3 border border-gold/60 text-gold font-body font-semibold rounded-full hover:bg-gold hover:text-navy transition-all duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Đăng Nhập
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
