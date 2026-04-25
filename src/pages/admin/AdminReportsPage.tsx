import { BarChart, Download, Calendar, TrendingUp, Users, BookOpen } from 'lucide-react';
import { useState } from 'react';
import { useUser } from '../../domains/auth/contexts/UserContext';
import { RoleGuard } from '../../shared/components/guards/RoleGuard';
import { PermissionGuard } from '../../shared/components/guards/PermissionGuard';

function AdminReportsPageContent() {
  useUser();
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  const reportTypes = [
    {
      id: 'attendance',
      name: 'Báo Cáo Điểm Danh',
      description: 'Thống kê điểm danh theo ngày, tuần và tháng',
      icon: Calendar,
      color: 'bg-primary/10 text-primary',
    },
    {
      id: 'students',
      name: 'Báo Cáo Học Viên',
      description: 'Số liệu tuyển sinh và nhân khẩu học',
      icon: Users,
      color: 'bg-gold/20 text-gold',
    },
    {
      id: 'academic',
      name: 'Kết Quả Học Tập',
      description: 'Điểm số, đánh giá và xu hướng học tập',
      icon: TrendingUp,
      color: 'bg-navy/10 text-navy',
    },
    {
      id: 'classes',
      name: 'Báo Cáo Lớp Học',
      description: 'Số liệu tuyển sinh và hiệu suất lớp học',
      icon: BookOpen,
      color: 'bg-green-100 text-green-700',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy font-display">Báo Cáo &amp; Thống Kê</h1>
          <p className="text-charcoal/60 font-body text-sm mt-1">Tạo và xem các báo cáo hệ thống</p>
        </div>
        {selectedReport && (
          <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors font-body font-semibold text-sm shadow-sm">
            <Download className="w-4 h-4" />
            <span>Xuất báo cáo</span>
          </button>
        )}
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          return (
            <button
              key={report.id}
              onClick={() => setSelectedReport(report.id)}
              className={`bg-white rounded-xl shadow-card border-2 p-6 text-left hover:shadow-elegant transition-all ${
                selectedReport === report.id
                  ? 'border-primary bg-primary/5'
                  : 'border-gold/20 hover:border-gold/40'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl ${report.color} flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-navy font-body mb-1.5">{report.name}</h3>
              <p className="text-sm text-charcoal/60 font-body">{report.description}</p>
            </button>
          );
        })}
      </div>

      {/* Report Content */}
      {selectedReport ? (
        <div className="bg-white rounded-xl shadow-card border border-gold/20 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-navy font-display mb-1">
              {reportTypes.find(r => r.id === selectedReport)?.name}
            </h2>
            <p className="text-charcoal/60 font-body text-sm">
              {reportTypes.find(r => r.id === selectedReport)?.description}
            </p>
          </div>

          {/* Report Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-xs font-medium text-charcoal/70 font-body mb-1.5">Khoảng thời gian</label>
              <select className="w-full px-3 py-2 border border-gold/40 rounded-lg font-body text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white">
                <option>7 ngày qua</option>
                <option>30 ngày qua</option>
                <option>90 ngày qua</option>
                <option>Năm nay</option>
                <option>Tùy chỉnh</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-charcoal/70 font-body mb-1.5">Định dạng</label>
              <select className="w-full px-3 py-2 border border-gold/40 rounded-lg font-body text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white">
                <option>PDF</option>
                <option>Excel</option>
                <option>CSV</option>
              </select>
            </div>
            <div className="flex items-end">
              <button className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors font-body font-semibold text-sm">
                Tạo báo cáo
              </button>
            </div>
          </div>

          {/* Report Preview Placeholder */}
          <div className="border-2 border-dashed border-gold/30 rounded-xl p-12 text-center bg-cream/40">
            <BarChart className="w-16 h-16 text-gold/30 mx-auto mb-4" />
            <h3 className="text-base font-semibold text-navy font-display mb-2">Xem trước báo cáo</h3>
            <p className="text-charcoal/60 font-body text-sm">Chọn bộ lọc và nhấn "Tạo báo cáo" để xem dữ liệu</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-card border border-gold/20 p-12 text-center">
          <BarChart className="w-16 h-16 text-gold/30 mx-auto mb-4" />
          <h3 className="text-base font-semibold text-navy font-display mb-2">Chọn loại báo cáo</h3>
          <p className="text-charcoal/60 font-body text-sm">Chọn một loại báo cáo ở trên để xem và tạo báo cáo</p>
        </div>
      )}
    </div>
  );
}

export function AdminReportsPage() {
  return (
    <RoleGuard allowedRoles={['admin', 'staff']}>
      <PermissionGuard requiredCapabilities={['admin:view']}>
        <AdminReportsPageContent />
      </PermissionGuard>
    </RoleGuard>
  );
}
