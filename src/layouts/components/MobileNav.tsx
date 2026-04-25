import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  CheckSquare,
  User,
  Users,
  Settings,
  Award,
  FileText,
} from 'lucide-react';
import { useUser, UserRole } from '../../domains/auth/contexts/UserContext';

interface MobileNavItem {
  icon: any;
  label: string;
  path: string;
}

const mobileNavigationByRole: Record<UserRole, MobileNavItem[]> = {
  admin: [
    { icon: LayoutDashboard, label: 'Tổng quan', path: '/admin' },
    { icon: Users, label: 'Người dùng', path: '/admin/users' },
    { icon: BookOpen, label: 'Lớp học', path: '/admin/classes' },
    { icon: Settings, label: 'Cài đặt', path: '/admin/settings' },
  ],
  teacher: [
    { icon: LayoutDashboard, label: 'Tổng quan', path: '/teacher' },
    { icon: CheckSquare, label: 'Điểm danh', path: '/teacher/attendance' },
    { icon: BookOpen, label: 'Lớp học', path: '/teacher/classes' },
    { icon: User, label: 'Hồ sơ', path: '/profile' },
  ],
  parent: [
    { icon: LayoutDashboard, label: 'Tổng quan', path: '/parent' },
    { icon: Users, label: 'Con em', path: '/parent/children' },
    { icon: CheckSquare, label: 'Điểm danh', path: '/parent/attendance' },
    { icon: User, label: 'Hồ sơ', path: '/profile' },
  ],
  student: [
    { icon: LayoutDashboard, label: 'Tổng quan', path: '/student' },
    { icon: CheckSquare, label: 'Điểm danh', path: '/student/attendance' },
    { icon: Award, label: 'Kết quả', path: '/student/grades' },
    { icon: FileText, label: 'Bài tập', path: '/student/assignments' },
  ],
  staff: [
    { icon: LayoutDashboard, label: 'Tổng quan', path: '/staff' },
    { icon: Users, label: 'Học viên', path: '/staff/students' },
    { icon: User, label: 'Hồ sơ', path: '/profile' },
  ],
  it_admin: [
    { icon: LayoutDashboard, label: 'Tổng quan', path: '/it' },
    { icon: Settings, label: 'Hệ thống', path: '/it/integrations' },
    { icon: User, label: 'Hồ sơ', path: '/profile' },
  ],
  super_admin: [
    { icon: LayoutDashboard, label: 'Tổng quan', path: '/superadmin' },
    { icon: Users, label: 'Người dùng', path: '/superadmin/users' },
    { icon: Settings, label: 'Hệ thống', path: '/superadmin/settings' },
  ],
};

export function MobileNav() {
  const location = useLocation();
  const { role } = useUser();

  const navItems = role ? mobileNavigationByRole[role] : [];

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gold/20 z-20">
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center gap-1 transition-colors font-body ${
                isActive
                  ? 'text-primary'
                  : 'text-charcoal/60 hover:text-charcoal'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
