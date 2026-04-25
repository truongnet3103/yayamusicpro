import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../domains/auth/contexts/AuthContext';

export function ForgotPasswordPage() {
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Không thể gửi email đặt lại mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-3xl text-primary font-display">♪</span>
            <span className="text-2xl font-display font-bold text-primary">YayaMusic</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-10">
          {success ? (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-primary" />
                </div>
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-navy mb-3">Email Đã Gửi!</h1>
                <p className="font-body text-charcoal text-sm leading-relaxed">
                  Chúng tôi đã gửi liên kết đặt lại mật khẩu đến{' '}
                  <strong className="text-navy">{email}</strong>.
                  Vui lòng kiểm tra hộp thư và làm theo hướng dẫn.
                </p>
              </div>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-primary hover:text-primary-light font-body font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Quay lại đăng nhập
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="font-display text-3xl font-bold text-navy mb-3">Khôi Phục Mật Khẩu</h1>
                <p className="font-body text-charcoal/70 leading-relaxed">
                  Nhập email đăng ký, chúng tôi sẽ gửi liên kết đặt lại mật khẩu
                </p>
              </div>

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
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal/40" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      className="border border-gold/40 rounded-lg bg-white focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none pl-11 pr-4 py-2.5 w-full font-body disabled:bg-cream disabled:cursor-not-allowed transition-colors"
                      placeholder="email@example.com"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-primary text-white rounded-lg font-body font-semibold hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Đang gửi...
                    </span>
                  ) : (
                    'Gửi Email Đặt Lại'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm font-body text-charcoal/70 hover:text-primary transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Quay lại đăng nhập
                </Link>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="font-body text-sm text-charcoal/60">
            Liên hệ quản trị viên trung tâm nếu bạn cần hỗ trợ thêm
          </p>
        </div>
      </div>
    </div>
  );
}
