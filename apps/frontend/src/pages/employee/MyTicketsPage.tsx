import { useEffect, useState, useCallback } from 'react';
import { Table, Input, Button, Dropdown, message } from 'antd';
import type { MenuProps } from 'antd';
import { useNavigate } from 'react-router-dom';
import { issuesService } from '../../services/issues.service';
import { LINKS } from '../../lib/links';
import api from '../../services/api';

interface Issue {
  id:           string;
  topic:        string;
  description:  string;
  status:       string;
  customerName: string;
  serviceName:  string;
  commentCount: number;
  createdAt:    string;
}

const StatusTag = ({ status }: { status: string }) => {
  const map: Record<string, { color: string; bg: string; label: string }> = {
    pending:     { color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Pending'     },
    in_progress: { color: 'text-blue-600',   bg: 'bg-blue-50',   label: 'In Progress' },
    resolved:    { color: 'text-green-600',  bg: 'bg-green-50',  label: 'Resolved'    },
    failed:      { color: 'text-red-500',    bg: 'bg-red-50',    label: 'Failed'      },
  };
  const s = map[status] ?? map['pending'];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${s.color} ${s.bg}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {s.label}
    </span>
  );
};

export default function MyTicketsPage() {
  const navigate  = useNavigate();
  const [data, setData]       = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState<string | undefined>();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await api.get(`/issues/assigned?${new URLSearchParams({
        ...(filter ? { status: filter } : {}),
        ...(search ? { search } : {}),
      }).toString()}`);
      setData(res);
    } catch {
      message.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  }, [search, filter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filterItems: MenuProps['items'] = [
    { key: 'all',         label: 'All',         onClick: () => setFilter(undefined)     },
    { key: 'pending',     label: 'Pending',     onClick: () => setFilter('pending')     },
    { key: 'in_progress', label: 'In Progress', onClick: () => setFilter('in_progress') },
    { key: 'resolved',    label: 'Resolved',    onClick: () => setFilter('resolved')    },
  ];

  const columns = [
    {
      title:     'Topic',
      dataIndex: 'topic',
      key:       'topic',
      sorter:    (a: Issue, b: Issue) => a.topic.localeCompare(b.topic),
      render:    (t: string) => <span className="font-medium text-text-main">{t}</span>,
    },
    {
      title:     'Created By',
      dataIndex: 'customerName',
      key:       'customerName',
      render:    (t: string) => <span className="text-text-muted">{t || '—'}</span>,
    },
    {
      title:     'Service',
      dataIndex: 'serviceName',
      key:       'serviceName',
      render:    (t: string) => <span className="text-text-muted">{t || '—'}</span>,
    },
    {
      title:     'Description',
      dataIndex: 'description',
      key:       'description',
      render:    (t: string) => (
        <span className="text-text-muted">{t ? t.slice(0, 20) + '...' : '—'}</span>
      ),
    },
    {
      title:     'Date Issued',
      dataIndex: 'createdAt',
      key:       'createdAt',
      render:    (d: string) => (
        <span className="text-text-muted">
          {new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}
        </span>
      ),
    },
    {
      title:  'Status',
      key:    'status',
      render: (_: any, r: Issue) => <StatusTag status={r.status} />,
    },
    {
      title:  'Comments',
      dataIndex: 'commentCount',
      key:       'commentCount',
      render:    (v: number) => (
        <div className="flex items-center gap-1 text-text-muted">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="text-sm">{v}</span>
        </div>
      ),
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
          placeholder="Search by topic, customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-xl max-w-sm"
          size="large"
          allowClear
        />
        <Dropdown menu={{ items: filterItems }} trigger={['click']}>
          <Button size="large" className="rounded-xl"
            style={{ borderColor: 'rgba(101,16,127,1)', color: 'rgba(101,16,127,1)' }}>
            Filter by Status
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={2} className="ml-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </Button>
        </Dropdown>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-text-main mb-4">My Tickets</h1>
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <Table
            columns={columns}
            dataSource={data}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 9, showSizeChanger: false, style: { padding: '16px 24px' } }}
            onRow={(record) => ({
              onClick:   () => navigate(`${LINKS.EMPLOYEE_CRM}/${record.id}`),
              className: 'cursor-pointer hover:bg-gray-50 transition-colors',
            })}
            style={{ border: 'none' }}
          />
        </div>
      </div>
    </div>
  );
}
