import { useNavigate } from 'react-router-dom';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-cream min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="bg-primary/10 rounded-full w-40 h-40 flex items-center justify-center mx-auto mb-8">
            <span className="text-primary font-display" style={{ fontSize: '6rem', lineHeight: 1 }}>𝄞</span>
          </div>
          <h1 className="font-display text-8xl font-bold text-primary mb-4">404</h1>
          <h2 className="font-display text-3xl font-bold text-navy mb-4">Trang Không Tìm Thấy</h2>
          <p className="font-body text-charcoal mb-10 leading-relaxed">
            Trang bạn tìm kiếm không tồn tại hoặc đã bị di chuyển.
          </p>
        </div>

        <button
          onClick={() => navigate('/')}
          className="bg-primary text-white hover:bg-primary-light rounded-lg px-8 py-3 font-body font-semibold transition-colors shadow-card"
        >
          Về Trang Chủ
        </button>
      </div>
    </div>
  );
}
