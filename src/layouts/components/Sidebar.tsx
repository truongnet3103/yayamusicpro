import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Shield,
  CheckSquare,
  Award,
  Calendar,
  MessageSquare,
  Settings,
  School,
  FileText,
  DollarSign,
  X,
  Activity,
  TrendingUp,
  Bell,
  GraduationCap,
  Clock,
} from 'lucide-react';
import { useUser, UserRole } from '../../domains/auth/contexts/UserContext';

interface NavItem {
  icon: any;
  label: string;
  path: string;
}

const navigationByRole: Record<UserRole, NavItem[]> = {
  admin: [
    { icon: LayoutDashboard, label: 'Tổng quan', path: '/admin' },
    { icon: Users, label: 'Quản Lý Tài Khoản', path: '/admin/users' },
    { icon: BookOpen, label: 'Lớp học', path: '/admin/classes' },
    { icon: Clock, label: 'Khung giờ', path: '/admin/schedule-slots' },
  ],
  teacher: [
    { icon: LayoutDashboard, label: 'Tổng quan', path: '/teacher' },
    { icon: BookOpen, label: 'Lớp của tôi', path: '/teacher/classes' },
    { icon: CheckSquare, label: 'Điểm danh', path: '/teacher/attendance' },
    { icon: Award, label: 'Nhật ký tiến độ', path: '/teacher/gradebook' },
    { icon: Calendar, label: 'Lịch dạy', path: '/teacher/schedule' },
    { icon: MessageSquare, label: 'Tin nhắn', path: '/teacher/messages' },
    { icon: Settings, label: 'Cài đặt', path: '/teacher/settings' },
  ],
  parent: [
    { icon: LayoutDashboard, label: 'Tổng quan', path: '/parent' },
    { icon: Users, label: 'Con em', path: '/parent/children' },
    { icon: CheckSquare, label: 'Điểm danh', path: '/parent/attendance' },
    { icon: Award, label: 'Kết quả', path: '/parent/grades' },
    { icon: FileText, label: 'Bài tập luyện', path: '/parent/assignments' },
    { icon: DollarSign, label: 'Học phí', path: '/parent/fees' },
    { icon: MessageSquare, label: 'Tin nhắn', path: '/parent/messages' },
    { icon: Bell, label: 'Thông báo', path: '/parent/notifications' },
  ],
  student: [
    { icon: LayoutDashboard, label: 'Tổng quan', path: '/student' },
    { icon: CheckSquare, label: 'Điểm danh', path: '/student/attendance' },
    { icon: Award, label: 'Kết quả', path: '/student/grades' },
    { icon: FileText, label: 'Bài tập luyện', path: '/student/assignments' },
    { icon: Calendar, label: 'Lịch học', path: '/student/schedule' },
    { icon: BookOpen, label: 'Lớp của tôi', path: '/student/classes' },
  ],
  staff: [
    { icon: LayoutDashboard, label: 'Tổng quan', path: '/staff' },
    { icon: Users, label: 'Học viên', path: '/staff/students' },
    { icon: MessageSquare, label: 'Tin nhắn', path: '/staff/messages' },
  ],
  it_admin: [
    { icon: LayoutDashboard, label: 'Tổng quan', path: '/it' },
    { icon: Settings, label: 'Tích hợp', path: '/it/integrations' },
    { icon: Shield, label: 'Khóa API', path: '/it/api-keys' },
    { icon: Activity, label: 'Nhật ký', path: '/it/logs' },
    { icon: TrendingUp, label: 'Cập nhật', path: '/it/updates' },
  ],
  super_admin: [
    { icon: LayoutDashboard, label: 'Tổng quan', path: '/superadmin' },
    { icon: School, label: 'Cơ sở', path: '/superadmin/schools' },
    { icon: Users, label: 'Người dùng', path: '/superadmin/users' },
    { icon: BookOpen, label: 'Khoá học', path: '/superadmin/courses' },
    { icon: GraduationCap, label: 'Lớp học', path: '/admin/classes' },
    { icon: Clock, label: 'Khung giờ', path: '/admin/schedule-slots' },
    { icon: TrendingUp, label: 'Gói dịch vụ', path: '/superadmin/subscriptions' },
    { icon: Activity, label: 'Nhật ký', path: '/superadmin/logs' },
  ],
};

const roleDisplayNames: Record<UserRole, string> = {
  admin: 'Quản trị viên',
  teacher: 'Giảng viên',
  parent: 'Phụ huynh',
  student: 'Học viên',
  staff: 'Nhân viên',
  it_admin: 'IT Admin',
  super_admin: 'Super Admin',
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const { profile, role } = useUser();

  const navItems = role ? navigationByRole[role] : [];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-navy/60 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-cream-dark border-r border-gold/20 flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:transform-none lg:h-screen`}
      >
        {/* Logo area */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-gold/20 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-2xl text-primary">♪</span>
            <span className="font-display text-xl text-primary font-semibold">YayaMusic</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-charcoal/60 hover:text-charcoal transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <div className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-2.5 font-body text-sm transition-colors mx-2 rounded-r-lg ${
                    isActive
                      ? 'bg-primary/10 text-primary font-semibold border-l-2 border-primary'
                      : 'text-charcoal hover:bg-primary/8 hover:text-primary'
                  }`}
                >
                  <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User card */}
        <div className="flex-shrink-0 p-3">
          <div className="bg-white/50 rounded-xl border border-gold/20 p-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-semibold text-sm font-body">
                  {profile?.first_name?.[0]}
                  {profile?.last_name?.[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-navy truncate font-body">
                  {profile?.full_name}
                </p>
                <span className="inline-block bg-primary/10 text-primary text-xs rounded-full px-2 py-0.5 font-body mt-0.5">
                  {role ? roleDisplayNames[role] : ''}
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
