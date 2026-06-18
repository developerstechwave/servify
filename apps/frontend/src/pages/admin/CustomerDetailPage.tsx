import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Modal, Table, Input, message, Spin, Tabs } from 'antd';
import { customersService } from '../../services/customers.service';
import { LINKS } from '../../lib/links';

interface Customer {
  id:        string;
  name:      string;
  email:     string;
  phone:     string;
  country:   string;
  region:    string;
  address:   string;
  avatar:    string | null;
  isActive:  boolean;
}

export default function CustomerDetailPage() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [customer, setCustomer]         = useState<Customer | null>(null);
  const [loading, setLoading]           = useState(true);
  const [reinviteModal, setReinvite]    = useState(false);
  const [actionLoading, setAction]      = useState(false);
  const [activeTab, setActiveTab]       = useState('subscriptions');
  const [search, setSearch]             = useState('');

  useEffect(() => {
    if (!id) return;
    customersService.getOne(id)
      .then(setCustomer)
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

  const initials = customer
    ? customer.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '';

  const subscriptionColumns = [
    { title: 'Product',       dataIndex: 'product',       key: 'product',
      sorter: true, render: (t: string) => <span className="font-medium">{t || '—'}</span> },
    { title: 'Service',       dataIndex: 'service',       key: 'service',
      render: (t: string) => <span className="text-text-muted">{t || '—'}</span> },
    { title: 'Description',   dataIndex: 'description',   key: 'description',
      render: (t: string) => <span className="text-text-muted">{t ? t.slice(0, 15) + '...' : '—'}</span> },
    {
      title: 'Status', dataIndex: 'status', key: 'status',
      render: (s: string) => {
        const map: Record<string, { color: string; bg: string }> = {
          current: { color: 'text-green-600', bg: 'bg-green-50' },
          pending: { color: 'text-yellow-600', bg: 'bg-yellow-50' },
          failed:  { color: 'text-red-500',   bg: 'bg-red-50'   },
        };
        const style = map[s] ?? map['pending'];
        return (
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${style.color} ${style.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full bg-current`} />
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : '—'}
          </span>
        );
      },
    },
    { title: 'Date Purchased', dataIndex: 'datePurchased', key: 'datePurchased',
      render: (d: string) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }) : 'N/A' },
    { title: 'Expiry Date',    dataIndex: 'expiryDate',    key: 'expiryDate',
      render: (d: string) => d ? (
        <span className="text-red-500 font-medium text-sm">
          {new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}
        </span>
      ) : 'N/A' },
  ];

  const issueColumns = [
    { title: 'Topic',       dataIndex: 'topic',       key: 'topic',
      sorter: true, render: (t: string) => <span className="font-medium">{t || '—'}</span> },
    { title: 'Service',     dataIndex: 'service',     key: 'service',
      render: (t: string) => <span className="text-text-muted">{t || '—'}</span> },
    { title: 'Description', dataIndex: 'description', key: 'description',
      render: (t: string) => <span className="text-text-muted">{t ? t.slice(0, 15) + '...' : '—'}</span> },
    {
      title: 'Status', dataIndex: 'status', key: 'status',
      render: (s: string) => {
        const map: Record<string, { color: string; bg: string }> = {
          resolved:    { color: 'text-green-600', bg: 'bg-green-50' },
          pending:     { color: 'text-yellow-600', bg: 'bg-yellow-50' },
          failed:      { color: 'text-red-500',   bg: 'bg-red-50'   },
          in_progress: { color: 'text-blue-600',  bg: 'bg-blue-50'  },
        };
        const style = map[s] ?? map['pending'];
        return (
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${style.color} ${style.bg}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : '—'}
          </span>
        );
      },
    },
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
            className="font-semibold text-primary hover:underline">
            Customers
          </button>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={2} className="text-text-muted">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
          </svg>
          <span className="text-text-muted">Customer Details</span>
        </div>
        <Button
          type="primary"
          size="large"
          onClick={() => setReinvite(true)}
          className="rounded-xl font-semibold h-11 px-6"
          style={{ background: 'rgba(101,16,127,1)', border: 'none' }}
          icon={
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
        >
          Reinvite Customer
        </Button>
      </div>

      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-border p-8">
        <div className="grid grid-cols-2 gap-6">
          <div className="flex items-center gap-4">
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
              {customer.phone && (
                <p className="text-sm text-text-muted">Phone: {customer.phone}</p>
              )}
            </div>
          </div>
          {(customer.country || customer.region || customer.address) && (
            <div>
              {customer.country  && <p className="text-base font-semibold text-text-main">{customer.country}</p>}
              {customer.region   && <p className="text-sm text-text-muted">Region: {customer.region}</p>}
              {customer.address  && <p className="text-sm text-text-muted">Address: {customer.address}</p>}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`px-6 py-2 rounded-xl text-sm font-semibold transition-colors ${
              activeTab === 'subscriptions'
                ? 'text-white'
                : 'text-text-muted bg-secondary hover:bg-secondary-hover'
            }`}
            style={activeTab === 'subscriptions' ? { background: 'rgba(101,16,127,1)' } : {}}
          >
            Subscriptions
          </button>
          <button
            onClick={() => setActiveTab('issues')}
            className={`px-6 py-2 rounded-xl text-sm font-semibold transition-colors ${
              activeTab === 'issues'
                ? 'text-white'
                : 'text-text-muted bg-secondary hover:bg-secondary-hover'
            }`}
            style={activeTab === 'issues' ? { background: 'rgba(101,16,127,1)' } : {}}
          >
            Issues
          </button>
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
            <h3 className="text-base font-bold text-text-main mb-3">Subscriptions</h3>
            <Table
              columns={subscriptionColumns}
              dataSource={[]}
              rowKey="id"
              pagination={false}
              locale={{ emptyText: 'No subscriptions yet' }}
              style={{ border: 'none' }}
            />
          </>
        )}

        {activeTab === 'issues' && (
          <>
            <h3 className="text-base font-bold text-text-main mb-3">Issue Reports</h3>
            <Table
              columns={issueColumns}
              dataSource={[]}
              rowKey="id"
              pagination={false}
              locale={{ emptyText: 'No issues yet' }}
              style={{ border: 'none' }}
            />
          </>
        )}
      </div>

      {/* Reinvite modal */}
      <Modal
        open={reinviteModal}
        onCancel={() => setReinvite(false)}
        footer={null}
        centered
        width={400}
        title={<span className="font-bold text-text-main">Reinvite Customer</span>}
      >
        <div className="py-4 px-2">
          <div className="rounded-xl p-4 mb-6 text-center"
            style={{ border: '1px dashed rgba(101,16,127,0.3)' }}>
            <p className="text-text-main font-medium">
              Are you sure you want to reinvite customer?
            </p>
          </div>
          <div className="flex gap-3">
            <Button size="large" onClick={() => setReinvite(false)}
              className="flex-1 h-11 rounded-xl font-semibold border-primary text-primary">
              No
            </Button>
            <Button type="primary" size="large" loading={actionLoading}
              onClick={handleReinvite}
              className="flex-1 h-11 rounded-xl font-semibold"
              style={{ background: 'rgba(101,16,127,1)', border: 'none' }}>
              Yes
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
