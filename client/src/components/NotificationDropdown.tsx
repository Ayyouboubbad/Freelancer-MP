import React, { useRef, useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react';
import { useNotificationStore } from '../store/notificationStore';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from '../utils/dateUtils';

const NotificationDropdown = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { notifications, unreadCount, markAllRead, markRead, remove } = useNotificationStore();

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleClick = (n: typeof notifications[0]) => {
    markRead(n._id);
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        id="notification-bell"
        onClick={() => setOpen(!open)}
        className="btn-icon btn-ghost relative"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-scale-in">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 glass-dark shadow-card-hover rounded-2xl border border-white/10 overflow-hidden z-50 animate-slide-down">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <h4 className="font-semibold text-white text-sm">Notifications</h4>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
                <CheckCheck className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto no-scrollbar">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-sm">No notifications yet</div>
            ) : (
              notifications.slice(0, 10).map((n) => (
                <div
                  key={n._id}
                  onClick={() => handleClick(n)}
                  className={`flex gap-3 px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 ${
                    !n.isRead ? 'bg-brand-500/5' : ''
                  }`}
                >
                  {!n.isRead && (
                    <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{n.title}</p>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">{n.body}</p>
                    <p className="text-xs text-slate-600 mt-1">{formatDistanceToNow(n.createdAt)}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); remove(n._id); }}
                    className="text-slate-600 hover:text-red-400 transition-colors shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-white/5">
              <button
                onClick={() => { navigate('/notifications'); setOpen(false); }}
                className="text-xs text-brand-400 hover:text-brand-300 w-full text-center"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
