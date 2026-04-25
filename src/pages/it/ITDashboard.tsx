/**
 * IT Dashboard
 *
 * Role: IT Admin / System Admin (school-scoped or global)
 *
 * TODO: Backend must validate:
 * - User has 'admin:view' capability
 * - No access to academic data editing
 * - Mostly read-only access
 */

import { Server, Shield, Key, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { useUser } from '../../domains/auth/contexts/UserContext';
import { useTenant } from '../../shared/contexts/TenantContext';
import { RoleGuard } from '../../shared/components/guards/RoleGuard';
import { PermissionGuard } from '../../shared/components/guards/PermissionGuard';
import { Link } from 'react-router-dom';

function ITDashboardContent() {
  const { profile } = useUser();
  const { school } = useTenant();

  // TODO: Fetch real data from APIs
  // GET /system/health
  const systemHealth = {
    status: 'operational' as 'operational' | 'degraded' | 'down',
    api_status: 'operational',
    database_status: 'connected',
    app_version: '1.0.0',
    uptime: '99.9%',
  };

  // GET /security/alerts
  const securityAlerts: Array<{
    id: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    timestamp: string;
  }> = [];

  // GET /integrations
  const integrations: Array<{
    id: string;
    name: string;
    status: 'active' | 'inactive' | 'error';
    last_sync: string;
  }> = [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
      case 'active':
      case 'connected':
        return 'text-green-600 bg-green-50';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-50';
      case 'down':
      case 'error':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-charcoal/60 bg-cream';
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case 'operational': return 'Hoạt động';
      case 'active': return 'Kích hoạt';
      case 'connected': return 'Đã kết nối';
      case 'degraded': return 'Giảm hiệu suất';
      case 'down': return 'Ngừng hoạt động';
      case 'error': return 'Lỗi';
      case 'inactive': return 'Không hoạt động';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy font-display">Bảng Điều Khiển IT</h1>
        <p className="text-charcoal/60 font-body text-sm mt-1">
          Xin chào, {profile?.first_name}!{school?.name && ` Đang quản lý ${school.name}`}
        </p>
      </div>

      {/* System Health Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-card border border-gold/20 p-6">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Server className="w-5 h-5 text-primary" />
            </div>
            <span className={`px-2 py-1 rounded-lg text-xs font-medium font-body ${getStatusColor(systemHealth.status)}`}>
              {statusLabel(systemHealth.status)}
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs text-charcoal/60 font-body">Trạng thái hệ thống</p>
            <p className="text-xl font-bold text-navy font-display mt-1">{statusLabel(systemHealth.status)}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-card border border-gold/20 p-6">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-gold/20 rounded-xl">
              <Activity className="w-5 h-5 text-gold" />
            </div>
            <span className={`px-2 py-1 rounded-lg text-xs font-medium font-body ${getStatusColor(systemHealth.api_status)}`}>
              {statusLabel(systemHealth.api_status)}
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs text-charcoal/60 font-body">Trạng thái API</p>
            <p className="text-xl font-bold text-navy font-display mt-1">{statusLabel(systemHealth.api_status)}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-card border border-gold/20 p-6">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-navy/10 rounded-xl">
              <Shield className="w-5 h-5 text-navy" />
            </div>
            <span className={`px-2 py-1 rounded-lg text-xs font-medium font-body ${getStatusColor(systemHealth.database_status)}`}>
              {statusLabel(systemHealth.database_status)}
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs text-charcoal/60 font-body">Cơ sở dữ liệu</p>
            <p className="text-xl font-bold text-navy font-display mt-1">{statusLabel(systemHealth.database_status)}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-card border border-gold/20 p-6">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-green-100 rounded-xl">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs text-charcoal/60 font-body">Thời gian hoạt động</p>
            <p className="text-xl font-bold text-navy font-display mt-1">{systemHealth.uptime}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security Alerts */}
        <div className="bg-white rounded-xl shadow-card border border-gold/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-navy font-display">Cảnh Báo Bảo Mật</h2>
            <Link
              to="/it/security"
              className="text-sm text-primary hover:text-primary-light font-body transition-colors"
            >
              Xem tất cả
            </Link>
          </div>
          <div className="space-y-3">
            {securityAlerts.length > 0 ? (
              securityAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-xl border ${
                    alert.severity === 'critical'
                      ? 'bg-red-50 border-red-200'
                      : alert.severity === 'high'
                      ? 'bg-orange-50 border-orange-200'
                      : 'bg-yellow-50 border-yellow-200'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-navy font-body">{alert.message}</p>
                      <p className="text-xs text-charcoal/50 font-body mt-1">
                        {new Date(alert.timestamp).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                <p className="text-sm text-charcoal/50 font-body">Không có cảnh báo bảo mật</p>
              </div>
            )}
          </div>
        </div>

        {/* Integrations */}
        <div className="bg-white rounded-xl shadow-card border border-gold/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-navy font-display">Tích Hợp</h2>
            <Link
              to="/it/integrations"
              className="text-sm text-primary hover:text-primary-light font-body transition-colors"
            >
              Quản lý
            </Link>
          </div>
          <div className="space-y-3">
            {integrations.length > 0 ? (
              integrations.map((integration) => (
                <div
                  key={integration.id}
                  className="flex items-center justify-between p-3 bg-cream rounded-xl border border-gold/20"
                >
                  <div>
                    <p className="text-sm font-semibold text-navy font-body">{integration.name}</p>
                    <p className="text-xs text-charcoal/50 font-body">
                      Đồng bộ lần cuối: {new Date(integration.last_sync).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium font-body ${getStatusColor(integration.status)}`}>
                    {statusLabel(integration.status)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-charcoal/50 font-body text-center py-4">Chưa có tích hợp nào được cấu hình</p>
            )}
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="bg-white rounded-xl shadow-card border border-gold/20 p-6">
        <h2 className="text-lg font-semibold text-navy font-display mb-4">Thông Tin Hệ Thống</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-cream rounded-xl p-4 border border-gold/20">
            <p className="text-xs text-charcoal/60 font-body">Phiên bản</p>
            <p className="text-lg font-bold text-navy font-display mt-1">{systemHealth.app_version}</p>
          </div>
          <div className="bg-cream rounded-xl p-4 border border-gold/20">
            <p className="text-xs text-charcoal/60 font-body">Thời gian hoạt động</p>
            <p className="text-lg font-bold text-navy font-display mt-1">{systemHealth.uptime}</p>
          </div>
          <div className="bg-cream rounded-xl p-4 border border-gold/20">
            <p className="text-xs text-charcoal/60 font-body">Trạng thái API</p>
            <p className="text-base font-bold text-navy font-display mt-1">{statusLabel(systemHealth.api_status)}</p>
          </div>
          <div className="bg-cream rounded-xl p-4 border border-gold/20">
            <p className="text-xs text-charcoal/60 font-body">Cơ sở dữ liệu</p>
            <p className="text-base font-bold text-navy font-display mt-1">{statusLabel(systemHealth.database_status)}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-card border border-gold/20 p-6">
        <h2 className="text-lg font-semibold text-navy font-display mb-4">Thao Tác Nhanh</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/it/integrations"
            className="p-4 bg-primary/5 hover:bg-primary/10 rounded-xl border border-primary/20 transition-colors text-center"
          >
            <Key className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-sm font-medium text-navy font-body">Tích hợp</p>
          </Link>
          <Link
            to="/it/api-keys"
            className="p-4 bg-gold/10 hover:bg-gold/20 rounded-xl border border-gold/30 transition-colors text-center"
          >
            <Shield className="w-6 h-6 text-gold mx-auto mb-2" />
            <p className="text-sm font-medium text-navy font-body">API Keys</p>
          </Link>
          <Link
            to="/it/logs"
            className="p-4 bg-navy/5 hover:bg-navy/10 rounded-xl border border-navy/20 transition-colors text-center"
          >
            <Activity className="w-6 h-6 text-navy mx-auto mb-2" />
            <p className="text-sm font-medium text-navy font-body">Nhật ký</p>
          </Link>
          <Link
            to="/it/updates"
            className="p-4 bg-green-50 hover:bg-green-100 rounded-xl border border-green-200 transition-colors text-center"
          >
            <Server className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-navy font-body">Cập nhật</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export function ITDashboard() {
  return (
    <RoleGuard allowedRoles={['it_admin']}>
      <PermissionGuard requiredCapabilities={['admin:view']}>
        <ITDashboardContent />
      </PermissionGuard>
    </RoleGuard>
  );
}
