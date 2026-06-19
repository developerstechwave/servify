import { useEffect, useState, useCallback } from 'react';
import {
  Table, Input, Button, Dropdown, Modal,
  Form, Select, message,
} from 'antd';
import type { MenuProps } from 'antd';
import { useNavigate } from 'react-router-dom';
import { issuesService } from '../../services/issues.service';
import { subscriptionsService } from '../../services/subscriptions.service';
import { useAuthStore } from '../../store/auth.store';
import { LINKS } from '../../lib/links';

interface Issue {
  id:          string;
  topic:       string;
  serviceName: string;
  description: string;
  status:      string;
  createdAt:   string;
}

const TOPICS = [
  'General Support',
  'Technical Support',
  'Transaction',
  'Undelivered Product',
  'Other',
];

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

export default function CustomerIssuesPage() {
  const navigate  = useNavigate();
  const { user }  = useAuthStore();
  const [data, setData]             = useState<Issue[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [filter, setFilter]         = useState<string | undefined>();
  const [reportModal, setReportModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Issue | null>(null);
  const [saving, setSaving]         = useState(false);
  const [products, setProducts]     = useState<any[]>([]);
  const [services, setServices]     = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let res = await issuesService.getMyIssues();
      if (search) {
        const q = search.toLowerCase();
        res = res.filter((i: Issue) =>
          i.topic.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q),
        );
      }
      if (filter) res = res.filter((i: Issue) => i.status === filter);
      setData(res);
    } catch {
      message.error('Failed to load issues');
    } finally {
      setLoading(false);
    }
  }, [search, filter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const loadProducts = async () => {
    const data = await subscriptionsService.getAllProducts();
    setProducts(data);
  };

  const loadServices = async (productId: string) => {
    const all = await subscriptionsService.getServices();
    setServices(all.filter((s: any) => s.productId === productId));
  };

  const handleSendReport = async (values: any) => {
    try {
      setSaving(true);
      const service = services.find((s) => s.id === values.serviceId);
      await issuesService.create({
        topic:       values.topic,
        description: values.description,
        serviceId:   values.serviceId,
        serviceName: service?.name,
      });
      message.success('Issue reported successfully');
      setReportModal(false);
      form.resetFields();
      setSelectedProduct('');
      fetchData();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Failed to send report');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    message.info('Delete functionality coming soon');
    setDeleteTarget(null);
  };

  const openReport = () => {
    loadProducts();
    form.setFieldsValue({
      fullName: `${user?.firstName} ${user?.lastName}`,
      email:    user?.email,
      phone:    user?.phone ?? '',
    });
    setReportModal(true);
  };

  const getRowMenu = (record: Issue): MenuProps => ({
    items: [
      { key: 'view',   label: 'View Details',
        onClick: () => navigate(`${LINKS.CUSTOMER_ISSUES}/${record.id}`) },
      { key: 'delete', label: 'Delete', danger: true,
        onClick: () => setDeleteTarget(record) },
    ],
  });

  const filterItems: MenuProps['items'] = [
    { key: 'all',         label: 'All',         onClick: () => setFilter(undefined)     },
    { key: 'pending',     label: 'Pending',     onClick: () => setFilter('pending')     },
    { key: 'in_progress', label: 'In Progress', onClick: () => setFilter('in_progress') },
    { key: 'resolved',    label: 'Resolved',    onClick: () => setFilter('resolved')    },
    { key: 'failed',      label: 'Failed',      onClick: () => setFilter('failed')      },
  ];

  const columns = [
    { title: '', key: 'cb', width: 40, render: () => <input type="checkbox" /> },
    {
      title:     'Topic',
      dataIndex: 'topic',
      key:       'topic',
      sorter:    (a: Issue, b: Issue) => a.topic.localeCompare(b.topic),
      render:    (t: string) => <span className="font-medium text-text-main">{t}</span>,
    },
    {
      title:     'Product',
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
      title:  'Status',
      key:    'status',
      render: (_: any, r: Issue) => <StatusTag status={r.status} />,
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
      title:  '',
      key:    'actions',
      width:  40,
      render: (_: any, record: Issue) => (
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
          prefix={
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={2} className="text-text-muted">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
          placeholder="Search by topic, product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-xl max-w-sm"
          size="large"
          allowClear
        />
        <div className="flex items-center gap-3">
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
            type="primary" size="large"
            onClick={openReport}
            icon={
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            }
            className="rounded-xl font-semibold"
            style={{ background: 'rgba(101,16,127,1)', border: 'none' }}
          >
            Send Report
          </Button>
        </div>
      </div>

      {/* Table */}
      <div>
        <h1 className="text-2xl font-bold text-text-main mb-4">Issue Reports</h1>
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <Table
            columns={columns}
            dataSource={data}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 9, showSizeChanger: false, style: { padding: '16px 24px' } }}
            style={{ border: 'none' }}
            onRow={(record) => ({
              onDoubleClick: () => navigate(`${LINKS.CUSTOMER_ISSUES}/${record.id}`),
            })}
          />
        </div>
      </div>

      {/* Report Issue Modal */}
      <Modal
        open={reportModal}
        onCancel={() => { setReportModal(false); form.resetFields(); setSelectedProduct(''); }}
        footer={null} centered width={600}
        title={<span className="font-bold text-text-main">Report Issue</span>}
      >
        <Form form={form} layout="vertical" requiredMark={false} onFinish={handleSendReport} className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label={<span className="text-sm font-medium text-text-main">Full Name</span>}
              name="fullName"
            >
              <Input size="large" readOnly className="rounded-xl bg-gray-50" />
            </Form.Item>
            <Form.Item
              label={<span className="text-sm font-medium text-text-main">Email</span>}
              name="email"
            >
              <Input size="large" readOnly className="rounded-xl bg-gray-50" />
            </Form.Item>
            <Form.Item
              label={<span className="text-sm font-medium text-text-main">Phone</span>}
              name="phone"
            >
              <Input size="large" readOnly className="rounded-xl bg-gray-50" />
            </Form.Item>
            <Form.Item
              label={<span className="text-sm font-medium text-text-main">Product</span>}
              name="productId"
            >
              <Select size="large" placeholder="Select product" className="rounded-xl"
                onChange={(v) => {
                  setSelectedProduct(v);
                  form.setFieldValue('serviceId', undefined);
                  loadServices(v);
                }}>
                {products.map((p) => <Select.Option key={p.id} value={p.id}>{p.name}</Select.Option>)}
              </Select>
            </Form.Item>
            <Form.Item
              label={<span className="text-sm font-medium text-text-main">Service</span>}
              name="serviceId"
            >
              <Select size="large" placeholder="Select service" className="rounded-xl"
                disabled={!selectedProduct}>
                {services.map((s) => <Select.Option key={s.id} value={s.id}>{s.name}</Select.Option>)}
              </Select>
            </Form.Item>
            <Form.Item
              label={<span className="text-sm font-medium text-text-main">Topic</span>}
              name="topic"
              rules={[{ required: true, message: 'Select a topic' }]}
            >
              <Select size="large" placeholder="Select topic" className="rounded-xl">
                {TOPICS.map((t) => <Select.Option key={t} value={t}>{t}</Select.Option>)}
              </Select>
            </Form.Item>
          </div>
          <Form.Item
            label={<span className="text-sm font-medium text-text-main">Description</span>}
            name="description"
            rules={[{ required: true, message: 'Description is required' }]}
          >
            <Input.TextArea rows={4} className="rounded-xl" placeholder="Describe your issue" />
          </Form.Item>
          <div className="flex gap-3 mt-2">
            <Button size="large"
              onClick={() => { setReportModal(false); form.resetFields(); setSelectedProduct(''); }}
              className="flex-1 h-11 rounded-xl">Cancel</Button>
            <Button type="primary" htmlType="submit" size="large" loading={saving}
              className="flex-1 h-11 rounded-xl font-semibold"
              style={{ background: 'rgba(101,16,127,1)', border: 'none' }}>
              Send Report
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Delete modal */}
      <Modal
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        footer={null} centered width={400}
        title={<span className="font-bold text-text-main">Delete Issue</span>}
      >
        <div className="py-4">
          <p className="text-center text-text-main mb-6">
            Are you sure you want to delete issue?
          </p>
          <div className="flex gap-3">
            <Button size="large" onClick={() => setDeleteTarget(null)}
              className="flex-1 h-11 rounded-xl font-semibold">No</Button>
            <Button danger type="primary" size="large" loading={saving}
              onClick={handleDelete}
              className="flex-1 h-11 rounded-xl font-semibold">Yes</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
