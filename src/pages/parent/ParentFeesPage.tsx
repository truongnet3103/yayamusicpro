/**
 * Parent Fees Page
 *
 * View payment history and fee information
 * School-scoped and respects multi-tenancy
 */

import { DollarSign, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';
import { RoleGuard } from '../../shared/components/guards/RoleGuard';
import { PermissionGuard } from '../../shared/components/guards/PermissionGuard';
import { useParentStudents } from '../../domains/academic/hooks/useParentStudents';
import { DashboardSkeleton } from '../../shared/components/LoadingSkeleton';
import { formatCurrency } from '../../shared/utils/locale';

function ParentFeesPageContent() {
  const { loading: studentsLoading } = useParentStudents();

  // TODO: Fetch fees from API
  const fees: Array<{
    id: string;
    student_id: string;
    description: string;
    amount: number;
    due_date: string;
    status: 'pending' | 'paid' | 'overdue';
    paid_date?: string;
  }> = [];

  if (studentsLoading) {
    return <DashboardSkeleton />;
  }

  const totalPending = fees.filter(f => f.status === 'pending').reduce((sum, f) => sum + f.amount, 0);
  const totalPaid = fees.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0);

  const statusLabel: Record<string, string> = {
    pending: 'Chưa thanh toán',
    paid: 'Đã thanh toán',
    overdue: 'Quá hạn',
  };

  const feeStatusIcon = (status: string) => {
    if (status === 'paid') return <CheckCircle className="w-5 h-5 text-primary" />;
    if (status === 'overdue') return <XCircle className="w-5 h-5 text-red-600" />;
    return <Clock className="w-5 h-5 text-gold-dark" />;
  };

  const feeStatusIconWrapper = (status: string) => {
    if (status === 'paid') return 'bg-primary/10';
    if (status === 'overdue') return 'bg-red-50';
    return 'bg-gold/10';
  };

  const feeStatusBadge = (status: string) => {
    if (status === 'paid') return 'bg-primary/10 text-primary';
    if (status === 'overdue') return 'bg-red-50 text-red-600';
    return 'bg-gold/10 text-gold-dark';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy">Học Phí</h1>
        <p className="font-body text-charcoal/70">Xem thông tin học phí và lịch sử thanh toán</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gold/20 shadow-card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gold/10 rounded-lg">
              <Clock className="w-6 h-6 text-gold-dark" />
            </div>
            <div>
              <p className="font-body text-sm text-charcoal/70">Chưa thanh toán</p>
              <p className="font-display text-2xl font-bold text-navy">{formatCurrency(totalPending)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gold/20 shadow-card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <CheckCircle className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-body text-sm text-charcoal/70">Đã thanh toán</p>
              <p className="font-display text-2xl font-bold text-navy">{formatCurrency(totalPaid)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gold/20 shadow-card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-body text-sm text-charcoal/70">Tổng cộng</p>
              <p className="font-display text-2xl font-bold text-primary">{formatCurrency(totalPending + totalPaid)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Fees List */}
      <div className="bg-white rounded-xl border border-gold/20 shadow-card p-6">
        <h2 className="font-display text-lg font-semibold text-navy mb-4">Lịch Sử Học Phí</h2>

        {fees.length === 0 ? (
          <div className="text-center py-12 text-charcoal/50">
            <DollarSign className="w-12 h-12 mx-auto mb-3 text-charcoal/20" />
            <p className="font-body">Chưa có thông tin học phí</p>
            <p className="font-body text-sm mt-2">Thông tin học phí sẽ hiển thị ở đây khi có dữ liệu</p>
          </div>
        ) : (
          <div className="space-y-3">
            {fees.map((fee) => (
              <div
                key={fee.id}
                className="flex items-center justify-between p-4 bg-cream-dark rounded-xl border border-gold/10"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${feeStatusIconWrapper(fee.status)}`}>
                    {feeStatusIcon(fee.status)}
                  </div>
                  <div>
                    <h3 className="font-body font-medium text-navy">{fee.description}</h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-charcoal/50 font-body">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Hạn: {new Date(fee.due_date).toLocaleDateString('vi-VN')}
                      </span>
                      {fee.paid_date && (
                        <>
                          <span>•</span>
                          <span>Đã thanh toán: {new Date(fee.paid_date).toLocaleDateString('vi-VN')}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-display text-lg font-bold text-navy">{formatCurrency(fee.amount)}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-body font-medium rounded-full ${feeStatusBadge(fee.status)}`}>
                    {statusLabel[fee.status] || fee.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function ParentFeesPage() {
  return (
    <RoleGuard allowedRoles={['parent']}>
      <PermissionGuard requiredCapabilities={['students:view']}>
        <ParentFeesPageContent />
      </PermissionGuard>
    </RoleGuard>
  );
}
