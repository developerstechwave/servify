import { useEffect, useState, useCallback } from 'react';
import {
  Table, Input, Button, Dropdown, Modal,
  Form, Select, message,
} from 'antd';
import type { MenuProps } from 'antd';
import { SearchOutlined, PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { employeesService } from '../../services/employees.service';

const REGIONS   = ['Greater Accra','Ashanti','Western','Central','Eastern','Volta','Northern','Upper East','Upper West'];
const COUNTRIES = ['Ghana','Nigeria','Kenya','South Africa','United Kingdom','Other'];

interface Employee {
  id:        string;
  name:      string;
  email:     string;
  phone:     string;
  country:   string;
  region:    string;
  role:      string;
  isActive:  boolean;
  createdAt: string;
}

const StatusTag = ({ isActive }: { isActive: boolean }) => (
  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${
    isActive ? 'text-green-600 bg-green-50' : 'text-gray-500 bg-gray-100'
  }`}>
    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
    {isActive ? 'Verified' : 'Deactivated'}
  </span>
);

const EmployeeForm = ({ prefix }: { prefix: string | number }) => (
  <div className="grid grid-cols-2 gap-4">
    <Form.Item
      label={<span className="text-sm font-medium text-text-main">Full Name</span>}
      name={[prefix, 'fullName']}
      rules={[{ required: true, message: 'Name is required' }]}
    >
      <Input size="large" placeholder="Enter full name" className="rounded-xl" />
    </Form.Item>
    <Form.Item
      label={<span className="text-sm font-medium text-text-main">Email</span>}
      name={[prefix, 'email']}
      rules={[
        { required: true, message: 'Email is required' },
        { type: 'email', message: 'Enter valid email' },
      ]}
    >
      <Input size="large" placeholder="Enter email" className="rounded-xl" />
    </Form.Item>
    <Form.Item
      label={<span className="text-sm font-medium text-text-main">Phone</span>}
      name={[prefix, 'phone']}
    >
      <Input size="large" placeholder="Enter phone number" className="rounded-xl" />
    </Form.Item>
    <Form.Item
      label={<span className="text-sm font-medium text-text-main">Role</span>}
      name={[prefix, 'role']}
    >
      <Select size="large" placeholder="Select role" className="rounded-xl">
        <Select.Option value="Admin">Admin</Select.Option>
        <Select.Option value="Sales">Sales</Select.Option>
        <Select.Option value="Support">Support</Select.Option>
        <Select.Option value="Technical">Technical</Select.Option>
        <Select.Option value="HR">HR</Select.Option>
      </Select>
    </Form.Item>
    <Form.Item
      label={<span className="text-sm font-medium text-text-main">Region</span>}
      name={[prefix, 'region']}
    >
      <Select size="large" placeholder="Select region" className="rounded-xl">
        {REGIONS.map((r) => <Select.Option key={r} value={r}>{r}</Select.Option>)}
      </Select>
    </Form.Item>
    <Form.Item
      label={<span className="text-sm font-medium text-text-main">Country</span>}
      name={[prefix, 'country']}
    >
      <Select size="large" placeholder="Select country" className="rounded-xl">
        {COUNTRIES.map((c) => <Select.Option key={c} value={c}>{c}</Select.Option>)}
      </Select>
    </Form.Item>
  </div>
);

export default function EmployeesPage() {
  const [data, setData]             = useState<Employee[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [filter, setFilter]         = useState<string | undefined>();
  const [addModal, setAddModal]     = useState(false);
  const [editTarget, setEditTarget] = useState<Employee | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [saving, setSaving]         = useState(false);
  const [employeeCount, setEmployeeCount] = useState(1);

  const [addForm]  = Form.useForm();
  const [editForm] = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await employeesService.getAll(search, filter);
      setData(res);
    } catch {
      message.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  }, [search, filter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAdd = async (values: any) => {
    try {
      setSaving(true);
      const employees = Array.from({ length: employeeCount }, (_, i) => values.employees[i]).filter(Boolean);
      await employeesService.create(employees);
      message.success('Employee(s) added and welcome email sent');
      setAddModal(false);
      addForm.resetFields();
      setEmployeeCount(1);
      fetchData();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Failed to add employees');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (values: any) => {
    if (!editTarget) return;
    try {
      setSaving(true);
      await employeesService.update(editTarget.id, values);
      message.success('Employee updated');
      setEditTarget(null);
      editForm.resetFields();
      fetchData();
    } catch {
      message.error('Failed to update employee');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setSaving(true);
      await employeesService.remove(deleteTarget.id);
      message.success('Employee deleted');
      setDeleteTarget(null);
      fetchData();
    } catch {
      message.error('Failed to delete employee');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (emp: Employee) => {
    try {
      if (emp.isActive) {
        await employeesService.deactivate(emp.id);
        message.success('Employee deactivated');
      } else {
        await employeesService.activate(emp.id);
        message.success('Employee activated');
      }
      fetchData();
    } catch {
      message.error('Failed to update status');
    }
  };

  const getRowMenu = (record: Employee): MenuProps => ({
    items: [
      {
        key: 'edit', label: 'Edit',
        onClick: () => {
          setEditTarget(record);
          editForm.setFieldsValue({
            fullName: record.name,
            email:    record.email,
            phone:    record.phone,
            role:     record.role,
            region:   record.region,
            country:  record.country,
          });
        },
      },
      { key: 'delete', label: 'Delete', danger: true, onClick: () => setDeleteTarget(record) },
      {
        key:   'toggle',
        label: record.isActive ? 'Deactivate' : 'Activate',
        onClick: () => handleToggleStatus(record),
      },
    ],
  });

  const filterItems: MenuProps['items'] = [
    { key: 'all',         label: 'All',         onClick: () => setFilter(undefined) },
    { key: 'verified',    label: 'Verified',    onClick: () => setFilter('verified') },
    { key: 'deactivated', label: 'Deactivated', onClick: () => setFilter('deactivated') },
  ];

  const columns = [
    {
      title: '', key: 'checkbox', width: 40,
      render: () => <input type="checkbox" className="rounded" />,
    },
    {
      title: 'Employee Name', dataIndex: 'name', key: 'name',
      sorter: (a: Employee, b: Employee) => a.name.localeCompare(b.name),
      render: (text: string) => <span className="font-medium text-text-main">{text}</span>,
    },
    { title: 'Role',    dataIndex: 'role',    key: 'role',
      render: (t: string) => <span className="text-text-muted">{t}</span> },
    { title: 'Email',   dataIndex: 'email',   key: 'email',
      render: (t: string) => <span className="text-text-muted">{t.length > 18 ? t.slice(0,18)+'...' : t}</span> },
    { title: 'Phone',   dataIndex: 'phone',   key: 'phone',
      render: (t: string) => <span className="text-text-muted">{t || '—'}</span> },
    { title: 'Country', dataIndex: 'country', key: 'country',
      render: (t: string) => <span className="text-text-muted">{t || '—'}</span> },
    { title: 'Region',  dataIndex: 'region',  key: 'region',
      render: (t: string) => <span className="text-text-muted">{t || '—'}</span> },
    {
      title: 'Status', key: 'status',
      render: (_: any, record: Employee) => <StatusTag isActive={record.isActive} />,
    },
    {
      title: 'Date Added', dataIndex: 'createdAt', key: 'createdAt',
      render: (d: string) => (
        <span className="text-text-muted">
          {new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}
        </span>
      ),
    },
    {
      title: '', key: 'actions', width: 40,
      render: (_: any, record: Employee) => (
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
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4">
        <Input
          prefix={<SearchOutlined className="text-text-muted" />}
          placeholder="Search by employee name, country..."
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
            type="primary" size="large" icon={<PlusOutlined />}
            onClick={() => { setAddModal(true); setEmployeeCount(1); addForm.resetFields(); }}
            className="rounded-xl font-semibold"
            style={{ background: 'rgba(101,16,127,1)', border: 'none' }}
          >
            Add New Employee
          </Button>
        </div>
      </div>

      {/* Table */}
      <div>
        <h1 className="text-2xl font-bold text-text-main mb-4">Employee Management</h1>
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

      {/* Add Employee Modal */}
      <Modal
        open={addModal}
        onCancel={() => { setAddModal(false); addForm.resetFields(); setEmployeeCount(1); }}
        footer={null}
        centered
        width={600}
        title={<span className="font-bold text-text-main">Add New Employee</span>}
      >
        <Form form={addForm} layout="vertical" requiredMark={false} onFinish={handleAdd} className="mt-4">
          <div className="max-h-[60vh] overflow-y-auto pr-1">
            {Array.from({ length: employeeCount }, (_, i) => (
              <div key={i}>
                {employeeCount > 1 && (
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-semibold text-text-main">Employee {i + 1}</p>
                    {i > 0 && (
                      <button type="button" onClick={() => setEmployeeCount((c) => c - 1)}
                        className="text-red-500 hover:text-red-600">
                        <MinusCircleOutlined />
                      </button>
                    )}
                  </div>
                )}
                <EmployeeForm prefix={`employees.${i}`} />
                {i < employeeCount - 1 && <div className="border-t border-border my-4" />}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setEmployeeCount((c) => c + 1)}
            className="flex items-center gap-2 text-sm font-medium text-primary mb-4 mt-2 hover:text-primary-hover"
          >
            <PlusOutlined />
            Add more
          </button>

          <div className="flex gap-3">
            <Button size="large" onClick={() => { setAddModal(false); addForm.resetFields(); setEmployeeCount(1); }}
              className="flex-1 h-11 rounded-xl">Cancel</Button>
            <Button type="primary" htmlType="submit" size="large" loading={saving}
              className="flex-1 h-11 rounded-xl font-semibold"
              style={{ background: 'rgba(101,16,127,1)', border: 'none' }}>
              {employeeCount > 1 ? 'Add Employees' : 'Add Employee'}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Edit Employee Modal */}
      <Modal
        open={!!editTarget}
        onCancel={() => { setEditTarget(null); editForm.resetFields(); }}
        footer={null}
        centered
        width={560}
        title={<span className="font-bold text-text-main">Edit Employee</span>}
      >
        <Form form={editForm} layout="vertical" requiredMark={false} onFinish={handleEdit} className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label={<span className="text-sm font-medium text-text-main">Full Name</span>}
              name="fullName"
              rules={[{ required: true, message: 'Name is required' }]}
            >
              <Input size="large" className="rounded-xl" />
            </Form.Item>
            <Form.Item
              label={<span className="text-sm font-medium text-text-main">Email</span>}
              name="email"
              rules={[{ type: 'email', message: 'Enter valid email' }]}
            >
              <Input size="large" className="rounded-xl" />
            </Form.Item>
            <Form.Item label={<span className="text-sm font-medium text-text-main">Phone</span>} name="phone">
              <Input size="large" className="rounded-xl" />
            </Form.Item>
            <Form.Item label={<span className="text-sm font-medium text-text-main">Role</span>} name="role">
              <Select size="large" className="rounded-xl">
                <Select.Option value="Admin">Admin</Select.Option>
                <Select.Option value="Sales">Sales</Select.Option>
                <Select.Option value="Support">Support</Select.Option>
                <Select.Option value="Technical">Technical</Select.Option>
                <Select.Option value="HR">HR</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label={<span className="text-sm font-medium text-text-main">Region</span>} name="region">
              <Select size="large" className="rounded-xl">
                {REGIONS.map((r) => <Select.Option key={r} value={r}>{r}</Select.Option>)}
              </Select>
            </Form.Item>
            <Form.Item label={<span className="text-sm font-medium text-text-main">Country</span>} name="country">
              <Select size="large" className="rounded-xl">
                {COUNTRIES.map((c) => <Select.Option key={c} value={c}>{c}</Select.Option>)}
              </Select>
            </Form.Item>
          </div>
          <div className="flex gap-3 mt-2">
            <Button size="large" onClick={() => { setEditTarget(null); editForm.resetFields(); }}
              className="flex-1 h-11 rounded-xl">Cancel</Button>
            <Button type="primary" htmlType="submit" size="large" loading={saving}
              className="flex-1 h-11 rounded-xl font-semibold"
              style={{ background: 'rgba(101,16,127,1)', border: 'none' }}>
              Save Changes
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
        title={<span className="font-bold text-text-main">Delete Employee</span>}
      >
        <div className="py-4 px-2">
          <div className="rounded-xl p-4 mb-6 text-center"
            style={{ border: '1px dashed rgba(220,38,38,0.3)', background: 'rgba(220,38,38,0.03)' }}>
            <p className="text-text-main font-medium">
              Are you sure you want to delete employee?
            </p>
          </div>
          <div className="flex gap-3">
            <Button size="large" onClick={() => setDeleteTarget(null)}
              className="flex-1 h-11 rounded-xl font-semibold">No</Button>
            <Button danger type="primary" size="large" loading={saving} onClick={handleDelete}
              className="flex-1 h-11 rounded-xl font-semibold">Yes</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
