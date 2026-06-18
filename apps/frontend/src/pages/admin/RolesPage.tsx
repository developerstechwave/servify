import { useEffect, useState, useCallback } from 'react';
import { Table, Input, Button, Modal, Form, message } from 'antd';
import { SearchOutlined, PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { rolesService } from '../../services/roles.service';

interface Role {
  id:            string;
  name:          string;
  createdBy:     string;
  createdAt:     string;
  noOfEmployees: number;
}

export default function RolesPage() {
  const [data, setData]             = useState<Role[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [addModal, setAddModal]     = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [roleCount, setRoleCount]   = useState(1);
  const [saving, setSaving]         = useState(false);
  const [form]                      = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await rolesService.getAll(search);
      setData(res);
    } catch {
      message.error('Failed to load roles');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAdd = async (values: any) => {
    try {
      setSaving(true);
      const roles = Array.from({ length: roleCount }, (_, i) => values.roles?.[i]).filter(Boolean);
      await rolesService.create(roles);
      message.success('Role(s) created');
      setAddModal(false);
      form.resetFields();
      setRoleCount(1);
      fetchData();
    } catch {
      message.error('Failed to create roles');
    } finally {
      setSaving(false);
    }
  };

  const handleInlineEdit = async (id: string) => {
    if (!editingName.trim()) return;
    try {
      setSaving(true);
      await rolesService.update(id, editingName.trim());
      message.success('Role updated');
      setEditingId(null);
      fetchData();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Failed to update role');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setSaving(true);
      await rolesService.remove(deleteTarget.id);
      message.success('Role deleted successfully');
      setDeleteTarget(null);
      fetchData();
    } catch {
      message.error('Failed to delete role');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      title:  '',
      key:    'checkbox',
      width:  40,
      render: () => <input type="checkbox" className="rounded" />,
    },
    {
      title:  'Role',
      key:    'name',
      render: (_: any, record: Role) => {
        if (editingId === record.id) {
          return (
            <div className="flex items-center gap-2">
              <Input
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                className="rounded-lg max-w-xs"
                size="small"
                onPressEnter={() => handleInlineEdit(record.id)}
                autoFocus
              />
              <button
                onClick={() => handleInlineEdit(record.id)}
                className="w-6 h-6 rounded flex items-center justify-center bg-green-500 text-white"
              >
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button
                onClick={() => setEditingId(null)}
                className="w-6 h-6 rounded flex items-center justify-center bg-red-500 text-white"
              >
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          );
        }
        return <span className="font-medium text-text-main">{record.name}</span>;
      },
    },
    {
      title:     'No. of Employees',
      dataIndex: 'noOfEmployees',
      key:       'noOfEmployees',
      render:    (v: number) => <span className="text-text-muted">{v}</span>,
    },
    {
      title:     'Created By',
      dataIndex: 'createdBy',
      key:       'createdBy',
      render:    (t: string) => <span className="text-text-muted">{t}</span>,
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
      title:  'Edit',
      key:    'edit',
      render: (_: any, record: Role) => (
        <button
          onClick={() => { setEditingId(record.id); setEditingName(record.name); }}
          className="text-primary hover:text-primary-hover transition-colors"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      ),
    },
    {
      title:  'Delete',
      key:    'delete',
      render: (_: any, record: Role) => (
        <button
          onClick={() => setDeleteTarget(record)}
          className="text-red-400 hover:text-red-500 transition-colors"
        >
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <path strokeLinecap="round" d="M8 12h8" />
          </svg>
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4">
        <Input
          prefix={<SearchOutlined className="text-text-muted" />}
          placeholder="Search by role"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-xl max-w-sm"
          size="large"
          allowClear
        />
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={() => { setAddModal(true); setRoleCount(1); form.resetFields(); }}
          className="rounded-xl font-semibold"
          style={{ background: 'rgba(101,16,127,1)', border: 'none' }}
        >
          Add New Role
        </Button>
      </div>

      {/* Table */}
      <div>
        <h1 className="text-2xl font-bold text-text-main mb-4">Current Roles</h1>
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

      {/* Add Role Modal */}
      <Modal
        open={addModal}
        onCancel={() => { setAddModal(false); form.resetFields(); setRoleCount(1); }}
        footer={null}
        centered
        width={420}
        title={<span className="font-bold text-text-main">Add New Role</span>}
      >
        <Form form={form} layout="vertical" requiredMark={false} onFinish={handleAdd} className="mt-4">
          <div className="flex flex-col gap-3">
            {Array.from({ length: roleCount }, (_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Form.Item
                  name={['roles', i]}
                  rules={[{ required: true, message: 'Role name is required' }]}
                  className="flex-1 mb-0"
                >
                  <Input
                    size="large"
                    placeholder="Enter role"
                    className="rounded-xl"
                  />
                </Form.Item>
                {i > 0 && (
                  <button
                    type="button"
                    onClick={() => setRoleCount((c) => c - 1)}
                    className="text-red-400 hover:text-red-500 flex-shrink-0"
                  >
                    <MinusCircleOutlined style={{ fontSize: 20 }} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setRoleCount((c) => c + 1)}
            className="flex items-center gap-2 text-sm font-medium text-primary mt-3 mb-6 hover:text-primary-hover"
          >
            <PlusOutlined />
            Add more
          </button>

          <div className="flex gap-3">
            <Button size="large"
              onClick={() => { setAddModal(false); form.resetFields(); setRoleCount(1); }}
              className="flex-1 h-11 rounded-xl">
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" size="large" loading={saving}
              className="flex-1 h-11 rounded-xl font-semibold"
              style={{ background: 'rgba(101,16,127,1)', border: 'none' }}>
              Add Role
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        footer={null}
        centered
        width={400}
        title={<span className="font-bold text-text-main">Delete Role</span>}
      >
        <div className="py-4 px-2">
          <div className="rounded-xl p-4 mb-6 text-center"
            style={{ border: '1px dashed rgba(220,38,38,0.3)', background: 'rgba(220,38,38,0.03)' }}>
            <p className="text-text-main font-medium">
              Are you sure you want to delete role?
            </p>
          </div>
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
