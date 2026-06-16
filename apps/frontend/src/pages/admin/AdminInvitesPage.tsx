import { useEffect, useState } from 'react';
import { Table, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { joinRequestsService } from '../../services/join-requests.service';
import { useAuthStore } from '../../store/auth.store';
import { LINKS } from '../../lib/links';

interface JoinRequest {
  id:        string;
  name:      string;
  email:     string;
  phone:     string;
  createdAt: string;
}

export default function AdminInvitesPage() {
  const navigate  = useNavigate();
  const { user }  = useAuthStore();
  const [data, setData]       = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    joinRequestsService.getPendingCustomers()
      .then(setData)
      .catch(() => message.error('Failed to load requests'))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    {
      title:     'Customer Name',
      dataIndex: 'name',
      key:       'name',
      sorter:    (a: JoinRequest, b: JoinRequest) => a.name.localeCompare(b.name),
      render:    (text: string) => <span className="font-medium text-text-main">{text}</span>,
    },
    {
      title:     'Email',
      dataIndex: 'email',
      key:       'email',
      render:    (text: string) => (
        <span className="text-text-muted">
          {text.length > 20 ? text.slice(0, 20) + '...' : text}
        </span>
      ),
    },
    {
      title:  'Company Name',
      key:    'company',
      render: () => (
        <span className="text-text-muted">
          {`${user?.firstName} ${user?.lastName}`}
        </span>
      ),
    },
    {
      title:     'Phone',
      dataIndex: 'phone',
      key:       'phone',
      render:    (text: string) => <span className="text-text-muted">{text || '—'}</span>,
    },
    {
      title:     'Date Submitted',
      dataIndex: 'createdAt',
      key:       'createdAt',
      render:    (date: string) => (
        <span className="text-text-muted">
          {new Date(date).toLocaleDateString('en-GB', {
            day: '2-digit', month: '2-digit', year: '2-digit',
          })}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-text-main">Customer Requests</h1>
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 9, showSizeChanger: false, style: { padding: '16px 24px' } }}
          onRow={(record) => ({
            onClick:   () => navigate(`${LINKS.ADMIN_INVITES}/${record.id}`),
            className: 'cursor-pointer hover:bg-gray-50 transition-colors',
          })}
          style={{ border: 'none' }}
        />
      </div>
    </div>
  );
}
