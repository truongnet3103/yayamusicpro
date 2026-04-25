import { Shield, Plus, Users, CheckCircle } from 'lucide-react';
import { useUser } from '../../domains/auth/contexts/UserContext';
import { RoleGuard } from '../../shared/components/guards/RoleGuard';
import { PermissionGuard } from '../../shared/components/guards/PermissionGuard';

function AdminRolesPageContent() {
  useUser();

  // TODO: Fetch roles from API
  const roles: { id: string; name: string; description: string; capabilities: string[] }[] = [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy font-display">Phân Quyền Hệ Thống</h1>
          <p className="text-charcoal/60 font-body text-sm mt-1">Quản lý các vai trò và quyền hạn trong trung tâm</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors font-body font-semibold text-sm shadow-sm">
          <Plus className="w-4 h-4" />
          <span>Tạo vai trò</span>
        </button>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl shadow-card border border-gold/20 p-12 text-center">
            <Shield className="w-16 h-16 text-gold/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-navy font-display mb-2">Chưa có vai trò nào</h3>
            <p className="text-charcoal/60 font-body text-sm mb-4">Bắt đầu bằng cách tạo vai trò đầu tiên</p>
            <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors font-body font-semibold text-sm">
              Tạo vai trò
            </button>
          </div>
        ) : (
          roles.map((role: any) => (
            <div key={role.id} className="bg-white rounded-xl shadow-card border border-gold/20 p-6 hover:shadow-elegant transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-navy font-body">{role.name}</h3>
                    <p className="text-xs text-charcoal/50 font-body mt-0.5">{role.description || 'Không có mô tả'}</p>
                  </div>
                </div>
                {role.is_system_role && (
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gold/20 text-gold font-body">
                    Hệ thống
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-charcoal/60 font-body">
                  <Users className="w-4 h-4 text-charcoal/40" />
                  <span>{role.user_count || 0} người dùng</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-charcoal/60 font-body">
                  <CheckCircle className="w-4 h-4 text-charcoal/40" />
                  <span>{role.capability_count || 0} quyền hạn</span>
                </div>

                <div className="pt-3 border-t border-gold/20 flex gap-2">
                  <button className="flex-1 px-3 py-2 text-sm text-charcoal font-body bg-cream hover:bg-cream-dark rounded-lg transition-colors">
                    Chỉnh sửa
                  </button>
                  {!role.is_system_role && (
                    <button className="flex-1 px-3 py-2 text-sm text-red-600 font-body bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                      Xóa
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function AdminRolesPage() {
  return (
    <RoleGuard allowedRoles={['admin', 'staff']}>
      <PermissionGuard requiredCapabilities={['admin:view']}>
        <AdminRolesPageContent />
      </PermissionGuard>
    </RoleGuard>
  );
}
