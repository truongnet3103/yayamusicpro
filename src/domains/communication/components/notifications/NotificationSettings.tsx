import { useState, useEffect } from 'react';
import { Bell, Mail, Smartphone, MessageSquare } from 'lucide-react';
import type { NotificationPreference } from '../../types/notification';
import {
  getNotificationPreferences,
  updateNotificationPreference,
} from '../../services/notificationService';

export function NotificationSettings() {
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPreferences();
  }, []);

  async function loadPreferences() {
    try {
      setLoading(true);
      setError(null);
      const prefs = await getNotificationPreferences();
      setPreferences(prefs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải cài đặt thông báo');
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle(
    eventType: string,
    channel: 'in_app_enabled' | 'push_enabled' | 'email_enabled' | 'sms_enabled',
    currentValue: boolean
  ) {
    try {
      setError(null);
      setSuccessMessage(null);

      const updatedPrefs = preferences.map(pref =>
        pref.event_type === eventType ? { ...pref, [channel]: !currentValue } : pref
      );
      setPreferences(updatedPrefs);

      const pref = updatedPrefs.find(p => p.event_type === eventType);
      if (pref) {
        await updateNotificationPreference(eventType, {
          in_app_enabled: pref.in_app_enabled,
          push_enabled: pref.push_enabled,
          email_enabled: pref.email_enabled,
          sms_enabled: pref.sms_enabled,
        });
        setSuccessMessage('Đã cập nhật cài đặt thành công');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể cập nhật cài đặt');
      await loadPreferences();
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-xl shadow-card border border-gold/20 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-navy font-display mb-1">
            Cài Đặt Thông Báo
          </h1>
          <p className="text-charcoal/60 font-body text-sm">
            Chọn cách bạn muốn nhận thông báo cho từng loại sự kiện.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 font-body text-sm">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 font-body text-sm">
            {successMessage}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="grid grid-cols-5 gap-4 pb-4 mb-2 border-b border-gold/20">
              <div className="col-span-1 text-sm font-semibold text-navy font-body">Sự kiện</div>
              <div className="text-center text-xs font-semibold text-charcoal/70 font-body flex flex-col items-center gap-1">
                <Bell className="w-4 h-4 text-primary/70" />
                <span>Trong app</span>
              </div>
              <div className="text-center text-xs font-semibold text-charcoal/70 font-body flex flex-col items-center gap-1">
                <Smartphone className="w-4 h-4 text-primary/70" />
                <span>Đẩy</span>
              </div>
              <div className="text-center text-xs font-semibold text-charcoal/70 font-body flex flex-col items-center gap-1">
                <Mail className="w-4 h-4 text-primary/70" />
                <span>Email</span>
              </div>
              <div className="text-center text-xs font-semibold text-charcoal/70 font-body flex flex-col items-center gap-1">
                <MessageSquare className="w-4 h-4 text-primary/70" />
                <span>SMS</span>
              </div>
            </div>

            {preferences.map(pref => (
              <div
                key={pref.event_type}
                className="grid grid-cols-5 gap-4 py-3.5 border-b border-gold/10 hover:bg-cream/50 rounded-lg px-1 transition-colors"
              >
                <div className="col-span-1">
                  <p className="font-medium text-navy font-body text-sm">{pref.event_name}</p>
                  {pref.event_description && (
                    <p className="text-xs text-charcoal/50 font-body mt-0.5">{pref.event_description}</p>
                  )}
                </div>

                <div className="flex items-center justify-center">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pref.in_app_enabled}
                      onChange={() =>
                        handleToggle(pref.event_type, 'in_app_enabled', pref.in_app_enabled)
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gold/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gold/30 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-center">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pref.push_enabled}
                      onChange={() =>
                        handleToggle(pref.event_type, 'push_enabled', pref.push_enabled)
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gold/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gold/30 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-center">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pref.email_enabled}
                      onChange={() =>
                        handleToggle(pref.event_type, 'email_enabled', pref.email_enabled)
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gold/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gold/30 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-center">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pref.sms_enabled}
                      onChange={() =>
                        handleToggle(pref.event_type, 'sms_enabled', pref.sms_enabled)
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gold/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gold/30 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gold/20">
          <div className="bg-cream rounded-lg border border-gold/20 p-4">
            <p className="text-sm text-charcoal/70 font-body">
              <strong className="text-navy">Lưu ý:</strong> Thông báo đẩy yêu cầu quyền trình duyệt và email/SMS cần cấu hình bổ sung. Thông báo trong app luôn khả dụng.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
