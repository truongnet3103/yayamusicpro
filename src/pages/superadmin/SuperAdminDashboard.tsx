import { School, Users, TrendingUp, Settings, Activity, Shield, BookOpen, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useUser } from '../../domains/auth/contexts/UserContext';
import { RoleGuard } from '../../shared/components/guards/RoleGuard';
import { PermissionGuard } from '../../shared/components/guards/PermissionGuard';
import { Link } from 'react-router-dom';
import { supabase } from '../../shared/lib/supabase';

interface RecentSchool {
  id: string;
  name: string;
  created_at: string;
  is_active: boolean;
  subscription_tier: string;
}

interface DashboardStats {
  totalSchools: number;
  totalUsers: number;
  sessionsThisMonth: number;
  sessionsPendingVerify: number;
}

function SuperAdminDashboardContent() {
  const { profile } = useUser();
  const [stats, setStats] = useState<DashboardStats>({
    totalSchools: 0,
    totalUsers: 0,
    sessionsThisMonth: 0,
    sessionsPendingVerify: 0,
  });
  const [recentSchools, setRecentSchools] = useState<RecentSchool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const today = now.toISOString().split('T')[0];

        const [schoolsRes, usersRes, sessionsRes, pendingRes, recentRes] = await Promise.all([
          supabase.from('schools').select('id', { count: 'exact', head: true }).eq('is_active', true),
          supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
          supabase.from('class_sessions').select('id', { count: 'exact', head: true })
            .gte('session_date', startOfMonth).lte('session_date', today),
          supabase.from('class_sessions').select('id', { count: 'exact', head: true })
            .eq('status', 'claimed'),
          supabase.from('schools').select('id, name, created_at, is_active, subscription_tier')
            .order('created_at', { ascending: false }).limit(5),
        ]);

        setStats({
          totalSchools: schoolsRes.count ?? 0,
          totalUsers: usersRes.count ?? 0,
          sessionsThisMonth: sessionsRes.count ?? 0,
          sessionsPendingVerify: pendingRes.count ?? 0,
        });
        setRecentSchools(recentRes.data ?? []);
      } catch (err) {
        console.error('SuperAdmin dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const tierLabel: Record<string, string> = {
    free: 'Miễn phí',
    basic: 'Cơ bản',
    premium: 'Cao cấp',
    enterprise: 'Doanh nghiệp',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy font-display">Quản Trị Hệ Thống</h1>
        <p className="text-charcoal/60 font-body text-sm mt-1">Xin chào, {profile?.first_name}!</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-card border border-gold/20 p-6">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-primary/10 rounded-xl">
              <School className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs text-charcoal/60 font-body">Tổng số cơ sở</p>
            <p className="text-2xl font-bold text-navy font-display">
              {loading ? '—' : stats.totalSchools}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-card border border-gold/20 p-6">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-gold/20 rounded-xl">
              <Users className="w-5 h-5 text-gold" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs text-charcoal/60 font-body">Tổng người dùng</p>
            <p className="text-2xl font-bold text-navy font-display">
              {loading ? '—' : stats.totalUsers}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-card border border-gold/20 p-6">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-navy/10 rounded-xl">
              <BookOpen className="w-5 h-5 text-navy" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs text-charcoal/60 font-body">Buổi dạy tháng này</p>
            <p className="text-2xl font-bold text-navy font-display">
              {loading ? '—' : stats.sessionsThisMonth}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-card border border-gold/20 p-6">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-orange-100 rounded-xl">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs text-charcoal/60 font-body">Chờ xác nhận</p>
            <p className="text-2xl font-bold text-navy font-display">
              {loading ? '—' : stats.sessionsPendingVerify}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-card border border-gold/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-navy font-display">Cơ Sở Mới Nhất</h2>
            <Link
              to="/superadmin/schools"
              className="text-sm text-primary hover:text-primary-light font-body transition-colors"
            >
              Xem tất cả
            </Link>
          </div>
          <div className="space-y-3">
            {loading ? (
              <p className="text-sm text-charcoal/50 font-body text-center py-4">Đang tải...</p>
            ) : recentSchools.length > 0 ? (
              recentSchools.map((school) => (
                <div
                  key={school.id}
                  className="flex items-center justify-between p-3 bg-cream rounded-xl border border-gold/20"
                >
                  <div>
                    <p className="text-sm font-semibold text-navy font-body">{school.name}</p>
                    <p className="text-xs text-charcoal/50 font-body">
                      {new Date(school.created_at).toLocaleDateString('vi-VN')} · {tierLabel[school.subscription_tier] ?? school.subscription_tier}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium font-body ${
                    school.is_active ? 'bg-green-100 text-green-700' : 'bg-cream text-charcoal/60'
                  }`}>
                    {school.is_active ? 'Hoạt động' : 'Tạm ngừng'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-charcoal/50 font-body text-center py-4">Chưa có cơ sở nào</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-card border border-gold/20 p-6">
          <h2 className="text-lg font-semibold text-navy font-display mb-4">Trạng Thái Nền Tảng</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-navy font-body">Trạng thái hệ thống</span>
              </div>
              <span className="text-sm text-green-600 font-semibold font-body">Hoạt động</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-primary/5 rounded-xl border border-primary/20">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-navy font-body">Trạng thái API</span>
              </div>
              <span className="text-sm text-primary font-semibold font-body">Hoạt động</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gold/10 rounded-xl border border-gold/30">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-gold" />
                <span className="text-sm font-medium text-navy font-body">Thời gian hoạt động</span>
              </div>
              <span className="text-sm text-gold font-semibold font-body">99.9%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-gold/20 p-6">
        <h2 className="text-lg font-semibold text-navy font-display mb-4">Thao Tác Nhanh</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/superadmin/schools"
            className="p-4 bg-primary/5 hover:bg-primary/10 rounded-xl border border-primary/20 transition-colors text-center"
          >
            <School className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-sm font-medium text-navy font-body">Cơ sở</p>
          </Link>
          <Link
            to="/superadmin/users"
            className="p-4 bg-gold/10 hover:bg-gold/20 rounded-xl border border-gold/30 transition-colors text-center"
          >
            <Users className="w-6 h-6 text-gold mx-auto mb-2" />
            <p className="text-sm font-medium text-navy font-body">Người dùng</p>
          </Link>
          <Link
            to="/superadmin/subscriptions"
            className="p-4 bg-navy/5 hover:bg-navy/10 rounded-xl border border-navy/20 transition-colors text-center"
          >
            <TrendingUp className="w-6 h-6 text-navy mx-auto mb-2" />
            <p className="text-sm font-medium text-navy font-body">Gói đăng ký</p>
          </Link>
          <Link
            to="/superadmin/logs"
            className="p-4 bg-orange-50 hover:bg-orange-100 rounded-xl border border-orange-200 transition-colors text-center"
          >
            <Activity className="w-6 h-6 text-orange-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-navy font-body">Nhật ký buổi dạy</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export function SuperAdminDashboard() {
  return (
    <RoleGuard allowedRoles={['super_admin']}>
      <PermissionGuard requiredCapabilities={['admin:manage']}>
        <SuperAdminDashboardContent />
      </PermissionGuard>
    </RoleGuard>
  );
}
