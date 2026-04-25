import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../domains/auth/contexts/AuthContext';

export function UnauthorizedPage() {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  return (
    <div className="bg-cream min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="bg-primary/10 rounded-full w-40 h-40 flex items-center justify-center mx-auto mb-8">
            <span className="text-primary font-display" style={{ fontSize: '6rem', lineHeight: 1 }}>𝄢</span>
          </div>
          <h1 className="font-display text-8xl font-bold text-primary mb-4">403</h1>
          <h2 className="font-display text-3xl font-bold text-navy mb-4">Không Có Quyền Truy Cập</h2>
          <p className="font-body text-charcoal mb-10 leading-relaxed">
            Bạn không có quyền xem trang này. Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là lỗi.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate('/')}
            className="bg-primary text-white hover:bg-primary-light rounded-lg px-8 py-3 font-body font-semibold transition-colors shadow-card"
          >
            Về Trang Chủ
          </button>
          {user && (
            <button
              onClick={handleSignOut}
              className="border-2 border-primary text-primary hover:bg-primary/5 rounded-lg px-8 py-3 font-body font-semibold transition-colors"
            >
              Đăng Xuất
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
