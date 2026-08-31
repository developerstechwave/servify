import { useEffect, useState, useCallback } from 'react';
import { Table, Input, Button, Dropdown, Modal, Form, message } from 'antd';
import type { MenuProps } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { organisationsService } from '../../services/organisations.service';
import EmptyState from '../../components/ui/EmptyState';

interface Organisation {
  id:             string;
  organisationId: string | null;
  name:           string;
  email:          string;
  isActive:       boolean;
  verified:       boolean;
  createdAt:      string;
  customerCount:  number;
  employeeCount:  number;
}

const StatusTag = ({ org }: { org: Organisation }) => {
  if (!org.verified) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full text-gray-500 bg-gray-100">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
        Not Verified
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${
      org.isActive ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${org.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
      {org.isActive ? 'Active' : 'Inactive'}
    </span>
  );
};

export default function OrganisationsPage() {
  const [data, setData]         = useState<Organisation[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [addModal, setAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Organisation | null>(null);
  const [saving, setSaving]     = useState(false);
  const [form]                  = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await organisationsService.getAll(search);
      setData(res);
    } catch {
      message.error('Failed to load organisations');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleInvite = async (values: any) => {
    try {
      setSaving(true);
      // NOTE: invite(name, email) — order matches organisationsService.invite's signature.
      await organisationsService.invite(values.name, values.email);
      message.success('Invitation sent');
      setAddModal(false);
      form.resetFields();
      fetchData();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Failed to send invitation');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget?.organisationId) return;
    try {
      setSaving(true);
      await organisationsService.delete(deleteTarget.organisationId);
      message.success('Organisation deleted');
      setDeleteTarget(null);
      fetchData();
    } catch {
      message.error('Failed to delete');
    } finally {
      setSaving(false);
    }
  };

  const getRowMenu = (record: Organisation): MenuProps => ({
    items: [
      ...(record.verified && record.organisationId ? [
        {
          key:     record.isActive ? 'deactivate' : 'activate',
          label:   record.isActive ? 'Deactivate' : 'Activate',
          onClick: async () => {
            try {
              if (record.isActive) {
                await organisationsService.deactivate(record.organisationId!);
                message.success('Organisation deactivated');
              } else {
                await organisationsService.activate(record.organisationId!);
                message.success('Organisation activated');
              }
              fetchData();
            } catch {
              message.error('Failed to update status');
            }
          },
        },
      ] : []),
      {
        key:     'delete',
        label:   'Delete',
        danger:  true,
        onClick: () => setDeleteTarget(record),
        disabled: !record.organisationId,
      },
    ],
  });

  const columns = [
    {
      title:     'Organisation',
      dataIndex: 'name',
      key:       'name',
      sorter:    (a: Organisation, b: Organisation) => a.name.localeCompare(b.name),
      render:    (t: string) => <span className="font-medium text-text-main">{t}</span>,
    },
    {
      title:     'Email',
      dataIndex: 'email',
      key:       'email',
      render:    (t: string) => <span className="text-text-muted">{t}</span>,
    },
    {
      title:     'Customers',
      dataIndex: 'customerCount',
      key:       'customerCount',
      render:    (v: number) => <span className="text-text-muted">{v}</span>,
    },
    {
      title:     'Employees',
      dataIndex: 'employeeCount',
      key:       'employeeCount',
      render:    (v: number) => <span className="text-text-muted">{v}</span>,
    },
    {
      title:     'Date Added',
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
      render: (_: any, record: Organisation) => <StatusTag org={record} />,
    },
    {
      title:  '',
      key:    'actions',
      width:  40,
      render: (_: any, record: Organisation) => (
        <Dropdown menu={getRowMenu(record)} trigger={['click']} placement="bottomRight">
          <button className="text-text-muted hover:text-text-main p-1">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <Input
          prefix={<SearchOutlined className="text-text-muted" />}
          placeholder="Search organisations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-xl max-w-sm"
          size="large"
          allowClear
        />
        <Button
          type="primary" size="large" icon={<PlusOutlined />}
          onClick={() => setAddModal(true)}
          className="rounded-xl font-semibold"
          style={{ background: 'rgba(101,16,127,1)', border: 'none' }}
        >
          Add New Organisation
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-text-main mb-4">Organisations</h1>
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <Table
            columns={columns}
            dataSource={data}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 9, showSizeChanger: false, style: { padding: '16px 24px' } }}
            locale={{ emptyText: <EmptyState type={search ? 'no-results' : 'no-data'} /> }}
            style={{ border: 'none' }}
          />
        </div>
      </div>

      {/* Invite modal */}
      <Modal
        open={addModal}
        onCancel={() => { setAddModal(false); form.resetFields(); }}
        footer={null} centered width={440}
        title={<span className="font-bold text-text-main">Add New Organisation</span>}
      >
        <Form form={form} layout="vertical" requiredMark={false} onFinish={handleInvite} className="mt-4">
          <Form.Item
            label={<span className="text-sm font-medium text-text-main">Organisation Name</span>}
            name="name" rules={[{ required: true, message: 'Name is required' }]}>
            <Input size="large" placeholder="Enter organisation name" className="rounded-xl" />
          </Form.Item>
          <Form.Item
            label={<span className="text-sm font-medium text-text-main">Email</span>}
            name="email" rules={[{ required: true }, { type: 'email', message: 'Enter valid email' }]}>
            <Input size="large" placeholder="Enter email address" className="rounded-xl" />
          </Form.Item>
          <div className="flex gap-3 mt-2">
            <Button size="large" onClick={() => { setAddModal(false); form.resetFields(); }}
                    className="flex-1 h-11 rounded-xl">Cancel</Button>
            <Button type="primary" htmlType="submit" size="large" loading={saving}
                    className="flex-1 h-11 rounded-xl font-semibold"
                    style={{ background: 'rgba(101,16,127,1)', border: 'none' }}>
              Send Invitation
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Delete modal */}
      <Modal
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        footer={null} centered width={400}
        title={<span className="font-bold text-text-main">Delete Organisation</span>}
      >
        <div className="py-4">
          <p className="text-center text-text-main mb-6">
            Are you sure you want to delete <strong>{deleteTarget?.name}</strong>?
          </p>
          <div className="flex gap-3">
            <Button size="large" onClick={() => setDeleteTarget(null)}
                    className="flex-1 h-11 rounded-xl">Cancel</Button>
            <Button danger type="primary" size="large" loading={saving} onClick={handleDelete}
                    className="flex-1 h-11 rounded-xl">Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
