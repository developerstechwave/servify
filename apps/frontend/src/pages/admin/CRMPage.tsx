import { useEffect, useState, useCallback } from 'react';
import { Input, Dropdown, message, Spin } from 'antd';
import type { MenuProps } from 'antd';
import { useNavigate } from 'react-router-dom';
import { issuesService } from '../../services/issues.service';
import SLABadge from '../../components/ui/SLABadge';
import { LINKS } from '../../lib/links';

interface Issue {
  id:           string;
  topic:        string;
  description:  string;
  status:       string;
  customerName: string;
  serviceName:  string;
  assigneeId:   string | null;
  assigneeName: string | null;
  commentCount:  number;
  slaDeadline:   string | null;
  slaBreached:   boolean;
  createdAt:    string;
}

const STATUS_COLUMNS = [
  { key: 'pending',     label: 'Pending',     color: 'rgba(234,179,8,1)',   dot: 'bg-yellow-400' },
  { key: 'in_progress', label: 'In Progress', color: 'rgba(59,130,246,1)',  dot: 'bg-blue-500'   },
  { key: 'resolved',    label: 'Resolved',    color: 'rgba(34,197,94,1)',   dot: 'bg-green-500'  },
];

const EmptyColumn = ({ label }: { label: string }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-3 text-text-muted">
    <svg width="48" height="48" fill="none" viewBox="0 0 24 24"
      stroke="currentColor" strokeWidth={1} className="opacity-20">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
    <p className="text-sm">{label === 'Pending' ? 'No Pending Issues' : `Drag a card to add it to this list`}</p>
  </div>
);

const IssueCard = ({
  issue,
  onMoveStatus,
  onClick,
}: {
  issue: Issue;
  onMoveStatus: (id: string, status: string) => void;
  onClick: () => void;
}) => {
  const cardMenu: MenuProps = {
    items: [
      {
        key: 'move',
        label: 'Change Status',
        children: STATUS_COLUMNS
          .filter((s) => s.key !== issue.status)
          .map((s) => ({
            key:   s.key,
            label: s.label,
            onClick: () => onMoveStatus(issue.id, s.key),
          })),
      },
    ],
  };

  const initials = issue.assigneeName
    ? issue.assigneeName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : null;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl p-4 shadow-sm border border-border cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-2">
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(101,16,127,0.08)', color: 'rgba(101,16,127,1)' }}
        >
          {issue.serviceName || 'General'}
        </span>
        <div className="flex items-center gap-2">
          {issue.assigneeId ? (
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: 'rgba(101,16,127,1)' }}
              title={issue.assigneeName || ''}
            >
              {initials}
            </div>
          ) : (
            <span className="text-xs text-text-muted">Unassigned</span>
          )}
          <Dropdown menu={cardMenu} trigger={['click']}>
            <button
              className="text-text-muted hover:text-text-main"
              onClick={(e) => e.stopPropagation()}
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="5"  r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="12" cy="19" r="1.5" />
              </svg>
            </button>
          </Dropdown>
        </div>
      </div>

      <p className="text-sm font-semibold text-text-main mb-1">{issue.topic}</p>
      <p className="text-xs text-text-muted line-clamp-2 mb-3">{issue.description}</p>

      <div className="flex items-center justify-between text-xs text-text-muted">
        <div className="flex items-center gap-1">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>Comments</span>
          <span className="font-medium text-text-main">{issue.commentCount}</span>
        </div>
        <span>
          {new Date(issue.createdAt).toLocaleDateString('en-GB', {
            day: '2-digit', month: '2-digit', year: '2-digit',
          })}
        </span>
      </div>
    </div>
  );
};

export default function CRMPage() {
  const navigate = useNavigate();
  const [issues, setIssues]   = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await issuesService.getAll(undefined, search);
      setIssues(res);
    } catch {
      message.error('Failed to load issues');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleMoveStatus = async (id: string, status: string) => {
    try {
      await issuesService.updateStatus(id, status);
      message.success('Status updated');
      fetchData();
    } catch {
      message.error('Failed to update status');
    }
  };

  const getColumnIssues = (status: string) =>
    issues.filter((i) => i.status === status);

  if (loading) return (
    <div className="flex items-center justify-center h-full"><Spin size="large" /></div>
  );

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Search */}
      <Input
        prefix={
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={2} className="text-text-muted">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        }
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="rounded-xl max-w-xs"
        size="large"
        allowClear
      />

      {/* Kanban columns */}
      <div className="grid grid-cols-3 gap-4 flex-1 overflow-hidden">
        {STATUS_COLUMNS.map((col) => {
          const colIssues = getColumnIssues(col.key);
          return (
            <div key={col.key} className="flex flex-col gap-3 overflow-hidden">
              {/* Column header */}
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                <span className="text-sm font-semibold text-text-main">{col.label}</span>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full ml-1"
                  style={{ background: 'rgba(101,16,127,0.08)', color: 'rgba(101,16,127,1)' }}
                >
                  {colIssues.length}
                </span>
              </div>

              {/* Column divider */}
              <div className="h-1 rounded-full" style={{ background: col.color }} />

              {/* Cards */}
              <div className="flex flex-col gap-3 overflow-y-auto flex-1 pb-4">
                {colIssues.length === 0 ? (
                  <EmptyColumn label={col.label} />
                ) : (
                  colIssues.map((issue) => (
                    <IssueCard
                      key={issue.id}
                      issue={issue}
                      onMoveStatus={handleMoveStatus}
                      onClick={() => navigate(`${LINKS.ADMIN_CRM}/${issue.id}`)}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
