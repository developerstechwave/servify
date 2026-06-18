import { useEffect, useState, useCallback } from 'react';
import {
  Table, Input, Button, Dropdown, Modal,
  Form, message,
} from 'antd';
import type { MenuProps } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { customersService } from '../../services/customers.service';
import { useAuthStore } from '../../store/auth.store';
import { LINKS } from '../../lib/links';

interface Customer {
  id:            string;
  name:          string;
  email:         string;
  phone:         string;
  isActive:      boolean;
  createdAt:     string;
  service:       string | null;
  datePurchased: string | null;
}

const StatusTag = ({ isActive }: { isActive: boolean }) => (
  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${
    isActive
      ? 'text-green-600 bg-green-50'
      : 'text-red-500 bg-red-50'
  }`}>
    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`} />
    {isActive ? 'Verified' : 'Not Verified'}
  </span>
);

export default function CustomersPage() {
  const navigate  = useNavigate();
  const { user }  = useAuthStore();
  const [data, setData]         = useState<Customer[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [filter, setFilter]     = useState<string | undefined>();
  const [addModal, setAddModal] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [form]                  = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await customersService.getAll(search, filter);
      setData(res);
    } catch {
      message.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, [search, filter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleInvite = async (values: any) => {
    try {
      setSaving(true);
      await customersService.invite(values.name, values.email, values.phone);
      message.success('Invitation sent successfully');
      setAddModal(false);
      form.resetFields();
      fetchData();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Failed to send invitation');
    } finally {
      setSaving(false);
    }
  };

  const filterItems: MenuProps['items'] = [
    { key: 'all',        label: 'All',          onClick: () => setFilter(undefined) },
    { key: 'verified',   label: 'Verified',     onClick: () => setFilter('verified') },
    { key: 'unverified', label: 'Not Verified', onClick: () => setFilter('unverified') },
  ];

  const columns = [
    {
      title:     'Customer Name',
      dataIndex: 'name',
      key:       'name',
      sorter:    (a: Customer, b: Customer) => a.name.localeCompare(b.name),
      render:    (text: string, record: Customer) => (
        <button
          onClick={() => navigate(`${LINKS.ADMIN_CUSTOMERS}/${record.id}`)}
          className="font-medium text-text-main hover:text-primary transition-colors text-left"
        >
          {text}
        </button>
      ),
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
      title:     'Service',
      dataIndex: 'service',
      key:       'service',
      render:    (text: string | null) => (
        <span className="text-text-muted">{text || 'N/A'}</span>
      ),
    },
    {
      title:     'Date Purchased',
      dataIndex: 'datePurchased',
      key:       'datePurchased',
      render:    (date: string | null) => (
        <span className="text-text-muted">
          {date
            ? new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })
            : 'N/A'}
        </span>
      ),
    },
    {
      title:  'Status',
      key:    'status',
      render: (_: any, record: Customer) => <StatusTag isActive={record.isActive} />,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4">
        <Input
          prefix={<SearchOutlined className="text-text-muted" />}
          placeholder="Search by customer name, service, ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-xl max-w-sm"
          size="large"
          allowClear
        />
        <div className="flex items-center gap-3">
          <Dropdown menu={{ items: filterItems }} trigger={['click']}>
            <Button size="large" className="rounded-xl border-primary text-primary font-medium">
              Select Filter
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" strokeWidth={2} className="ml-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </Button>
          </Dropdown>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => setAddModal(true)}
            className="rounded-xl font-semibold"
            style={{ background: 'rgba(101,16,127,1)', border: 'none' }}
          >
            Add New Customer
          </Button>
        </div>
      </div>

      {/* Table */}
      <div>
        <h1 className="text-2xl font-bold text-text-main mb-4">Customers</h1>
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <Table
            columns={columns}
            dataSource={data}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 9, showSizeChanger: false, style: { padding: '16px 24px' } }}
            style={{ border: 'none' }}
          />
        </div>
      </div>

      {/* Add Customer Modal */}
      <Modal
        open={addModal}
        onCancel={() => { setAddModal(false); form.resetFields(); }}
        footer={null}
        centered
        width={480}
        title={<span className="font-bold text-text-main">Add New Customer</span>}
      >
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={handleInvite}
          className="mt-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label={<span className="text-sm font-medium text-text-main">Customer Name</span>}
              name="name"
              rules={[{ required: true, message: 'Name is required' }]}
            >
              <Input size="large" placeholder="Enter customer name" className="rounded-xl" />
            </Form.Item>
            <Form.Item
              label={<span className="text-sm font-medium text-text-main">Email</span>}
              name="email"
              rules={[
                { required: true, message: 'Email is required' },
                { type: 'email', message: 'Enter valid email' },
              ]}
            >
              <Input size="large" placeholder="Enter email" className="rounded-xl" />
            </Form.Item>
            <Form.Item
              label={<span className="text-sm font-medium text-text-main">Company Name</span>}
            >
              <Input
                size="large"
                value={`${user?.firstName} ${user?.lastName}`}
                readOnly
                className="rounded-xl bg-secondary"
              />
            </Form.Item>
            <Form.Item
              label={<span className="text-sm font-medium text-text-main">Phone</span>}
              name="phone"
            >
              <Input size="large" placeholder="Optional" className="rounded-xl" />
            </Form.Item>
          </div>
          <div className="flex gap-3 mt-2">
            <Button size="large" onClick={() => { setAddModal(false); form.resetFields(); }}
              className="flex-1 h-11 rounded-xl">Cancel</Button>
            <Button type="primary" htmlType="submit" size="large" loading={saving}
              className="flex-1 h-11 rounded-xl font-semibold"
              style={{ background: 'rgba(101,16,127,1)', border: 'none' }}>
              Add Customer
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
