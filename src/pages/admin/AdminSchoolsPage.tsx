import { School, BarChart3, Settings, Building2, Users, BookOpen, Calendar, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useUser } from '../../domains/auth/contexts/UserContext';
import { useTenant } from '../../shared/contexts/TenantContext';
import { RoleGuard } from '../../shared/components/guards/RoleGuard';
import { PermissionGuard } from '../../shared/components/guards/PermissionGuard';
import { supabase } from '../../shared/lib/supabase';
import type { School as SchoolType } from '../../shared/types/tenant';

type TabType = 'dashboard' | 'customization';

function SchoolDashboardTab({ school }: { school: SchoolType | null }) {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      if (!school) return;

      try {
        // Fetch statistics for the current school
        const [studentsResult, teachersResult, classesResult, usersResult] = await Promise.all([
          supabase.from('students').select('id', { count: 'exact', head: true }).eq('school_id', school.id),
          supabase.from('teachers').select('id', { count: 'exact', head: true }).eq('school_id', school.id),
          supabase.from('classes').select('id', { count: 'exact', head: true }).eq('school_id', school.id),
          supabase.from('user_profiles').select('id', { count: 'exact', head: true }).eq('school_id', school.id),
        ]);

        setStats({
          totalStudents: studentsResult.count || 0,
          totalTeachers: teachersResult.count || 0,
          totalClasses: classesResult.count || 0,
          totalUsers: usersResult.count || 0,
        });
      } catch (error) {
        console.error('Error loading school statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [school]);

  if (!school) {
    return (
      <div className="text-center py-12">
        <School className="w-16 h-16 text-gold/30 mx-auto mb-4" />
        <p className="text-charcoal/60 font-body">Không có thông tin cơ sở</p>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Tổng học viên',
      value: stats.totalStudents,
      icon: Users,
      color: 'bg-primary',
    },
    {
      label: 'Tổng giảng viên',
      value: stats.totalTeachers,
      icon: BookOpen,
      color: 'bg-gold',
    },
    {
      label: 'Lớp đang hoạt động',
      value: stats.totalClasses,
      icon: Calendar,
      color: 'bg-navy',
    },
    {
      label: 'Tổng người dùng',
      value: stats.totalUsers,
      icon: TrendingUp,
      color: 'bg-green-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* School Information */}
      <div className="bg-cream rounded-xl border border-gold/20 p-6">
        <div className="flex items-start gap-6">
          {school.logo_url ? (
            <img src={school.logo_url} alt={school.name} className="w-24 h-24 rounded-xl object-cover border border-gold/20" />
          ) : (
            <div className="w-24 h-24 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
              <Building2 className="w-12 h-12 text-primary/60" />
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-navy font-display mb-2">{school.name}</h2>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-xs text-charcoal/50 font-body">Mã cơ sở</p>
                <p className="text-sm font-semibold text-charcoal font-body mt-0.5">{school.code}</p>
              </div>
              <div>
                <p className="text-xs text-charcoal/50 font-body">Email</p>
                <p className="text-sm font-semibold text-charcoal font-body mt-0.5">{school.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-charcoal/50 font-body">Điện thoại</p>
                <p className="text-sm font-semibold text-charcoal font-body mt-0.5">{school.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-charcoal/50 font-body">Địa điểm</p>
                <p className="text-sm font-semibold text-charcoal font-body mt-0.5">
                  {school.city || 'N/A'}
                  {school.state && `, ${school.state}`}
                </p>
              </div>
              <div>
                <p className="text-xs text-charcoal/50 font-body">Gói dịch vụ</p>
                <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full font-body mt-0.5 ${
                  school.subscription_tier === 'enterprise' ? 'bg-navy/10 text-navy' :
                  school.subscription_tier === 'premium' ? 'bg-primary/10 text-primary' :
                  school.subscription_tier === 'standard' ? 'bg-gold/20 text-gold' :
                  'bg-cream-dark text-charcoal'
                }`}>
                  {school.subscription_tier?.toUpperCase() || 'CƠ BẢN'}
                </span>
              </div>
              <div>
                <p className="text-xs text-charcoal/50 font-body">Trạng thái</p>
                <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full font-body mt-0.5 ${
                  school.is_active ? 'bg-green-100 text-green-700' : 'bg-cream-dark text-charcoal/60'
                }`}>
                  {school.is_active ? 'Hoạt động' : 'Không hoạt động'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl shadow-card border border-gold/20 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-charcoal/60 font-body">{stat.label}</p>
                  {loading ? (
                    <div className="h-8 w-16 bg-gold/20 rounded mt-2 animate-pulse" />
                  ) : (
                    <p className="text-3xl font-bold text-navy font-display mt-1">{stat.value.toLocaleString('vi-VN')}</p>
                  )}
                </div>
                <div className={`${stat.color} p-3 rounded-xl`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Limits & Quotas */}
      <div className="bg-white rounded-xl shadow-card border border-gold/20 p-6">
        <h3 className="text-base font-semibold text-navy font-display mb-4">Giới Hạn & Hạn Ngạch</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-cream rounded-lg p-3">
            <p className="text-xs text-charcoal/60 font-body">Tối đa học viên</p>
            <p className="text-2xl font-bold text-navy font-display mt-1">{school.max_students}</p>
          </div>
          <div className="bg-cream rounded-lg p-3">
            <p className="text-xs text-charcoal/60 font-body">Tối đa giảng viên</p>
            <p className="text-2xl font-bold text-navy font-display mt-1">{school.max_teachers}</p>
          </div>
          <div className="bg-cream rounded-lg p-3">
            <p className="text-xs text-charcoal/60 font-body">Tối đa quản trị</p>
            <p className="text-2xl font-bold text-navy font-display mt-1">{school.max_admins}</p>
          </div>
          <div className="bg-cream rounded-lg p-3">
            <p className="text-xs text-charcoal/60 font-body">Lưu trữ (GB)</p>
            <p className="text-2xl font-bold text-navy font-display mt-1">{school.max_storage_gb}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SchoolCustomizationTab({ school }: { school: SchoolType | null }) {
  if (!school) {
    return (
      <div className="text-center py-12">
        <School className="w-16 h-16 text-gold/30 mx-auto mb-4" />
        <p className="text-charcoal/60 font-body">Không có thông tin cơ sở</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <div className="bg-white rounded-xl border border-gold/20 p-6">
        <h3 className="text-base font-semibold text-navy font-display mb-4">Cài Đặt Chung</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-charcoal/70 font-body mb-1">Tên cơ sở</label>
              <input
                type="text"
                value={school.name}
                disabled
                className="w-full px-3 py-2 border border-gold/30 rounded-lg bg-cream text-charcoal font-body text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-charcoal/70 font-body mb-1">Mã cơ sở</label>
              <input
                type="text"
                value={school.code}
                disabled
                className="w-full px-3 py-2 border border-gold/30 rounded-lg bg-cream text-charcoal font-body text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-charcoal/70 font-body mb-1">Email</label>
            <input
              type="email"
              value={school.email || ''}
              disabled
              className="w-full px-3 py-2 border border-gold/30 rounded-lg bg-cream text-charcoal font-body text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-charcoal/70 font-body mb-1">Điện thoại</label>
            <input
              type="tel"
              value={school.phone || ''}
              disabled
              className="w-full px-3 py-2 border border-gold/30 rounded-lg bg-cream text-charcoal font-body text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-charcoal/70 font-body mb-1">Thành phố</label>
              <input
                type="text"
                value={school.city || ''}
                disabled
                className="w-full px-3 py-2 border border-gold/30 rounded-lg bg-cream text-charcoal font-body text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-charcoal/70 font-body mb-1">Tỉnh/Thành</label>
              <input
                type="text"
                value={school.state || ''}
                disabled
                className="w-full px-3 py-2 border border-gold/30 rounded-lg bg-cream text-charcoal font-body text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-charcoal/70 font-body mb-1">Quốc gia</label>
            <input
              type="text"
              value={school.country}
              disabled
              className="w-full px-3 py-2 border border-gold/30 rounded-lg bg-cream text-charcoal font-body text-sm"
            />
          </div>
        </div>
      </div>

      {/* Academic Settings */}
      <div className="bg-white rounded-xl border border-gold/20 p-6">
        <h3 className="text-base font-semibold text-navy font-display mb-4">Cài Đặt Học Thuật</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-charcoal/70 font-body mb-1">Ngày bắt đầu năm học</label>
            <input
              type="date"
              value={school.settings?.academic_year_start || ''}
              disabled
              className="w-full px-3 py-2 border border-gold/30 rounded-lg bg-cream text-charcoal font-body text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-charcoal/70 font-body mb-1">Hệ thống chấm điểm</label>
            <input
              type="text"
              value={school.settings?.grading_system || 'N/A'}
              disabled
              className="w-full px-3 py-2 border border-gold/30 rounded-lg bg-cream text-charcoal font-body text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-charcoal/70 font-body mb-1">Theo dõi điểm danh</label>
            <input
              type="text"
              value={school.settings?.attendance_tracking || 'N/A'}
              disabled
              className="w-full px-3 py-2 border border-gold/30 rounded-lg bg-cream text-charcoal font-body text-sm"
            />
          </div>
        </div>
      </div>

      {/* Feature Flags */}
      <div className="bg-white rounded-xl border border-gold/20 p-6">
        <h3 className="text-base font-semibold text-navy font-display mb-4">Tính Năng Đã Bật</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={school.features?.attendance?.enabled || false}
              disabled
              className="w-4 h-4 rounded accent-primary"
            />
            <label className="text-sm text-charcoal font-body">Điểm danh</label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={school.features?.grading?.enabled || false}
              disabled
              className="w-4 h-4 rounded accent-primary"
            />
            <label className="text-sm text-charcoal font-body">Chấm điểm</label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={school.features?.messaging?.enabled || false}
              disabled
              className="w-4 h-4 rounded accent-primary"
            />
            <label className="text-sm text-charcoal font-body">Tin nhắn</label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={school.features?.parent_portal?.enabled || false}
              disabled
              className="w-4 h-4 rounded accent-primary"
            />
            <label className="text-sm text-charcoal font-body">Cổng phụ huynh</label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={school.features?.reports?.enabled || false}
              disabled
              className="w-4 h-4 rounded accent-primary"
            />
            <label className="text-sm text-charcoal font-body">Báo cáo</label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={school.features?.mobile_app?.enabled || false}
              disabled
              className="w-4 h-4 rounded accent-primary"
            />
            <label className="text-sm text-charcoal font-body">Ứng dụng di động</label>
          </div>
        </div>
      </div>

      <div className="bg-cream rounded-xl border border-gold/20 p-4">
        <p className="text-sm text-charcoal/70 font-body">
          <strong className="text-navy">Lưu ý:</strong> Cài đặt cơ sở ở chế độ chỉ đọc đối với Quản trị viên.
          Liên hệ Super Admin hoặc quản trị hệ thống để chỉnh sửa các cài đặt này.
        </p>
      </div>
    </div>
  );
}

function AdminSchoolsPageContent() {
  const { profile } = useUser();
  const { school, isLoading } = useTenant();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Fallback: If TenantContext doesn't have school, try fetching from user profile
  const [fallbackSchool, setFallbackSchool] = useState<SchoolType | null>(null);
  const [loadingFallback, setLoadingFallback] = useState(false);

  useEffect(() => {
    const fetchSchoolFromProfile = async () => {
      if (school || !profile?.school_id) return;

      try {
        setLoadingFallback(true);
        const { data, error } = await supabase
          .from('schools')
          .select('*')
          .eq('id', profile.school_id)
          .maybeSingle();

        if (!error && data) {
          setFallbackSchool(data);
        }
      } catch (error) {
        console.error('Error fetching school:', error);
      } finally {
        setLoadingFallback(false);
      }
    };

    fetchSchoolFromProfile();
  }, [school, profile]);

  const currentSchool = school || fallbackSchool;

  if (isLoading || loadingFallback) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy font-display">Quản Lý Cơ Sở</h1>
          <p className="text-charcoal/60 font-body text-sm mt-1">Xem tổng quan và cài đặt cơ sở đào tạo</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-card border border-gold/20">
        <div className="border-b border-gold/20">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors font-body ${
                activeTab === 'dashboard'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-charcoal/60 hover:text-charcoal hover:border-gold/40'
              }`}
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span>Tổng quan</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('customization')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors font-body ${
                activeTab === 'customization'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-charcoal/60 hover:text-charcoal hover:border-gold/40'
              }`}
            >
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <span>Tùy chỉnh</span>
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'dashboard' && <SchoolDashboardTab school={currentSchool} />}
          {activeTab === 'customization' && <SchoolCustomizationTab school={currentSchool} />}
        </div>
      </div>
    </div>
  );
}

export function AdminSchoolsPage() {
  return (
    <RoleGuard allowedRoles={['admin', 'staff']}>
      <PermissionGuard requiredCapabilities={['admin:view']}>
        <AdminSchoolsPageContent />
      </PermissionGuard>
    </RoleGuard>
  );
}
