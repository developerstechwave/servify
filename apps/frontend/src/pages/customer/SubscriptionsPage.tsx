import { useEffect, useState, useCallback } from 'react';
import {
  Table, Input, Button, Dropdown, Modal,
  Form, Select, message, Spin,
} from 'antd';
import type { MenuProps } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { customerSubscriptionsService } from '../../services/customer-subscriptions.service';
import { subscriptionsService } from '../../services/subscriptions.service';
import { LINKS } from '../../lib/links';
import dayjs from 'dayjs';

interface Subscription {
  id:          string;
  productName: string;
  serviceName: string;
  description: string;
  status:      string;
  billingType: string;
  createdAt:   string;
  expiryDate:  string;
}

const StatusTag = ({ status }: { status: string }) => {
  const map: Record<string, { color: string; bg: string; label: string }> = {
    current:      { color: 'text-green-600',  bg: 'bg-green-50',  label: 'Current'      },
    pending:      { color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Pending'      },
    expired:      { color: 'text-red-500',    bg: 'bg-red-50',    label: 'Expired'      },
    unsubscribed: { color: 'text-gray-500',   bg: 'bg-gray-100',  label: 'Unsubscribed' },
  };
  const s = map[status] ?? map['pending'];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${s.color} ${s.bg}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {s.label}
    </span>
  );
};

export default function CustomerSubscriptionsPage() {
  const navigate = useNavigate();
  const [data, setData]               = useState<Subscription[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [sortOrder, setSortOrder]     = useState<string>('newest');
  const [unsubTarget, setUnsubTarget] = useState<Subscription | null>(null);
  const [addModal, setAddModal]       = useState(false);
  const [saving, setSaving]           = useState(false);
  const [products, setProducts]       = useState<any[]>([]);
  const [services, setServices]       = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let res = await customerSubscriptionsService.getAll(search, statusFilter);

      // Sort
      res = [...res].sort((a: Subscription, b: Subscription) => {
        if (sortOrder === 'oldest')  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        if (sortOrder === 'newest')  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (sortOrder === 'a-z')     return a.productName.localeCompare(b.productName);
        if (sortOrder === 'z-a')     return b.productName.localeCompare(a.productName);
        return 0;
      });

      setData(res);
    } catch {
      message.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, sortOrder]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const loadProducts = async () => {
    const data = await subscriptionsService.getAllProducts();
    setProducts(data);
  };

  const loadServices = async (productId: string) => {
    const all = await subscriptionsService.getServicesByProduct(productId);
    setServices(all);
  };

  const handleUnsubscribe = async () => {
    if (!unsubTarget) return;
    try {
      setSaving(true);
      await customerSubscriptionsService.unsubscribe(unsubTarget.id);
      message.success('Unsubscribed successfully');
      setUnsubTarget(null);
      fetchData();
    } catch {
      message.error('Failed to unsubscribe');
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async (values: any) => {
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
      fetchData();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Failed to add subscription');
    } finally {
      setSaving(false);
    }
  };

  const getRowMenu = (record: Subscription): MenuProps => ({
    items: [
      {
        key:   'view',
        label: 'View Details',
        onClick: () => navigate(`${LINKS.CUSTOMER_SUBSCRIPTIONS}/${record.id}`),
      },
      {
        key:     'unsub',
        label:   'Unsubscribe',
        onClick: () => setUnsubTarget(record),
        disabled: record.status === 'unsubscribed',
      },
    ],
  });

  const sortItems: MenuProps['items'] = [
    { key: 'newest', label: 'Newest', onClick: () => setSortOrder('newest') },
    { key: 'oldest', label: 'Oldest', onClick: () => setSortOrder('oldest') },
    { key: 'a-z',    label: '↑ A-Z',  onClick: () => setSortOrder('a-z')    },
    { key: 'z-a',    label: '↓ Z-A',  onClick: () => setSortOrder('z-a')    },
  ];

  const filterItems: MenuProps['items'] = [
    { key: 'all',         label: 'All',         onClick: () => setStatusFilter(undefined)       },
    { key: 'current',     label: 'Current',     onClick: () => setStatusFilter('current')       },
    { key: 'pending',     label: 'Pending',     onClick: () => setStatusFilter('pending')       },
    { key: 'expired',     label: 'Expired',     onClick: () => setStatusFilter('expired')       },
    { key: 'unsubscribed',label: 'Unsubscribed',onClick: () => setStatusFilter('unsubscribed')  },
  ];

  const columns = [
    { title: '', key: 'cb', width: 40, render: () => <input type="checkbox" /> },
    {
      title:     'Product',
      dataIndex: 'productName',
      key:       'productName',
      sorter:    (a: Subscription, b: Subscription) => a.productName.localeCompare(b.productName),
      render:    (t: string) => <span className="font-medium text-text-main">{t}</span>,
    },
    {
      title:     'Service',
      dataIndex: 'serviceName',
      key:       'serviceName',
      render:    (t: string) => <span className="text-text-muted">{t}</span>,
    },
    {
      title:     'Description',
      dataIndex: 'description',
      key:       'description',
      render:    (t: string) => (
        <span className="text-text-muted">{t ? t.slice(0, 15) + '...' : '—'}</span>
      ),
    },
    {
      title:  'Status',
      key:    'status',
      render: (_: any, r: Subscription) => <StatusTag status={r.status} />,
    },
    {
      title:     'Date Purchased',
      dataIndex: 'createdAt',
      key:       'createdAt',
      render:    (d: string) => (
        <span className="text-text-muted">
          {new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}
        </span>
      ),
    },
    {
      title:     'Expiry Date',
      dataIndex: 'expiryDate',
      key:       'expiryDate',
      render:    (d: string) => d
        ? <span className="text-red-500 font-medium text-sm">
            {new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}
          </span>
        : <span className="text-text-muted">—</span>,
    },
    {
      title:  '',
      key:    'actions',
      width:  40,
      render: (_: any, record: Subscription) => (
        <Dropdown menu={getRowMenu(record)} trigger={['click']} placement="bottomRight">
          <button className="text-text-muted hover:text-text-main p-1">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="5"  r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4">
        <Input
          prefix={<SearchOutlined className="text-text-muted" />}
          placeholder="Search by product, service, ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-xl max-w-sm"
          size="large"
          allowClear
        />
        <div className="flex items-center gap-3">
          <Dropdown menu={{ items: sortItems }} trigger={['click']}>
            <Button size="large" className="rounded-xl border-border">
              Sort
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" strokeWidth={2} className="ml-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </Button>
          </Dropdown>
          <Dropdown menu={{ items: filterItems }} trigger={['click']}>
            <Button size="large" className="rounded-xl"
              style={{ borderColor: 'rgba(101,16,127,1)', color: 'rgba(101,16,127,1)' }}>
              Select Filter
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" strokeWidth={2} className="ml-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </Button>
          </Dropdown>
          <Button
            type="primary" size="large" icon={<PlusOutlined />}
            onClick={() => { loadProducts(); setAddModal(true); }}
            className="rounded-xl font-semibold"
            style={{ background: 'rgba(101,16,127,1)', border: 'none' }}
          >
            Add New Subscription
          </Button>
        </div>
      </div>

      {/* Table */}
      <div>
        <h1 className="text-2xl font-bold text-text-main mb-4">Subscriptions</h1>
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <Table
            columns={columns}
            dataSource={data}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 9, showSizeChanger: false, style: { padding: '16px 24px' } }}
            scroll={{ x: 'max-content' }}
            style={{ border: 'none' }}
          />
        </div>
      </div>

      {/* Add Subscription Modal */}
      <Modal
        open={addModal}
        onCancel={() => { setAddModal(false); form.resetFields(); setSelectedProduct(''); }}
        footer={null} centered width={560}
        title={<span className="font-bold text-text-main">Add Subscription</span>}
      >
        <Form form={form} layout="vertical" requiredMark={false} onFinish={handleAdd} className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label={<span className="text-sm font-medium text-text-main">Product</span>}
              name="productId"
              rules={[{ required: true, message: 'Select a product' }]}
            >
              <Select size="large" placeholder="Select product" className="rounded-xl"
                onChange={(v) => { setSelectedProduct(v); form.setFieldValue('serviceId', undefined); loadServices(v); }}>
                {products.map((p) => <Select.Option key={p.id} value={p.id}>{p.name}</Select.Option>)}
              </Select>
            </Form.Item>
            <Form.Item label={<span className="text-sm font-medium text-text-main">Date Issued</span>}>
              <Input size="large" value={dayjs().format('DD/MM/YY')} readOnly className="rounded-xl bg-gray-50" />
            </Form.Item>
            <Form.Item
              label={<span className="text-sm font-medium text-text-main">Service</span>}
              name="serviceId"
              rules={[{ required: true, message: 'Select a service' }]}
            >
              <Select size="large" placeholder="Select service" className="rounded-xl" disabled={!selectedProduct}>
                {services.map((s) => <Select.Option key={s.id} value={s.id}>{s.name}</Select.Option>)}
              </Select>
            </Form.Item>
            <Form.Item
              label={<span className="text-sm font-medium text-text-main">Billing Type</span>}
              name="billingType"
            >
              <Select size="large" placeholder="Select payment option" className="rounded-xl">
                <Select.Option value="monthly">Monthly</Select.Option>
                <Select.Option value="quarterly">Quarterly</Select.Option>
                <Select.Option value="annually">Annually</Select.Option>
              </Select>
            </Form.Item>
          </div>
          <Form.Item
            label={<span className="text-sm font-medium text-text-main">Description</span>}
            name="description"
          >
            <Input.TextArea rows={3} className="rounded-xl" placeholder="Add a description" />
          </Form.Item>
          <div className="flex gap-3 mt-2">
            <Button size="large"
              onClick={() => { setAddModal(false); form.resetFields(); setSelectedProduct(''); }}
              className="flex-1 h-11 rounded-xl">Cancel</Button>
            <Button type="primary" htmlType="submit" size="large" loading={saving}
              className="flex-1 h-11 rounded-xl font-semibold"
              style={{ background: 'rgba(101,16,127,1)', border: 'none' }}>
              Add Subscription
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Unsubscribe modal */}
      <Modal
        open={!!unsubTarget}
        onCancel={() => setUnsubTarget(null)}
        footer={null} centered width={400}
        title={<span className="font-bold text-text-main">Unsubscribe Service</span>}
      >
        <div className="py-4">
          <p className="text-center text-text-main mb-6">
            Are you sure you want to unsubscribe service?
          </p>
          <div className="flex gap-3">
            <Button size="large" onClick={() => setUnsubTarget(null)}
              className="flex-1 h-11 rounded-xl font-semibold">No</Button>
            <Button type="primary" size="large" loading={saving} onClick={handleUnsubscribe}
              className="flex-1 h-11 rounded-xl font-semibold"
              style={{ background: 'rgba(101,16,127,1)', border: 'none' }}>Yes</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
