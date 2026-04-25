import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../domains/auth/contexts/AuthContext';
import { useUser } from '../../domains/auth/contexts/UserContext';
import { getRoleBasedRoute } from '../../domains/auth/utils/roleRedirect';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, user } = useAuth();
  const { profile, loading: profileLoading } = useUser();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname;

  useEffect(() => {
    if (user && profile && !profileLoading) {
      const redirectTo = from || getRoleBasedRoute(profile.user_type);
      navigate(redirectTo, { replace: true });
    }
  }, [user, profile, profileLoading, from, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signIn(email, password);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to sign in';
      if (errorMessage.includes('Invalid login credentials')) {
        setError('Email hoặc mật khẩu không đúng. Vui lòng thử lại.');
      } else if (errorMessage.includes('Email not confirmed')) {
        setError('Vui lòng xác minh địa chỉ email trước khi đăng nhập.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading || (user && profileLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="font-body text-charcoal">Đang đăng nhập...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-navy to-primary-dark relative overflow-hidden flex-col items-center justify-center p-12">
        <div
          className="absolute inset-0 flex items-center justify-center select-none pointer-events-none"
          aria-hidden="true"
        >
          <span style={{ fontSize: '32rem', opacity: 0.06, color: 'white', lineHeight: 1 }}>𝄞</span>
        </div>
        <div className="relative z-10 text-center max-w-sm">
          <div className="flex items-center justify-center gap-3 mb-8">
            <span className="text-4xl text-gold font-display">♪</span>
            <span className="text-3xl font-display font-bold text-white">YayaMusic</span>
          </div>
          <p className="font-accent italic text-white/80 text-2xl leading-relaxed mb-8">
            "Âm nhạc là ngôn ngữ của tâm hồn, là sợi dây kết nối trái tim."
          </p>
          <p className="font-body text-white/50 text-sm">
            Phần mềm quản lý trung tâm âm nhạc chuyên nghiệp tại Việt Nam
          </p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 bg-cream flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-2xl shadow-card p-10 max-w-md w-full">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <span className="text-2xl text-primary font-display">♪</span>
            <span className="text-xl font-display font-bold text-primary">YayaMusic</span>
          </div>

          <h1 className="font-display text-3xl font-bold text-navy mb-2 text-center">Đăng Nhập</h1>
          <p className="font-body text-charcoal/70 text-center mb-8">Chào mừng trở lại YayaMusic</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm font-body">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-body font-semibold text-charcoal mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="border border-gold/40 rounded-lg bg-white focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none px-4 py-2.5 w-full font-body disabled:bg-cream disabled:cursor-not-allowed transition-colors"
                placeholder="email@example.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-body font-semibold text-charcoal mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="border border-gold/40 rounded-lg bg-white focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none px-4 py-2.5 pr-12 w-full font-body disabled:bg-cream disabled:cursor-not-allowed transition-colors"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/50 hover:text-charcoal focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer font-body text-sm text-charcoal">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gold/40 text-primary focus:ring-primary/30"
                />
                Nhớ đăng nhập
              </label>
              <Link
                to="/forgot-password"
                className="text-sm font-body font-medium text-primary hover:text-primary-light transition-colors"
              >
                Quên mật khẩu?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-white rounded-lg font-body font-semibold hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang đăng nhập...
                </span>
              ) : (
                'Đăng Nhập'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="font-body text-sm text-charcoal/60">
              Tài khoản mới được tạo bởi quản trị viên trung tâm
            </p>
            <Link
              to="/"
              className="mt-3 inline-block text-sm font-body font-medium text-primary hover:text-primary-light transition-colors"
            >
              ← Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
