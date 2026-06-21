import { useEffect, useState } from 'react';
import { Table, Button, Dropdown, Modal, Form, Select, Input, message, Spin } from 'antd';
import type { MenuProps } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../store/auth.store';
import { customerSubscriptionsService } from '../../services/customer-subscriptions.service';
import { subscriptionsService } from '../../services/subscriptions.service';
import { paymentsService } from '../../services/payments.service';
import { issuesService } from '../../services/issues.service';
import { useNavigate } from 'react-router-dom';
import { LINKS } from '../../lib/links';
import dayjs from 'dayjs';

type TabType = 'subscriptions' | 'payments' | 'issues';

interface Subscription {
  id: string; productName: string; serviceName: string;
  description: string; status: string; createdAt: string; expiryDate: string;
}

interface Payment {
  id: string; serviceName: string; amount: number;
  status: string; createdAt: string; expiryDate: string;
}

interface Issue {
  id: string; topic: string; serviceName?: string;
  description: string; status: string; createdAt: string;
}

const StatusTag = ({ status }: { status: string }) => {
  const map: Record<string, { color: string; bg: string }> = {
    current:      { color: 'text-green-600',  bg: 'bg-green-50'  },
    pending:      { color: 'text-yellow-600', bg: 'bg-yellow-50' },
    expired:      { color: 'text-red-500',    bg: 'bg-red-50'    },
    unsubscribed: { color: 'text-gray-500',   bg: 'bg-gray-100'  },
    paid:         { color: 'text-green-600',  bg: 'bg-green-50'  },
    failed:       { color: 'text-red-500',    bg: 'bg-red-50'    },
    resolved:     { color: 'text-green-600',  bg: 'bg-green-50'  },
    in_progress:  { color: 'text-blue-600',   bg: 'bg-blue-50'   },
    to_do:        { color: 'text-blue-600',   bg: 'bg-blue-50'   },
  };
  const s = map[status] ?? map['pending'];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${s.color} ${s.bg}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
    </span>
  );
};

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-16 gap-3">
    <svg width="64" height="64" fill="none" viewBox="0 0 24 24"
      stroke="currentColor" strokeWidth={1} className="text-gray-200">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
    </svg>
    <p className="text-sm font-semibold text-text-muted">No data found</p>
    <p className="text-xs text-text-muted">You will see all data here when you add one.</p>
  </div>
);

export default function CustomerDashboard() {
  const { user }  = useAuthStore();
  const navigate  = useNavigate();
  const [tab, setTab]           = useState<TabType>('subscriptions');
  const [subs, setSubs]         = useState<Subscription[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [issues, setIssues]     = useState<Issue[]>([]);
  const [loading, setLoading]   = useState(true);
  const [addModal, setAddModal] = useState(false);
  const [deleteTarget, setDelete] = useState<string | null>(null);
  const [saving, setSaving]     = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [form] = Form.useForm();

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [s, p, i] = await Promise.all([
        customerSubscriptionsService.getAll(),
        paymentsService.getMyPayments(),
        issuesService.getMyIssues(),
      ]);
      setSubs(s);
      setPayments(p);
      setIssues(i);
    } catch {
      message.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const loadProducts = async () => {
    try {
      const data = await subscriptionsService.getAllProducts();
      setProducts(data);
    } catch {}
  };

  const loadServices = async (productId: string) => {
    const all = await subscriptionsService.getServicesByProduct(productId);
    setServices(all);
  };

  const handleProductChange = (productId: string) => {
    setSelectedProduct(productId);
    form.setFieldValue('serviceId', undefined);
    loadServices(productId);
  };

  const handleAddSubscription = async (values: any) => {
    try {
      setSaving(true);
      const product = products.find((p) => p.id === values.productId);
      const service = services.find((s) => s.id === values.serviceId);
      await customerSubscriptionsService.create({
        productId:   values.productId,
        productName: product?.name ?? '',
        serviceId:   values.serviceId,
        serviceName: service?.name ?? '',
        description: values.description,
        billingType: values.billingType,
      });
      message.success('Subscription added');
      setAddModal(false);
      form.resetFields();
      setSelectedProduct('');
      fetchAll();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Failed to add subscription');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setSaving(true);
      await customerSubscriptionsService.delete(deleteTarget);
      message.success('Deleted successfully');
      setDelete(null);
      fetchAll();
    } catch {
      message.error('Failed to delete');
    } finally {
      setSaving(false);
    }
  };

  const getSubMenu = (record: Subscription): MenuProps => ({
    items: [
      { key: 'view',   label: 'View Details', onClick: () => navigate(`${LINKS.CUSTOMER_SUBSCRIPTIONS}/${record.id}`) },
      { key: 'delete', label: 'Delete', danger: true, onClick: () => setDelete(record.id) },
    ],
  });

  const subColumns = [
    { title: '', key: 'cb', width: 40, render: () => <input type="checkbox" /> },
    { title: 'Product', dataIndex: 'productName', key: 'productName',
      sorter: true,
      render: (t: string) => <span className="font-medium text-text-main">{t}</span> },
    { title: 'Service', dataIndex: 'serviceName', key: 'serviceName',
      render: (t: string) => <span className="text-text-muted">{t}</span> },
    { title: 'Description', dataIndex: 'description', key: 'description',
      render: (t: string) => <span className="text-text-muted">{t ? t.slice(0, 15) + '...' : '—'}</span> },
    { title: 'Status', key: 'status',
      render: (_: any, r: Subscription) => <StatusTag status={r.status} /> },
    { title: 'Date Purchased', dataIndex: 'createdAt', key: 'createdAt',
      render: (d: string) => <span className="text-text-muted">{new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}</span> },
    { title: 'Expiry Date', dataIndex: 'expiryDate', key: 'expiryDate',
      render: (d: string) => d
        ? <span className="text-red-500 font-medium text-sm">{new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}</span>
        : <span className="text-text-muted">—</span> },
    { title: '', key: 'actions', width: 40,
      render: (_: any, record: Subscription) => (
        <Dropdown menu={getSubMenu(record)} trigger={['click']} placement="bottomRight">
          <button className="text-text-muted hover:text-text-main p-1">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>
        </Dropdown>
      ),
    },
  ];

  const payColumns = [
    { title: '', key: 'cb', width: 40, render: () => <input type="checkbox" /> },
    { title: 'Price', dataIndex: 'amount', key: 'amount',
      sorter: true,
      render: (v: number) => <span className="font-medium">GHC{Number(v).toFixed(2)}</span> },
    { title: 'Service', dataIndex: 'serviceName', key: 'serviceName',
      render: (t: string) => <span className="text-text-muted">{t}</span> },
    { title: 'Status', key: 'status',
      render: (_: any, r: Payment) => <StatusTag status={r.status} /> },
    { title: 'Date Purchased', dataIndex: 'createdAt', key: 'createdAt',
      render: (d: string) => <span className="text-text-muted">{new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}</span> },
    { title: 'Expiry Date', dataIndex: 'expiryDate', key: 'expiryDate',
      render: (d: string) => d
        ? <span className="text-red-500 font-medium text-sm">{new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}</span>
        : <span className="text-text-muted">—</span> },
  ];

  const issueColumns = [
    { title: '', key: 'cb', width: 40, render: () => <input type="checkbox" /> },
    { title: 'Topic', dataIndex: 'topic', key: 'topic',
      sorter: true,
      render: (t: string) => <span className="font-medium text-text-main">{t}</span> },
    { title: 'Product', dataIndex: 'serviceName', key: 'serviceName',
      render: (t: string) => <span className="text-text-muted">{t || '—'}</span> },
    { title: 'Description', dataIndex: 'description', key: 'description',
      render: (t: string) => <span className="text-text-muted">{t ? t.slice(0, 15) + '...' : '—'}</span> },
    { title: 'Status', key: 'status',
      render: (_: any, r: Issue) => <StatusTag status={r.status} /> },
    { title: 'Date Issued', dataIndex: 'createdAt', key: 'createdAt',
      render: (d: string) => <span className="text-text-muted">{new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}</span> },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-full"><Spin size="large" /></div>
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-text-main">Hello {user?.firstName} 👋</h1>
        <p className="text-text-muted text-sm">Here's an overview of your profile</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        {(['subscriptions', 'payments', 'issues'] as TabType[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-colors ${
              tab === t ? 'text-white' : 'text-text-muted hover:bg-secondary'
            }`}
            style={tab === t ? { background: 'rgba(101,16,127,1)' } : {}}
          >
            {t === 'issues' ? 'Issue Reports' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Content card */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <h2 className="text-lg font-bold text-text-main">
            {tab === 'subscriptions' ? 'Subscriptions' : tab === 'payments' ? 'Payments' : 'Issue Reports'}
          </h2>
          {tab === 'subscriptions' && (
            <Button type="primary" size="middle" icon={<PlusOutlined />}
              onClick={() => { loadProducts(); setAddModal(true); }}
              className="rounded-xl font-semibold"
              style={{ background: 'rgba(101,16,127,1)', border: 'none' }}>
              Add New Subscription
            </Button>
          )}
          {tab === 'payments' && (
            <Button size="middle" className="rounded-xl font-semibold border-primary text-primary"
              style={{ borderColor: 'rgba(101,16,127,1)', color: 'rgba(101,16,127,1)' }}>
              Request Invoice
            </Button>
          )}
          {tab === 'issues' && (
            <Button type="primary" size="middle"
              onClick={() => navigate(LINKS.CUSTOMER_ISSUES)}
              className="rounded-xl font-semibold"
              style={{ background: 'rgba(101,16,127,1)', border: 'none' }}>
              Send Report
            </Button>
          )}
        </div>

        {tab === 'subscriptions' && (
          subs.length === 0 ? <EmptyState /> :
          <Table columns={subColumns} dataSource={subs} rowKey="id"
            pagination={{ pageSize: 7, showSizeChanger: false, style: { padding: '12px 24px' } }}
            style={{ border: 'none' }} />
        )}
        {tab === 'payments' && (
          payments.length === 0 ? <EmptyState /> :
          <Table columns={payColumns} dataSource={payments} rowKey="id"
            pagination={{ pageSize: 7, showSizeChanger: false, style: { padding: '12px 24px' } }}
            style={{ border: 'none' }} />
        )}
        {tab === 'issues' && (
          issues.length === 0 ? <EmptyState /> :
          <Table columns={issueColumns} dataSource={issues} rowKey="id"
            pagination={{ pageSize: 7, showSizeChanger: false, style: { padding: '12px 24px' } }}
            style={{ border: 'none' }} />
        )}
      </div>

      {/* Add Subscription Modal */}
      <Modal
        open={addModal}
        onCancel={() => { setAddModal(false); form.resetFields(); setSelectedProduct(''); }}
        footer={null} centered width={560}
        title={<span className="font-bold text-text-main">Add Subscription</span>}
      >
        <Form form={form} layout="vertical" requiredMark={false} onFinish={handleAddSubscription} className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label={<span className="text-sm font-medium text-text-main">Product</span>}
              name="productId" rules={[{ required: true, message: 'Select a product' }]}>
              <Select size="large" placeholder="Select product" className="rounded-xl" onChange={handleProductChange}>
                {products.map((p) => <Select.Option key={p.id} value={p.id}>{p.name}</Select.Option>)}
              </Select>
            </Form.Item>
            <Form.Item label={<span className="text-sm font-medium text-text-main">Date Issued</span>}>
              <Input size="large" value={dayjs().format('DD/MM/YY')} readOnly className="rounded-xl bg-gray-50" />
            </Form.Item>
            <Form.Item
              label={<span className="text-sm font-medium text-text-main">Service</span>}
              name="serviceId" rules={[{ required: true, message: 'Select a service' }]}>
              <Select size="large" placeholder="Select service" className="rounded-xl" disabled={!selectedProduct}>
                {services.map((s) => <Select.Option key={s.id} value={s.id}>{s.name}</Select.Option>)}
              </Select>
            </Form.Item>
            <Form.Item label={<span className="text-sm font-medium text-text-main">Billing Type</span>} name="billingType">
              <Select size="large" placeholder="Select payment option" className="rounded-xl">
                <Select.Option value="monthly">Monthly</Select.Option>
                <Select.Option value="quarterly">Quarterly</Select.Option>
                <Select.Option value="annually">Annually</Select.Option>
              </Select>
            </Form.Item>
          </div>
          <Form.Item label={<span className="text-sm font-medium text-text-main">Description</span>} name="description">
            <Input.TextArea rows={3} className="rounded-xl" placeholder="Add a description" />
          </Form.Item>
          <div className="flex gap-3 mt-2">
            <Button size="large" onClick={() => { setAddModal(false); form.resetFields(); setSelectedProduct(''); }}
              className="flex-1 h-11 rounded-xl">Cancel</Button>
            <Button type="primary" htmlType="submit" size="large" loading={saving}
              className="flex-1 h-11 rounded-xl font-semibold"
              style={{ background: 'rgba(101,16,127,1)', border: 'none' }}>
              Add Subscription
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Delete modal */}
      <Modal open={!!deleteTarget} onCancel={() => setDelete(null)} footer={null} centered width={380}
        title={<span className="font-bold text-text-main">Delete Subscription</span>}>
        <div className="py-4">
          <p className="text-center text-text-main mb-6">Are you sure you want to delete this subscription?</p>
          <div className="flex gap-3">
            <Button size="large" onClick={() => setDelete(null)} className="flex-1 h-11 rounded-xl">No</Button>
            <Button danger type="primary" size="large" loading={saving} onClick={handleDelete}
              className="flex-1 h-11 rounded-xl">Yes</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
