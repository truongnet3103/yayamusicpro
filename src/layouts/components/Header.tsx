import { Menu, LogOut, User, Settings } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NotificationBell } from '../../domains/communication/components/notifications/NotificationBell';
import { useAuth } from '../../domains/auth/contexts/AuthContext';
import { useUser } from '../../domains/auth/contexts/UserContext';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { profile } = useUser();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    setShowUserMenu(false);

    try {
      await signOut();
    } catch (error) {
      console.warn('Supabase signOut failed (session may already be invalid):', error);
    }

    window.location.href = '/login';
  };

  return (
    <header className="bg-white border-b border-gold/20 shadow-sm sticky top-0 z-40">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-charcoal/60 hover:text-primary transition-colors p-1"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="hidden sm:block">
            <span className="font-display text-navy text-sm opacity-60 select-none">♩</span>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <NotificationBell />

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2.5 hover:bg-cream rounded-lg px-2.5 py-1.5 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-semibold text-sm font-body">
                  {profile?.first_name?.[0]}
                  {profile?.last_name?.[0]}
                </span>
              </div>
              <span className="hidden md:block text-sm font-medium text-charcoal font-body">
                {profile?.full_name}
              </span>
            </button>

            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowUserMenu(false);
                  }}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-elegant border border-gold/20 py-2 z-20">
                  <div className="px-4 py-3 border-b border-gold/20">
                    <p className="text-sm font-semibold text-navy font-body">
                      {profile?.full_name}
                    </p>
                    <p className="text-xs text-charcoal/60 font-body mt-0.5">{profile?.email}</p>
                  </div>

                  <button
                    onClick={() => {
                      navigate('/profile');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-charcoal hover:bg-cream font-body transition-colors"
                  >
                    <User className="w-4 h-4 text-charcoal/50" />
                    <span>Hồ sơ</span>
                  </button>

                  <button
                    onClick={() => {
                      const role = profile?.user_type;
                      if (role === 'teacher') {
                        navigate('/teacher/settings');
                      } else if (role === 'admin' || role === 'staff') {
                        navigate('/admin/settings');
                      } else {
                        navigate('/settings');
                      }
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-charcoal hover:bg-cream font-body transition-colors"
                  >
                    <Settings className="w-4 h-4 text-charcoal/50" />
                    <span>Cài đặt</span>
                  </button>

                  <hr className="my-2 border-gold/20" />

                  <button
                    onClick={(e) => handleSignOut(e)}
                    type="button"
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-body transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
