import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Modal, Table, Input, message, Spin } from 'antd';
import { customersService } from '../../services/customers.service';
import { LINKS } from '../../lib/links';
import EmptyState from '../../components/ui/EmptyState';

interface Customer {
  id:       string;
  name:     string;
  email:    string;
  phone:    string;
  country:  string;
  region:   string;
  address:  string;
  avatar:   string | null;
  isActive: boolean;
}

interface Subscription {
  id:            string;
  product:       string;
  service:       string;
  description:   string;
  status:        string;
  datePurchased: string;
  expiryDate:    string;
}

interface Issue {
  id:          string;
  topic:       string;
  service:     string;
  description: string;
  status:      string;
  dateIssued:  string;
}

const StatusTag = ({ status }: { status: string }) => {
  const map: Record<string, { color: string; bg: string }> = {
    current:     { color: 'text-green-600', bg: 'bg-green-50'  },
    pending:     { color: 'text-yellow-600', bg: 'bg-yellow-50' },
    expired:     { color: 'text-red-500',   bg: 'bg-red-50'    },
    resolved:    { color: 'text-green-600', bg: 'bg-green-50'  },
    in_progress: { color: 'text-blue-600',  bg: 'bg-blue-50'   },
    failed:      { color: 'text-red-500',   bg: 'bg-red-50'    },
    unsubscribed:{ color: 'text-gray-500',  bg: 'bg-gray-100'  },
  };
  const s = map[status] ?? map['pending'];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${s.color} ${s.bg}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
    </span>
  );
};

export default function CustomerDetailPage() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [customer, setCustomer]   = useState<Customer | null>(null);
  const [subs, setSubs]           = useState<Subscription[]>([]);
  const [issues, setIssues]       = useState<Issue[]>([]);
  const [loading, setLoading]     = useState(true);
  const [reinviteModal, setReinvite] = useState(false);
  const [actionLoading, setAction]   = useState(false);
  const [activeTab, setActiveTab]    = useState('subscriptions');
  const [search, setSearch]          = useState('');

  useEffect(() => {
    if (!id) return;
    Promise.all([
      customersService.getOne(id),
      customersService.getSubscriptions(id),
      customersService.getIssues(id),
    ])
      .then(([c, s, i]) => {
        setCustomer(c);
        setSubs(s);
        setIssues(i);
      })
      .catch(() => message.error('Failed to load customer'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleReinvite = async () => {
    if (!id) return;
    try {
      setAction(true);
      await customersService.reinvite(id);
      message.success('Reinvitation sent successfully');
      setReinvite(false);
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Failed to reinvite');
    } finally {
      setAction(false);
    }
  };

  const filteredSubs = subs.filter(
    (s) =>
      !search ||
      s.product.toLowerCase().includes(search.toLowerCase()) ||
      s.service.toLowerCase().includes(search.toLowerCase()),
  );

  const filteredIssues = issues.filter(
    (i) =>
      !search ||
      i.topic.toLowerCase().includes(search.toLowerCase()),
  );

  const initials = customer
    ? customer.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '';

  const subscriptionColumns = [
    {
      title: 'Product', dataIndex: 'product', key: 'product',
      sorter: (a: Subscription, b: Subscription) => a.product.localeCompare(b.product),
      render: (t: string) => <span className="font-medium text-text-main">{t || '—'}</span>,
    },
    { title: 'Service', dataIndex: 'service', key: 'service',
      render: (t: string) => <span className="text-text-muted">{t || '—'}</span> },
    { title: 'Description', dataIndex: 'description', key: 'description',
      render: (t: string) => <span className="text-text-muted">{t ? t.slice(0, 20) + '...' : '—'}</span> },
    { title: 'Status', key: 'status',
      render: (_: any, r: Subscription) => <StatusTag status={r.status} /> },
    { title: 'Date Purchased', dataIndex: 'datePurchased', key: 'datePurchased',
      render: (d: string) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }) : 'N/A' },
    { title: 'Expiry Date', dataIndex: 'expiryDate', key: 'expiryDate',
      render: (d: string) => d ? (
        <span className="text-red-500 font-medium text-sm">
          {new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}
        </span>
      ) : 'N/A' },
  ];

  const issueColumns = [
    {
      title: 'Topic', dataIndex: 'topic', key: 'topic',
      sorter: (a: Issue, b: Issue) => a.topic.localeCompare(b.topic),
      render: (t: string) => <span className="font-medium text-text-main">{t || '—'}</span>,
    },
    { title: 'Service', dataIndex: 'service', key: 'service',
      render: (t: string) => <span className="text-text-muted">{t || '—'}</span> },
    { title: 'Description', dataIndex: 'description', key: 'description',
      render: (t: string) => <span className="text-text-muted">{t ? t.slice(0, 20) + '...' : '—'}</span> },
    { title: 'Status', key: 'status',
      render: (_: any, r: Issue) => <StatusTag status={r.status} /> },
    { title: 'Date Issued', dataIndex: 'dateIssued', key: 'dateIssued',
      render: (d: string) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }) : 'N/A' },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-full"><Spin size="large" /></div>
  );

  if (!customer) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb + action */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <button onClick={() => navigate(LINKS.ADMIN_CUSTOMERS)}
            className="font-semibold text-primary hover:underline">Customers</button>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={2} className="text-text-muted">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
          </svg>
          <span className="text-text-muted">Customer Details</span>
        </div>
        <Button type="primary" size="large" onClick={() => setReinvite(true)}
          className="rounded-xl font-semibold h-11 px-6"
          style={{ background: 'rgba(101,16,127,1)', border: 'none' }}>
          Reinvite Customer
        </Button>
      </div>

      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-border p-8">
        <div className="flex items-center gap-5">
          {customer.avatar ? (
            <img src={`http://localhost:3001${customer.avatar}`} alt="avatar"
              className="w-20 h-20 rounded-full object-cover border-2 border-secondary" />
          ) : (
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold border-2"
              style={{ background: 'rgba(240,231,242,1)', color: 'rgba(101,16,127,1)', borderColor: 'rgba(101,16,127,0.2)' }}
            >
              {initials}
            </div>
          )}
          <div>
            <p className="text-lg font-bold text-text-main">{customer.name}</p>
            <p className="text-sm text-text-muted">Email: {customer.email}</p>
            {customer.phone   && <p className="text-sm text-text-muted">Phone: {customer.phone}</p>}
            {customer.country && <p className="text-sm text-text-muted">Country: {customer.country}</p>}
            {customer.region  && <p className="text-sm text-text-muted">Region: {customer.region}</p>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <div className="flex items-center gap-3 mb-4">
          {['subscriptions', 'issues'].map((t) => (
            <button
              key={t}
              onClick={() => { setActiveTab(t); setSearch(''); }}
              className={`px-6 py-2 rounded-xl text-sm font-semibold transition-colors ${
                activeTab === t ? 'text-white' : 'text-text-muted bg-secondary'
              }`}
              style={activeTab === t ? { background: 'rgba(101,16,127,1)' } : {}}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <Input
          prefix={<svg width="16" height="16" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={2} className="text-text-muted">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>}
          placeholder="Search subscription, plan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-xl max-w-xs mb-4"
          size="middle"
          allowClear
        />

        {activeTab === 'subscriptions' && (
          <>
            <h3 className="text-base font-bold text-text-main mb-3">
              Subscriptions ({filteredSubs.length})
            </h3>
            <Table
              columns={subscriptionColumns}
              dataSource={filteredSubs}
              rowKey="id"
              pagination={{ pageSize: 5, showSizeChanger: false }}
              locale={{ emptyText: <EmptyState type={search ? 'no-results' : 'no-data'} /> }}
              style={{ border: 'none' }}
            />
          </>
        )}

        {activeTab === 'issues' && (
          <>
            <h3 className="text-base font-bold text-text-main mb-3">
              Issue Reports ({filteredIssues.length})
            </h3>
            <Table
              columns={issueColumns}
              dataSource={filteredIssues}
              rowKey="id"
              pagination={{ pageSize: 5, showSizeChanger: false }}
              locale={{ emptyText: <EmptyState type={search ? 'no-results' : 'no-data'} /> }}
              style={{ border: 'none' }}
            />
          </>
        )}
      </div>

      {/* Reinvite modal */}
      <Modal open={reinviteModal} onCancel={() => setReinvite(false)}
        footer={null} centered width={400}
        title={<span className="font-bold text-text-main">Reinvite Customer</span>}>
        <div className="py-4 px-2">
          <div className="rounded-xl p-4 mb-6 text-center"
            style={{ border: '1px dashed rgba(101,16,127,0.3)' }}>
            <p className="text-text-main font-medium">
              Are you sure you want to reinvite this customer?
            </p>
          </div>
          <div className="flex gap-3">
            <Button size="large" onClick={() => setReinvite(false)}
              className="flex-1 h-11 rounded-xl font-semibold border-primary text-primary">No</Button>
            <Button type="primary" size="large" loading={actionLoading} onClick={handleReinvite}
              className="flex-1 h-11 rounded-xl font-semibold"
              style={{ background: 'rgba(101,16,127,1)', border: 'none' }}>Yes</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
