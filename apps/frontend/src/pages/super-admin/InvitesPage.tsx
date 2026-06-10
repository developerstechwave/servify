import { useEffect, useState } from 'react';
import { Table, Tag, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { joinRequestsService } from '../../services/join-requests.service';
import { LINKS } from '../../lib/links';

interface JoinRequest {
  id:          string;
  name:        string;
  email:       string;
  description: string;
  createdAt:   string;
  status:      string;
  type:        string;
}

export default function InvitesPage() {
  const navigate  = useNavigate();
  const [data, setData]       = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    joinRequestsService.getPending('organisation')
      .then(setData)
      .catch(() => message.error('Failed to load requests'))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    {
      title:     'Company Name',
      dataIndex: 'name',
      key:       'name',
      sorter:    (a: JoinRequest, b: JoinRequest) => a.name.localeCompare(b.name),
      render:    (text: string) => (
        <span className="font-medium text-text-main">{text}</span>
      ),
    },
    {
      title:     'Email',
      dataIndex: 'email',
      key:       'email',
      render:    (text: string) => (
        <span className="text-text-muted">
          {text.length > 18 ? text.slice(0, 18) + '...' : text}
        </span>
      ),
    },
    {
      title:     'Description',
      dataIndex: 'description',
      key:       'description',
      render:    (text: string) => (
        <span className="text-text-muted">
          {text ? (text.length > 20 ? text.slice(0, 20) + '...' : text) : '—'}
        </span>
      ),
    },
    {
      title:     'Date Submitted',
      dataIndex: 'createdAt',
      key:       'createdAt',
      render:    (date: string) => (
        <span className="text-text-muted">
          {new Date(date).toLocaleDateString('en-GB', {
            day:   '2-digit',
            month: '2-digit',
            year:  '2-digit',
          })}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-text-main">Requests</h1>

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize:    9,
            showSizeChanger: false,
            style:       { padding: '16px 24px' },
          }}
          onRow={(record) => ({
            onClick:    () => navigate(`${LINKS.SUPER_ADMIN_INVITES}/${record.id}`),
            className:  'cursor-pointer hover:bg-gray-50 transition-colors',
          })}
          style={{ border: 'none' }}
        />
      </div>
    </div>
  );
}
