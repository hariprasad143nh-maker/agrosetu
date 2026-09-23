import { useState, useEffect } from 'react';
import { Bell, Check, Info } from 'lucide-react';
import { Popover } from '@base-ui/react/popover';
import { api } from '@/lib/api';
import { supabase } from '@/lib/supabase';

interface Notification {
  id: string;
  message: string;
  title: string;
  is_read: boolean;
  created_at: string;
}

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const res: any = await api.get(`/alerts/${user.id}`);
      if (Array.isArray(res)) {
        setNotifications(res);
        setUnreadCount(res.filter(n => !n.is_read).length);
      }
    } catch (e) {
      console.error("Failed to fetch notifications", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/alerts/${id}`, { is_read: true });
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.error("Failed to mark as read", e);
    }
  };

  return (
    <Popover.Root>
      <Popover.Trigger className="text-slate-500 hover:text-slate-900 relative p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-green-500">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </Popover.Trigger>
      
      <Popover.Portal>
        <Popover.Positioner side="bottom" align="end" sideOffset={8}>
          <Popover.Popup className="z-50 w-80 rounded-md border bg-white p-0 shadow-md outline-none animate-in fade-in zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h4 className="font-semibold text-sm">Notifications</h4>
              <span className="text-xs bg-slate-100 px-2 py-1 rounded-full text-slate-500 font-medium">
                {unreadCount} new
              </span>
            </div>
            
            <div className="max-h-[300px] overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-sm text-slate-500">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500 flex flex-col items-center gap-2">
                  <Info className="h-8 w-8 text-slate-300" />
                  <p>You have no notifications yet.</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {notifications.map((n) => (
                    <div 
                      key={n.id} 
                      className={`flex items-start gap-3 p-4 border-b last:border-0 hover:bg-slate-50 transition-colors ${!n.is_read ? 'bg-blue-50/50' : ''}`}
                    >
                      <div className={`mt-0.5 h-2 w-2 rounded-full flex-shrink-0 ${!n.is_read ? 'bg-blue-500' : 'bg-transparent'}`} />
                      <div className="flex-1 space-y-1">
                        <p className={`text-sm ${!n.is_read ? 'font-medium text-slate-900' : 'text-slate-600'}`}>
                          {n.message}
                        </p>
                        <p className="text-xs text-slate-400">
                          {new Date(n.created_at).toLocaleString()}
                        </p>
                      </div>
                      {!n.is_read && (
                        <button 
                          onClick={() => markAsRead(n.id)}
                          className="text-slate-400 hover:text-green-600 transition-colors p-1"
                          title="Mark as read"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
