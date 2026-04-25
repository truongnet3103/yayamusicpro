import { useState, useEffect, useRef } from 'react';
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
} from 'lucide-react';
import type { Notification } from '../../types/notification';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../../services/notificationService';

interface NotificationDropdownProps {
  onClose: () => void;
  onNotificationRead: () => void;
  onAllRead: () => void;
}

const iconMap: Record<string, any> = {
  'check-circle': CheckCircle,
  'alert-circle': AlertCircle,
  'clock': Clock,
  'x-circle': XCircle,
  'award': Award,
  'calendar': Calendar,
  'megaphone': Megaphone,
  'alert-triangle': AlertCircle,
};

export function NotificationDropdown({
  onClose,
  onNotificationRead,
  onAllRead,
}: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadNotifications();

    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  async function loadNotifications() {
    try {
      setLoading(true);
      const response = await getNotifications(20, 0);
      setNotifications(response.data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkAsRead(notificationId: string) {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, status: 'read' } : n))
      );
      onNotificationRead();
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  }

  async function handleMarkAllAsRead() {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, status: 'read' })));
      onAllRead();
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

  function getPriorityColor(priority: string): string {
    switch (priority) {
      case 'urgent':
        return 'bg-red-50 border-red-200';
      case 'high':
        return 'bg-orange-50 border-orange-200';
      case 'low':
        return 'bg-cream border-gold/30';
      default:
        return 'bg-primary/5 border-primary/20';
    }
  }

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-elegant border border-gold/20 z-50"
    >
      <div className="px-4 py-3 border-b border-gold/20 flex items-center justify-between">
        <h3 className="text-base font-semibold text-navy font-display">Thông báo</h3>
        <button
          onClick={handleMarkAllAsRead}
          className="text-xs text-primary hover:text-primary-light font-body font-medium flex items-center gap-1 transition-colors"
          title="Đánh dấu tất cả đã đọc"
        >
          <CheckCheck className="w-3.5 h-3.5" />
          Đánh dấu tất cả đã đọc
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 text-charcoal/50">
            <Bell className="w-12 h-12 mx-auto mb-3 text-gold/40" />
            <p className="font-body text-sm">Không có thông báo mới</p>
          </div>
        ) : (
          <div className="divide-y divide-gold/10">
            {notifications.map(notification => {
              const Icon = iconMap[notification.icon || 'alert-circle'] || AlertCircle;
              const isUnread = notification.status !== 'read';

              return (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-cream/60 cursor-pointer transition-colors ${
                    isUnread ? 'bg-primary/5' : ''
                  }`}
                  onClick={() => {
                    if (isUnread) handleMarkAsRead(notification.id);
                    if (notification.action_url) {
                      window.location.href = notification.action_url;
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg border ${getPriorityColor(notification.priority)}`}
                    >
                      <Icon className="w-4 h-4 text-charcoal/70" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-navy font-body text-sm">
                          {notification.title}
                        </p>
                        {isUnread && (
                          <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1"></span>
                        )}
                      </div>
                      <p className="text-sm text-charcoal/70 font-body mt-0.5">{notification.body}</p>
                      <p className="text-xs text-charcoal/40 font-body mt-1.5">
                        {getTimeAgo(notification.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="px-4 py-2.5 border-t border-gold/20 bg-cream/40 rounded-b-xl">
        <button
          onClick={() => {
            onClose();
          }}
          className="w-full text-center text-sm text-charcoal/60 hover:text-primary font-body font-medium flex items-center justify-center gap-2 transition-colors py-0.5"
        >
          <Settings className="w-3.5 h-3.5" />
          Cài đặt thông báo
        </button>
      </div>
    </div>
  );
}

function Bell({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
      />
    </svg>
  );
}
