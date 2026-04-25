import { Settings, Save, School, Bell, Shield, Users } from 'lucide-react';
import { useState } from 'react';
import { useUser } from '../../domains/auth/contexts/UserContext';
import { useTenant } from '../../shared/contexts/TenantContext';
import { RoleGuard } from '../../shared/components/guards/RoleGuard';
import { PermissionGuard } from '../../shared/components/guards/PermissionGuard';
import { APP_LOCALE, VIETNAM_TIMEZONES } from '../../shared/utils/locale';

function AdminSettingsPageContent() {
  useUser();
  const { school } = useTenant();
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'Chung', icon: Settings },
    { id: 'school', label: 'Thông tin cơ sở', icon: School },
    { id: 'notifications', label: 'Thông báo', icon: Bell },
    { id: 'security', label: 'Bảo mật', icon: Shield },
    { id: 'users', label: 'Người dùng', icon: Users },
  ];

  const inputCls = 'w-full px-3 py-2 border border-gold/40 rounded-lg bg-white font-body text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors';
  const inputDisabledCls = 'w-full px-3 py-2 border border-gold/30 rounded-lg bg-cream font-body text-sm text-charcoal/60 cursor-not-allowed';
  const labelCls = 'block text-xs font-medium text-charcoal/70 font-body mb-1.5';
  const toggleCls = 'w-11 h-6 bg-gold/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[\'\'] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gold/30 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy font-display">Cài Đặt Trung Tâm</h1>
        <p className="text-charcoal/60 font-body text-sm mt-1">Quản lý cài đặt trung tâm và hệ thống</p>
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
                  className={`flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap font-body ${
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
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-semibold text-navy font-display mb-4">Cài Đặt Chung</h2>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Múi giờ</label>
                    <select
                      defaultValue={school?.timezone || APP_LOCALE.timezone}
                      className={inputCls}
                    >
                      {VIETNAM_TIMEZONES.map((tz: { value: string; label: string }) => (
                        <option key={tz.value} value={tz.value}>
                          {tz.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Tiền tệ</label>
                    <select
                      defaultValue={APP_LOCALE.currency}
                      className={inputCls}
                    >
                      <option value="VND">Việt Nam Đồng (₫)</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Quốc gia</label>
                    <input
                      type="text"
                      defaultValue={APP_LOCALE.country}
                      disabled
                      className={inputDisabledCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Định dạng ngày</label>
                    <select
                      defaultValue={APP_LOCALE.dateFormat}
                      className={inputCls}
                    >
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'school' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-semibold text-navy font-display mb-4">Thông Tin Cơ Sở</h2>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Tên cơ sở</label>
                    <input
                      type="text"
                      defaultValue={school?.name || ''}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Email</label>
                    <input
                      type="email"
                      defaultValue={school?.email || ''}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Điện thoại</label>
                    <input
                      type="tel"
                      defaultValue={school?.phone || ''}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Địa chỉ</label>
                    <textarea
                      rows={3}
                      defaultValue={school?.address || ''}
                      className={inputCls}
                      placeholder="Số nhà, tên đường..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Thành phố</label>
                      <input
                        type="text"
                        defaultValue={school?.city || ''}
                        className={inputCls}
                        placeholder="Thành phố"
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Quốc gia</label>
                      <input
                        type="text"
                        defaultValue={APP_LOCALE.country}
                        disabled
                        className={inputDisabledCls}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-semibold text-navy font-display mb-4">Cài Đặt Thông Báo</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-cream rounded-xl border border-gold/20">
                    <div>
                      <h3 className="font-medium text-navy font-body text-sm">Thông báo email</h3>
                      <p className="text-xs text-charcoal/60 font-body mt-0.5">Nhận thông báo qua email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className={toggleCls}></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-cream rounded-xl border border-gold/20">
                    <div>
                      <h3 className="font-medium text-navy font-body text-sm">Thông báo đẩy</h3>
                      <p className="text-xs text-charcoal/60 font-body mt-0.5">Nhận thông báo đẩy trên trình duyệt</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className={toggleCls}></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-semibold text-navy font-display mb-4">Cài Đặt Bảo Mật</h2>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Chính sách mật khẩu</label>
                    <select className={inputCls}>
                      <option>Tiêu chuẩn (8+ ký tự)</option>
                      <option>Mạnh (12+ ký tự, hoa/thường, số)</option>
                      <option>Rất mạnh (16+ ký tự, ký tự đặc biệt)</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-cream rounded-xl border border-gold/20">
                    <div>
                      <h3 className="font-medium text-navy font-body text-sm">Xác thực hai yếu tố</h3>
                      <p className="text-xs text-charcoal/60 font-body mt-0.5">Yêu cầu 2FA cho tất cả người dùng</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className={toggleCls}></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-semibold text-navy font-display mb-4">Cài Đặt Người Dùng</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-cream rounded-xl border border-gold/20">
                    <div>
                      <h3 className="font-medium text-navy font-body text-sm">Cho phép tự đăng ký</h3>
                      <p className="text-xs text-charcoal/60 font-body mt-0.5">Cho phép người dùng tự tạo tài khoản</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className={toggleCls}></div>
                    </label>
                  </div>
                  <div>
                    <label className={labelCls}>Vai trò mặc định</label>
                    <select className={inputCls}>
                      <option>Học viên</option>
                      <option>Phụ huynh</option>
                      <option>Giảng viên</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-6 pt-5 border-t border-gold/20 flex justify-end">
            <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors font-body font-semibold text-sm shadow-sm">
              <Save className="w-4 h-4" />
              <span>Lưu thay đổi</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminSettingsPage() {
  return (
    <RoleGuard allowedRoles={['admin', 'staff']}>
      <PermissionGuard requiredCapabilities={['admin:view']}>
        <AdminSettingsPageContent />
      </PermissionGuard>
    </RoleGuard>
  );
}
