/**
 * Teacher Settings Page
 *
 * Teacher-specific settings and preferences
 * School-scoped and respects multi-tenancy
 */

import { Settings, Bell, Shield, User, Save, Globe, Moon, Sun, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useUser } from '../../domains/auth/contexts/UserContext';
import { useTenant } from '../../shared/contexts/TenantContext';
import { RoleGuard } from '../../shared/components/guards/RoleGuard';
import { PermissionGuard } from '../../shared/components/guards/PermissionGuard';
import { supabase } from '../../shared/lib/supabase';

interface SettingsData {
  // General
  language: string;
  timezone: string;
  theme: 'light' | 'dark' | 'system';

  // Notifications
  emailNotifications: boolean;
  pushNotifications: boolean;
  attendanceReminders: boolean;
  gradeNotifications: boolean;
  messageNotifications: boolean;

  // Security
  twoFactorEnabled: boolean;
  sessionTimeout: number;
}

function TeacherSettingsPageContent() {
  const { profile } = useUser();
  const { school } = useTenant();
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SettingsData>({
    language: 'en',
    timezone: 'Asia/Manila',
    theme: 'system',
    emailNotifications: true,
    pushNotifications: true,
    attendanceReminders: true,
    gradeNotifications: true,
    messageNotifications: true,
    twoFactorEnabled: false,
    sessionTimeout: 30,
  });

  const tabs = [
    { id: 'general', label: 'Chung', icon: Settings },
    { id: 'notifications', label: 'Thông báo', icon: Bell },
    { id: 'security', label: 'Bảo mật', icon: Shield },
    { id: 'preferences', label: 'Tùy chọn', icon: User },
  ];

  useEffect(() => {
    // Load user settings from database or localStorage
    loadSettings();
  }, [profile?.id]);

  const loadSettings = async () => {
    if (!profile?.id) return;

    try {
      // Try to load from user_profiles metadata
      const { data, error } = await supabase
        .from('user_profiles')
        .select('metadata')
        .eq('id', profile.id)
        .single();

      if (!error && data?.metadata) {
        const savedSettings = data.metadata as Partial<SettingsData>;
        setSettings((prev) => ({ ...prev, ...savedSettings }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      // Fallback to localStorage
      const saved = localStorage.getItem(`teacher_settings_${profile.id}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setSettings((prev) => ({ ...prev, ...parsed }));
        } catch (e) {
          console.error('Error parsing saved settings:', e);
        }
      }
    }
  };

  const handleSave = async () => {
    if (!profile?.id) return;

    setSaving(true);
    try {
      // Save to user_profiles metadata
      const { error } = await supabase
        .from('user_profiles')
        .update({
          metadata: settings,
        })
        .eq('id', profile.id);

      if (error) throw error;

      // Also save to localStorage as backup
      localStorage.setItem(`teacher_settings_${profile.id}`, JSON.stringify(settings));

      alert('Đã lưu cài đặt thành công!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Không thể lưu cài đặt. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = <K extends keyof SettingsData>(key: K, value: SettingsData[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const inputCls = 'w-full px-3 py-2 border border-gold/40 rounded-lg bg-white font-body text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors';
  const labelCls = 'block text-xs font-medium text-charcoal/70 font-body mb-1.5 flex items-center gap-1.5';
  const toggleCls = 'w-11 h-6 bg-gold/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[\'\'] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gold/30 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary';
  const toggleRowCls = 'flex items-center justify-between py-3.5 border-b border-gold/20 last:border-b-0';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy font-display">Cài Đặt Cá Nhân</h1>
          <p className="text-charcoal/60 font-body text-sm mt-1">Quản lý tùy chọn và cài đặt tài khoản</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors font-body font-semibold text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-gold/20">
        {/* Tabs */}
        <div className="border-b border-gold/20">
          <nav className="flex -mb-px overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors font-body ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-charcoal/60 hover:text-charcoal hover:border-gold/40'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold text-navy font-display mb-4">Cài Đặt Chung</h3>

                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>
                      <Globe className="w-4 h-4" />
                      Ngôn ngữ
                    </label>
                    <select
                      value={settings.language}
                      onChange={(e) => updateSetting('language', e.target.value)}
                      className={inputCls}
                    >
                      <option value="vi">Tiếng Việt</option>
                      <option value="en">English</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelCls}>
                      <Clock className="w-4 h-4" />
                      Múi giờ
                    </label>
                    <select
                      value={settings.timezone}
                      onChange={(e) => updateSetting('timezone', e.target.value)}
                      className={inputCls}
                    >
                      <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh (Việt Nam)</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelCls}>
                      {settings.theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                      Giao diện
                    </label>
                    <div className="flex gap-6">
                      {[
                        { value: 'light', label: 'Sáng' },
                        { value: 'dark', label: 'Tối' },
                        { value: 'system', label: 'Hệ thống' },
                      ].map((opt) => (
                        <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="theme"
                            value={opt.value}
                            checked={settings.theme === opt.value}
                            onChange={(e) => updateSetting('theme', e.target.value as 'light' | 'dark' | 'system')}
                            className="w-4 h-4 accent-primary"
                          />
                          <span className="text-sm text-charcoal font-body">{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold text-navy font-display mb-4">Tùy Chọn Thông Báo</h3>

                <div className="space-y-0">
                  {[
                    {
                      key: 'emailNotifications' as keyof SettingsData,
                      label: 'Thông báo email',
                      desc: 'Nhận thông báo qua email',
                    },
                    {
                      key: 'pushNotifications' as keyof SettingsData,
                      label: 'Thông báo đẩy',
                      desc: 'Nhận thông báo đẩy trên trình duyệt',
                    },
                    {
                      key: 'attendanceReminders' as keyof SettingsData,
                      label: 'Nhắc nhở điểm danh',
                      desc: 'Nhận nhắc nhở khi đến giờ điểm danh',
                    },
                    {
                      key: 'gradeNotifications' as keyof SettingsData,
                      label: 'Thông báo tiến độ',
                      desc: 'Thông báo khi ghi nhận kết quả học tập',
                    },
                    {
                      key: 'messageNotifications' as keyof SettingsData,
                      label: 'Thông báo tin nhắn',
                      desc: 'Thông báo khi có tin nhắn mới',
                    },
                  ].map((item) => (
                    <div key={item.key} className={toggleRowCls}>
                      <div>
                        <p className="text-sm font-medium text-navy font-body">{item.label}</p>
                        <p className="text-xs text-charcoal/50 font-body mt-0.5">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings[item.key] as boolean}
                          onChange={(e) => updateSetting(item.key, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className={toggleCls}></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold text-navy font-display mb-4">Cài Đặt Bảo Mật</h3>

                <div className="space-y-4">
                  <div className={toggleRowCls}>
                    <div>
                      <p className="text-sm font-medium text-navy font-body">Xác thực hai yếu tố</p>
                      <p className="text-xs text-charcoal/50 font-body mt-0.5">Thêm lớp bảo mật cho tài khoản</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.twoFactorEnabled}
                        onChange={(e) => updateSetting('twoFactorEnabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className={toggleCls}></div>
                    </label>
                  </div>

                  <div>
                    <label className={labelCls}>Thời gian chờ phiên (phút)</label>
                    <input
                      type="number"
                      min="5"
                      max="120"
                      value={settings.sessionTimeout}
                      onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value) || 30)}
                      className={inputCls}
                    />
                    <p className="text-xs text-charcoal/40 font-body mt-1">
                      Tự động đăng xuất sau khi không hoạt động (5–120 phút)
                    </p>
                  </div>

                  <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
                    <p className="text-sm text-primary font-body">
                      <strong>Lời khuyên:</strong> Bảo vệ tài khoản bằng mật khẩu mạnh và bật xác thực hai yếu tố.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold text-navy font-display mb-4">Tùy Chọn Giảng Dạy</h3>

                <div className="space-y-4">
                  <div className="p-4 bg-cream rounded-xl border border-gold/20">
                    <p className="text-sm text-charcoal/70 font-body">
                      Tùy chọn giảng dạy được quản lý bởi quản trị viên trung tâm. Vui lòng liên hệ quản trị viên để thay đổi các cài đặt này.
                    </p>
                  </div>

                  {school && (
                    <div className="p-4 bg-white rounded-xl border border-gold/20">
                      <h4 className="text-sm font-semibold text-navy font-body mb-1.5">Cơ sở hiện tại</h4>
                      <p className="text-sm text-charcoal font-body">{school.name}</p>
                      <p className="text-xs text-charcoal/50 font-body mt-0.5">{school.code}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function TeacherSettingsPage() {
  return (
    <RoleGuard allowedRoles={['teacher']}>
      <PermissionGuard requiredCapabilities={[]}>
        <TeacherSettingsPageContent />
      </PermissionGuard>
    </RoleGuard>
  );
}
