import React, { useEffect } from 'react';
import { useNotificationStore } from '../store/notificationStore';
import { formatDistanceToNow } from '../utils/dateUtils';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotificationsPage = () => {
  const { notifications, unreadCount, loading, fetch, markAllRead, markRead, remove } = useNotificationStore();
  const navigate = useNavigate();

  useEffect(() => { fetch(); }, []);

  return (
    <div className="page max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title flex items-center gap-2">
            <Bell className="w-6 h-6 text-brand-400" /> Notifications
          </h1>
          {unreadCount > 0 && <p className="section-subtitle">{unreadCount} unread</p>}
        </div>
        {unreadCount > 0 && (
          <button id="mark-all-read" onClick={markAllRead} className="btn-outline btn-sm flex items-center gap-1">
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      <div className="glass-dark rounded-2xl overflow-hidden divide-y divide-white/5">
        {loading ? (
          <div className="p-6 flex flex-col gap-4">
            {[1,2,3,4].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-20 text-center">
            <div className="text-5xl mb-4">🔔</div>
            <p className="text-slate-400">You're all caught up!</p>
          </div>
        ) : notifications.map((n) => (
          <div key={n._id}
            className={`flex items-start gap-4 p-5 cursor-pointer hover:bg-white/5 transition-colors ${!n.isRead ? 'bg-brand-500/5' : ''}`}
            onClick={() => { markRead(n._id); if (n.link) navigate(n.link); }}
          >
            {!n.isRead && <div className="w-2 h-2 rounded-full bg-brand-500 mt-2 shrink-0" />}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">{n.title}</p>
              <p className="text-sm text-slate-400 mt-0.5">{n.body}</p>
              <p className="text-xs text-slate-600 mt-1">{formatDistanceToNow(n.createdAt)}</p>
            </div>
            <button
              id={`delete-notif-${n._id}`}
              onClick={(e) => { e.stopPropagation(); remove(n._id); }}
              className="text-slate-600 hover:text-red-400 transition-colors shrink-0 mt-1"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsPage;
