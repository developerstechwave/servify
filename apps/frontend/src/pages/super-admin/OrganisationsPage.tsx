import { useEffect, useState, useCallback } from 'react';
import {
  Table, Input, Button, Dropdown, Modal, message, Checkbox,
} from 'antd';
import type { MenuProps } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { organisationsService } from '../../services/organisations.service';
import AddOrganisationModal from '../../components/organisations/AddOrganisationModal';

interface Organisation {
  organisationId:  string;
  name:            string;
  email:           string;
  isActive:        boolean;
  createdAt:       string;
  products:        number;
  services:        number;
  customers:       number;
  employees:       number;
  issuesPending:   number;
  issuesResolved:  number;
}

const StatusTag = ({ isActive }: { isActive: boolean }) => (
  <span
    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
    style={{
      background: isActive ? 'rgba(34,197,94,0.1)' : 'rgba(156,163,175,0.15)',
      color:      isActive ? 'rgba(22,163,74,1)'   : 'rgba(107,114,128,1)',
    }}
  >
    <span
      className="w-1.5 h-1.5 rounded-full"
      style={{ background: isActive ? 'rgba(22,163,74,1)' : 'rgba(107,114,128,1)' }}
    />
    {isActive ? 'Verified' : 'Deactivated'}
  </span>
);

export default function OrganisationsPage() {
  const [data, setData]             = useState<Organisation[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatus]   = useState<string | undefined>();
  const [deleteTarget, setDeleteTarget]     = useState<Organisation | null>(null);
  const [actionLoading, setActionLoading]   = useState(false);
  const [addModalOpen, setAddModalOpen]     = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await organisationsService.getAll(search, statusFilter);
      setData(res);
    } catch {
      message.error('Failed to load organisations');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleActivate = async (org: Organisation) => {
    try {
      setActionLoading(true);
      await organisationsService.activate(org.organisationId);
      message.success(`${org.name} activated`);
      fetchData();
    } catch { message.error('Failed to activate'); }
    finally  { setActionLoading(false); }
  };

  const handleDeactivate = async (org: Organisation) => {
    try {
      setActionLoading(true);
      await organisationsService.deactivate(org.organisationId);
      message.success(`${org.name} deactivated`);
      fetchData();
    } catch { message.error('Failed to deactivate'); }
    finally  { setActionLoading(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setActionLoading(true);
      await organisationsService.delete(deleteTarget.organisationId);
      message.success(`${deleteTarget.name} deleted`);
      setDeleteTarget(null);
      fetchData();
    } catch { message.error('Failed to delete'); }
    finally  { setActionLoading(false); }
  };

  const getRowMenu = (org: Organisation): MenuProps => ({
    items: [
      {
        key:     'delete',
        label:   'Delete',
        danger:  true,
        onClick: () => setDeleteTarget(org),
      },
      {
        key:     'toggle',
        label:   org.isActive ? 'Deactivate' : 'Activate',
        onClick: () => org.isActive ? handleDeactivate(org) : handleActivate(org),
      },
    ],
  });

  const filterItems: MenuProps['items'] = [
    { key: 'all',         label: 'All',        onClick: () => setStatus(undefined) },
    { key: 'active',      label: 'Active',      onClick: () => setStatus('active') },
    { key: 'deactivated', label: 'Deactivated', onClick: () => setStatus('deactivated') },
  ];

  const columns = [
    {
      title:  '',
      key:    'checkbox',
      width:  40,
      render: (_: any, record: Organisation) => <Checkbox disabled={!record.isActive} />,
    },
    {
      title:     'Company Name',
      dataIndex: 'name',
      key:       'name',
      sorter:    (a: Organisation, b: Organisation) => a.name.localeCompare(b.name),
      render:    (text: string, record: Organisation) => (
        <span className={`font-medium ${!record.isActive ? 'text-text-muted' : 'text-text-main'}`}>
          {text.length > 14 ? text.slice(0, 14) + '...' : text}
        </span>
      ),
    },
    {
      title:     'Email',
      dataIndex: 'email',
      key:       'email',
      render:    (text: string, record: Organisation) => (
        <span className={!record.isActive ? 'text-text-muted' : ''}>
          {text.length > 16 ? text.slice(0, 16) + '...' : text}
        </span>
      ),
    },
    { title: 'No. of Products',        dataIndex: 'products',       key: 'products',
      render: (v: number, r: Organisation) => <span className={!r.isActive ? 'text-text-muted' : ''}>{v}</span> },
    { title: 'No. of Services',        dataIndex: 'services',       key: 'services',
      render: (v: number, r: Organisation) => <span className={!r.isActive ? 'text-text-muted' : ''}>{v}</span> },
    { title: 'No. of Customers',       dataIndex: 'customers',      key: 'customers',
      render: (v: number, r: Organisation) => <span className={!r.isActive ? 'text-text-muted' : ''}>{v}</span> },
    { title: 'No. of Employees',       dataIndex: 'employees',      key: 'employees',
      render: (v: number, r: Organisation) => <span className={!r.isActive ? 'text-text-muted' : ''}>{v}</span> },
    { title: 'No. of Issues Pending',  dataIndex: 'issuesPending',  key: 'issuesPending',
      render: (v: number, r: Organisation) => <span className={!r.isActive ? 'text-text-muted' : ''}>{v}</span> },
    { title: 'No. of Issues Resolved', dataIndex: 'issuesResolved', key: 'issuesResolved',
      render: (v: number, r: Organisation) => <span className={!r.isActive ? 'text-text-muted' : ''}>{v}</span> },
    {
      title:     'Date Added',
      dataIndex: 'createdAt',
      key:       'createdAt',
      render:    (date: string, r: Organisation) => (
        <span className={!r.isActive ? 'text-text-muted' : ''}>
          {new Date(date).toLocaleDateString('en-GB', {
            day: '2-digit', month: '2-digit', year: '2-digit',
          })}
        </span>
      ),
    },
    {
      title:  'Status',
      key:    'status',
      render: (_: any, record: Organisation) => <StatusTag isActive={record.isActive} />,
    },
    {
      title:  '',
      key:    'actions',
      width:  40,
      render: (_: any, record: Organisation) => (
        <Dropdown menu={getRowMenu(record)} trigger={['click']} placement="bottomRight">
          <button className="text-text-muted hover:text-text-main p-1 rounded transition-colors">
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
          placeholder="Search by company name, service, ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-xl max-w-sm"
          size="large"
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
            onClick={() => setAddModalOpen(true)}
            className="rounded-xl font-semibold"
            style={{ background: 'rgba(101,16,127,1)', border: 'none' }}
          >
            Add New Organization
          </Button>
        </div>
      </div>

      {/* Table */}
      <div>
        <h1 className="text-2xl font-bold text-text-main mb-4">Organizations</h1>
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <Table
            columns={columns}
            dataSource={data}
            rowKey="organisationId"
            loading={loading}
            pagination={{ pageSize: 9, showSizeChanger: false, style: { padding: '16px 24px' } }}
            scroll={{ x: 'max-content' }}
            style={{ border: 'none' }}
          />
        </div>
      </div>

      {/* Add Organisation Modal */}
      <AddOrganisationModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={() => { setAddModalOpen(false); fetchData(); }}
      />

      {/* Delete confirmation modal */}
      <Modal
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        footer={null}
        centered
        width={400}
        title={<span className="font-bold text-text-main">Delete Organisation</span>}
      >
        <div className="py-4 px-2">
          <div
            className="rounded-xl p-4 mb-6 text-center"
            style={{ border: '1px dashed rgba(220,38,38,0.3)', background: 'rgba(220,38,38,0.03)' }}
          >
            <p className="text-text-main font-medium">
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong>?
              This action cannot be undone.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              size="large"
              onClick={() => setDeleteTarget(null)}
              className="flex-1 h-11 rounded-xl font-semibold"
            >
              Cancel
            </Button>
            <Button
              danger
              type="primary"
              size="large"
              loading={actionLoading}
              onClick={handleDelete}
              className="flex-1 h-11 rounded-xl font-semibold"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
