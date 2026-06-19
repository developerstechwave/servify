import { useEffect, useState, useCallback } from 'react';
import { Table, Input, message } from 'antd';
import { customersService } from '../../services/customers.service';

interface Customer {
  id:        string;
  name:      string;
  email:     string;
  phone:     string;
  isActive:  boolean;
  createdAt: string;
}

const StatusTag = ({ isActive }: { isActive: boolean }) => (
  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${
    isActive ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'
  }`}>
    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`} />
    {isActive ? 'Verified' : 'Not Verified'}
  </span>
);

export default function EmployeeCustomersPage() {
  const [data, setData]       = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await customersService.getAll(search);
      setData(res);
    } catch {
      message.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns = [
    {
      title:     'Customer Name',
      dataIndex: 'name',
      key:       'name',
      sorter:    (a: Customer, b: Customer) => a.name.localeCompare(b.name),
      render:    (t: string) => <span className="font-medium text-text-main">{t}</span>,
    },
    {
      title:     'Email',
      dataIndex: 'email',
      key:       'email',
      render:    (t: string) => (
        <span className="text-text-muted">
          {t.length > 22 ? t.slice(0, 22) + '...' : t}
        </span>
      ),
    },
    {
      title:     'Phone',
      dataIndex: 'phone',
      key:       'phone',
      render:    (t: string) => <span className="text-text-muted">{t || '—'}</span>,
    },
    {
      title:  'Status',
      key:    'status',
      render: (_: any, r: Customer) => <StatusTag isActive={r.isActive} />,
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
  ];

  return (
    <div className="flex flex-col gap-6">
      <Input
        prefix={
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={2} className="text-text-muted">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        }
        placeholder="Search by customer name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="rounded-xl max-w-sm"
        size="large"
        allowClear
      />

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
    </div>
  );
}
