import { useEffect, useState, useCallback } from 'react';
import { Table, Input, Button, Dropdown, message } from 'antd';
import type { MenuProps } from 'antd';
import SLABadge from '../../components/ui/SLABadge';
import { useNavigate } from 'react-router-dom';
import { issuesService } from '../../services/issues.service';
import { LINKS } from '../../lib/links';
import { useAuthStore } from '../../store/auth.store';

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

const StatusTag = ({ status }: { status: string }) => {
  const map: Record<string, { color: string; bg: string; label: string }> = {
    pending:     { color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Pending'     },
    in_progress: { color: 'text-blue-600',   bg: 'bg-blue-50',   label: 'In Progress' },
    resolved:    { color: 'text-green-600',  bg: 'bg-green-50',  label: 'Resolved'    },
    failed:      { color: 'text-red-500',    bg: 'bg-red-50',    label: 'Failed'      },
  };
  const s = map[status] ?? map.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${s.color} ${s.bg}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {s.label}
    </span>
  );
};

export default function IssuesPage() {
  const navigate  = useNavigate();
  const { user }  = useAuthStore();
  const [data, setData]       = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState<string | undefined>();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await issuesService.getAll(filter, search);
      setData(res);
    } catch {
      message.error('Failed to load issues');
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filterItems: MenuProps['items'] = [
    { key: 'all',         label: 'All',         onClick: () => setFilter(undefined)       },
    { key: 'pending',     label: 'Pending',     onClick: () => setFilter('pending')       },
    { key: 'in_progress', label: 'In Progress', onClick: () => setFilter('in_progress')   },
    { key: 'resolved',    label: 'Resolved',    onClick: () => setFilter('resolved')      },
    { key: 'failed',      label: 'Failed',      onClick: () => setFilter('failed')        },
  ];

  const columns = [
    {
      title: 'Topic', dataIndex: 'topic', key: 'topic',
      sorter: (a: Issue, b: Issue) => a.topic.localeCompare(b.topic),
      render: (t: string) => <span className="font-medium text-text-main">{t}</span>,
    },
    {
      title: 'Created By', dataIndex: 'customerName', key: 'customerName',
      render: (t: string) => <span className="text-text-muted">{t || '—'}</span>,
    },
    {
      title: 'Assignee', dataIndex: 'assigneeName', key: 'assigneeName',
      render: (t: string | null) => (
        <span className={t ? 'text-text-main' : 'text-text-muted'}>
          {t || 'Unassigned'}
        </span>
      ),
    },
    {
      title: 'Description', dataIndex: 'description', key: 'description',
      render: (t: string) => (
        <span className="text-text-muted">
          {t.length > 20 ? t.slice(0, 20) + '...' : t}
        </span>
      ),
    },
    {
      title: 'Date Issued', dataIndex: 'createdAt', key: 'createdAt',
      render: (d: string) => (
        <span className="text-text-muted">
          {new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}
        </span>
      ),
    },
    {
      title: 'Status', key: 'status',
      render: (_: any, record: Issue) => <StatusTag status={record.status} />,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <Input
          prefix={
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={2} className="text-text-muted">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
          placeholder="Search by subscription, plan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-xl max-w-sm"
          size="large"
          allowClear
        />
        <Dropdown menu={{ items: filterItems }} trigger={['click']}>
          <Button size="large" className="rounded-xl border-primary text-primary font-medium">
            Filter by Status
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={2} className="ml-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </Button>
        </Dropdown>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-text-main mb-4">Issue Reports</h1>
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <Table
            columns={columns}
            dataSource={data}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 9, showSizeChanger: false, style: { padding: '16px 24px' } }}
            onRow={(record) => ({
              onClick:   () => navigate(`${user?.role === 'employee' ? LINKS.EMPLOYEE_CRM : LINKS.ADMIN_CRM}/${record.id}`),
              className: 'cursor-pointer hover:bg-gray-50 transition-colors',
            })}
            style={{ border: 'none' }}
          />
        </div>
      </div>
    </div>
  );
}
