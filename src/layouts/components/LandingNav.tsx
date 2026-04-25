import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export function LandingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Tính Năng', href: '#features' },
    { name: 'Học Phí', href: '#pricing' },
    { name: 'Về Chúng Tôi', href: '#about' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gold/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-2xl text-primary font-display leading-none">♪</span>
            <span className="text-xl font-display font-bold text-primary tracking-wide">YayaMusic</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-charcoal hover:text-primary font-body font-medium transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/login"
              className="text-charcoal hover:text-primary font-body font-medium transition-colors"
            >
              Đăng Nhập
            </Link>
            <Link
              to="/login"
              className="bg-primary text-white px-6 py-2 rounded-lg font-body font-semibold hover:bg-primary-light transition-colors shadow-sm"
            >
              Dùng Thử Miễn Phí
            </Link>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-charcoal hover:bg-cream-dark rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gold/20 bg-white">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="block py-2 text-charcoal hover:text-primary font-body font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <div className="pt-3 border-t border-gold/20 space-y-2">
              <Link
                to="/login"
                className="block py-2 text-charcoal hover:text-primary font-body font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Đăng Nhập
              </Link>
              <Link
                to="/login"
                className="block w-full text-center bg-primary text-white px-6 py-2 rounded-lg font-body font-semibold hover:bg-primary-light transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dùng Thử Miễn Phí
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
