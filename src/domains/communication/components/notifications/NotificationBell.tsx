import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { getUnreadCount } from '../../services/notificationService';
import { NotificationDropdown } from './NotificationDropdown';

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadUnreadCount() {
    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      // Silently handle errors - getUnreadCount already returns 0 on failure
      // Only log for debugging
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to load unread count:', err);
      }
      setUnreadCount(0);
    }
  }

  function handleNotificationRead() {
    setUnreadCount(prev => Math.max(0, prev - 1));
  }

  function handleAllRead() {
    setUnreadCount(0);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 rounded-lg text-charcoal/60 hover:text-primary hover:bg-cream transition-colors"
        aria-label="Thông báo"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-primary text-white text-xs font-bold font-body rounded-full w-4 h-4 flex items-center justify-center leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <NotificationDropdown
          onClose={() => setShowDropdown(false)}
          onNotificationRead={handleNotificationRead}
          onAllRead={handleAllRead}
        />
      )}
    </div>
  );
}
