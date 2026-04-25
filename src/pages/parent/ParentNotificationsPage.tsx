/**
 * Parent Notifications Page
 *
 * View all notifications for parent account
 * School-scoped and respects multi-tenancy
 */

import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Award,
  Calendar,
  Megaphone,
  CheckCheck,
  Settings,
  Filter,
  Bell,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../../domains/auth/contexts/UserContext';
import { RoleGuard } from '../../shared/components/guards/RoleGuard';
import { PermissionGuard } from '../../shared/components/guards/PermissionGuard';
import type { Notification } from '../../domains/communication/types/notification';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../../domains/communication/services/notificationService';

const iconMap: Record<string, any> = {
  'check-circle': CheckCircle,
  'alert-circle': AlertCircle,
  'clock': Clock,
  'x-circle': XCircle,
  'award': Award,
  'calendar': Calendar,
  'megaphone': Megaphone,
  'alert-triangle': AlertCircle,
  'bell': Bell,
};

const priorityColors: Record<string, string> = {
  low: 'bg-charcoal/10 text-charcoal',
  normal: 'bg-primary/10 text-primary',
  high: 'bg-gold/10 text-gold-dark',
  urgent: 'bg-red-50 text-red-600',
};

const priorityLabels: Record<string, string> = {
  low: 'Thấp',
  normal: 'Thường',
  high: 'Cao',
  urgent: 'Khẩn',
};

type FilterType = 'all' | 'unread' | 'read';

function ParentNotificationsPageContent() {
  useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
  }, [filter]);

  async function loadNotifications() {
    try {
      setLoading(true);
      const status = filter === 'all' ? undefined : filter === 'unread' ? 'pending' : 'read';
      const response = await getNotifications(100, 0, status);
      setNotifications(response.data || []);
      setUnreadCount(response.unread_count || 0);
    } catch (err) {
      console.error('Failed to load notifications:', err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkAsRead(notificationId: string) {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, status: 'read' } as Notification : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  }

  async function handleMarkAllAsRead() {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, status: 'read' } as Notification)));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  }

  function getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Vừa xong';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  }

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return n.status !== 'read';
    if (filter === 'read') return n.status === 'read';
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const filterTabs: { key: FilterType; label: string; count: number }[] = [
    { key: 'all', label: 'Tất cả', count: notifications.length },
    { key: 'unread', label: 'Chưa đọc', count: unreadCount },
    { key: 'read', label: 'Đã đọc', count: notifications.length - unreadCount },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy">Thông Báo</h1>
          <p className="font-body text-charcoal/70">Cập nhật hoạt động học tập của con em</p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-light font-body font-semibold transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Đánh dấu tất cả đã đọc</span>
            </button>
          )}
          <Link
            to="/notifications/settings"
            className="flex items-center gap-2 px-4 py-2 text-sm bg-cream-dark text-charcoal rounded-lg hover:bg-gold/10 font-body transition-colors border border-gold/20"
          >
            <Settings className="w-4 h-4" />
            <span>Cài đặt</span>
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl border border-gold/20 shadow-card p-4">
        <div className="flex items-center gap-4">
          <Filter className="w-4 h-4 text-charcoal/40 flex-shrink-0" />
          <div className="flex gap-2">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 font-body text-sm font-medium rounded-lg transition-colors ${
                  filter === tab.key
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-charcoal/60 hover:bg-cream-dark'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl border border-gold/20 shadow-card overflow-hidden">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-primary/40" />
            </div>
            <h3 className="font-display text-lg font-semibold text-navy mb-2">
              {filter === 'unread' ? 'Không Có Thông Báo Chưa Đọc' :
               filter === 'read' ? 'Không Có Thông Báo Đã Đọc' :
               'Chưa Có Thông Báo'}
            </h3>
            <p className="font-body text-charcoal/60">
              {filter === 'unread'
                ? 'Bạn đã đọc hết tất cả thông báo!'
                : filter === 'read'
                ? 'Chưa có thông báo đã đọc nào'
                : 'Thông báo sẽ hiển thị ở đây khi giảng viên đăng cập nhật về con em'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gold/10">
            {filteredNotifications.map((notification) => {
              const Icon = iconMap[notification.icon || 'bell'] || Bell;
              const isUnread = notification.status !== 'read';

              return (
                <div
                  key={notification.id}
                  className={`p-6 transition-colors ${
                    isUnread ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-cream'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg flex-shrink-0 ${
                      isUnread ? 'bg-primary/10' : 'bg-charcoal/10'
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        isUnread ? 'text-primary' : 'text-charcoal/60'
                      }`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-1">
                        <div className="flex-1">
                          <h3 className={`font-body font-semibold mb-1 ${
                            isUnread ? 'text-navy' : 'text-charcoal/80'
                          }`}>
                            {notification.title}
                          </h3>
                          <p className="font-body text-sm text-charcoal/60 mb-2">
                            {notification.body}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 font-body text-xs text-charcoal/50">
                            <span>{getTimeAgo(notification.created_at)}</span>
                            <span className={`px-2 py-0.5 rounded-full font-medium ${
                              priorityColors[notification.priority] || priorityColors.normal
                            }`}>
                              {priorityLabels[notification.priority] || notification.priority}
                            </span>
                            {notification.event_type && (
                              <span className="capitalize text-charcoal/40">
                                {notification.event_type.replace(/_/g, ' ')}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {isUnread && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="px-3 py-1.5 font-body text-xs font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            >
                              Đánh dấu đã đọc
                            </button>
                          )}
                        </div>
                      </div>

                      {notification.action_url && (
                        <Link
                          to={notification.action_url}
                          className="inline-flex items-center gap-1 font-body text-sm text-primary hover:text-primary-light mt-2 transition-colors"
                        >
                          Xem chi tiết →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export function ParentNotificationsPage() {
  return (
    <RoleGuard allowedRoles={['parent']}>
      <PermissionGuard requiredCapabilities={['notifications:read']}>
        <ParentNotificationsPageContent />
      </PermissionGuard>
    </RoleGuard>
  );
}
