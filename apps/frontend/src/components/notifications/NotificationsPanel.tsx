import { useEffect, useState, useRef } from 'react';
import { Switch } from 'antd';
import { notificationsService } from '../../services/notifications.service';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { LINKS } from '../../lib/links';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface Notification {
  id:          string;
  type:        string;
  title:       string;
  message:     string;
  issueId:     string | null;
  issueTopic:  string | null;
  issueStatus: string | null;
  isRead:      boolean;
  actorName:   string | null;
  createdAt:   string;
}

interface Props {
  open:          boolean;
  onClose:       () => void;
  onCountChange: (count: number) => void;
}

const STATUS_COLORS: Record<string, string> = {
  pending:     'text-yellow-500',
  in_progress: 'text-blue-500',
  resolved:    'text-green-500',
  failed:      'text-red-500',
};

const getInitials = (name: string) =>
  name ? name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : '?';

const COLORS = [
  'rgba(101,16,127,1)',
  'rgba(59,130,246,1)',
  'rgba(34,197,94,1)',
  'rgba(234,179,8,1)',
  'rgba(239,68,68,1)',
];

const avatarColor = (name: string) => COLORS[name.charCodeAt(0) % COLORS.length];

export default function NotificationsPanel({ open, onClose, onCountChange }: Props) {
  const { user }   = useAuthStore();
  const navigate   = useNavigate();
  const panelRef   = useRef<HTMLDivElement>(null);

  // Default tab based on role
  const defaultTab = user?.role === 'employee' ? 'direct' : 'issues';
  const [tab, setTab]               = useState<'direct' | 'issues'>(defaultTab as 'direct' | 'issues');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading]       = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const typeParam = tab === 'issues' ? 'issue' : 'direct';
      const data  = await notificationsService.getAll(typeParam);
      const count = await notificationsService.getUnreadCount();
      setNotifications(data);
      onCountChange(count.count);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (open) fetchNotifications();
  }, [open, tab, unreadOnly]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleMarkAllRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      fetchNotifications();
    } catch {}
  };

  const handleClick = async (n: Notification) => {
    if (!n.isRead) {
      await notificationsService.markAsRead(n.id);
      fetchNotifications();
    }
    if (n.issueId) {
      const role = user?.role;
      if (role === 'customer')  navigate(`${LINKS.CUSTOMER_ISSUES}/${n.issueId}`);
      if (role === 'employee')  navigate(`${LINKS.EMPLOYEE_CRM}/${n.issueId}`);
      if (role === 'admin')     navigate(`${LINKS.ADMIN_CRM}/${n.issueId}`);
    }
    onClose();
  };

  const filtered = unreadOnly
    ? notifications.filter((n) => !n.isRead)
    : notifications;

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        ref={panelRef}
        className="fixed right-4 top-16 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-border overflow-hidden"
        style={{ maxHeight: '80vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="font-bold text-text-main">Notifications</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">Only show unread</span>
            <Switch
              size="small"
              checked={unreadOnly}
              onChange={setUnreadOnly}
              style={{ background: unreadOnly ? 'rgba(101,16,127,1)' : undefined }}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {(['direct', 'issues'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 text-sm font-semibold transition-colors ${
                tab === t
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(80vh - 110px)' }}>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3 px-4">
              <svg width="40" height="40" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" strokeWidth={1} className="text-gray-200">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <p className="text-sm font-semibold text-text-muted">No notification here</p>
              <p className="text-xs text-text-muted text-center">
                There is no notification to show right now.
              </p>
            </div>
          ) : (
            <>
              <div className="px-4 py-2 flex items-center justify-between">
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">Latest</p>
                <button onClick={handleMarkAllRead} className="text-xs text-primary hover:underline">
                  Mark all read
                </button>
              </div>

              {filtered.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 border-b border-border/50 transition-colors ${
                    !n.isRead ? 'bg-purple-50/40' : ''
                  }`}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5"
                    style={{ background: n.actorName ? avatarColor(n.actorName) : 'rgba(101,16,127,1)' }}
                  >
                    {n.actorName ? getInitials(n.actorName) : '?'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-text-main leading-relaxed">
                      <span className="font-semibold">{n.actorName}</span>{' '}
                      {n.message.replace(n.actorName ?? '', '').trim()}
                    </p>
                    {n.issueTopic && (
                      <p className="text-xs text-primary mt-0.5 truncate">
                        {n.issueTopic}
                      </p>
                    )}
                    {n.issueStatus && (
                      <span className={`text-xs font-bold uppercase ${STATUS_COLORS[n.issueStatus] ?? 'text-text-muted'}`}>
                        {n.issueStatus.replace('_', ' ')}
                      </span>
                    )}
                    <p className="text-xs text-text-muted mt-1">{dayjs(n.createdAt).fromNow()}</p>
                  </div>

                  {!n.isRead && (
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                  )}
                </div>
              ))}

              <p className="text-xs text-text-muted text-center py-3 px-4">
                That's all your notifications from the last 30 days.
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
}
