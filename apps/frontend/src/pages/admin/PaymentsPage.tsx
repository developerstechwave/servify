import { useEffect, useState, useCallback } from 'react';
import { Table, Input, Button, Dropdown, message } from 'antd';
import type { MenuProps } from 'antd';
import { paymentsService } from '../../services/payments.service';

interface Payment {
  id:           string;
  customerName: string;
  serviceName:  string;
  productName:  string;
  amount:       number;
  vat:          string;
  status:       string;
  expiryDate:   string | null;
  createdAt:    string;
}

const StatusTag = ({ status }: { status: string }) => {
  const map: Record<string, { color: string; bg: string; label: string }> = {
    paid:    { color: 'text-green-600', bg: 'bg-green-50', label: 'Paid'    },
    pending: { color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Pending' },
    failed:  { color: 'text-red-500',   bg: 'bg-red-50',   label: 'Failed'  },
  };
  const s = map[status] ?? map.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${s.color} ${s.bg}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {s.label}
    </span>
  );
};

export default function PaymentsPage() {
  const [data, setData]       = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState<string | undefined>();
  const [stats, setStats]     = useState<any>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [payments, s] = await Promise.all([
        paymentsService.getAll(filter, search),
        paymentsService.getStats(),
      ]);
      setData(payments);
      setStats(s);
    } catch {
      message.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await paymentsService.updateStatus(id, status);
      message.success('Payment status updated');
      fetchData();
    } catch {
      message.error('Failed to update status');
    }
  };

  const filterItems: MenuProps['items'] = [
    { key: 'all',     label: 'All',     onClick: () => setFilter(undefined)  },
    { key: 'paid',    label: 'Paid',    onClick: () => setFilter('paid')     },
    { key: 'pending', label: 'Pending', onClick: () => setFilter('pending')  },
    { key: 'failed',  label: 'Failed',  onClick: () => setFilter('failed')   },
  ];

  const columns = [
    {
      title: 'Customer', dataIndex: 'customerName', key: 'customerName',
      render: (t: string) => <span className="font-medium text-text-main">{t}</span>,
    },
    {
      title: 'Product', dataIndex: 'productName', key: 'productName',
      render: (t: string) => <span className="text-text-muted">{t}</span>,
    },
    {
      title: 'Service', dataIndex: 'serviceName', key: 'serviceName',
      render: (t: string) => <span className="text-text-muted">{t}</span>,
    },
    {
      title: 'Amount', dataIndex: 'amount', key: 'amount',
      sorter: (a: Payment, b: Payment) => a.amount - b.amount,
      render: (v: number) => <span className="font-medium">GHC{Number(v).toFixed(2)}</span>,
    },
    {
      title: 'VAT', dataIndex: 'vat', key: 'vat',
      render: (t: string) => <span className="text-text-muted">{t ? `${t}%` : '—'}</span>,
    },
    {
      title: 'Date', dataIndex: 'createdAt', key: 'createdAt',
      render: (d: string) => (
        <span className="text-text-muted">
          {new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}
        </span>
      ),
    },
    {
      title: 'Expiry', dataIndex: 'expiryDate', key: 'expiryDate',
      render: (d: string | null) => d ? (
        <span className="text-red-500 font-medium text-sm">
          {new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}
        </span>
      ) : <span className="text-text-muted">—</span>,
    },
    {
      title: 'Status', key: 'status',
      render: (_: any, record: Payment) => <StatusTag status={record.status} />,
    },
    {
      title: '', key: 'actions', width: 40,
      render: (_: any, record: Payment) => (
        <Dropdown
          menu={{
            items: [
              { key: 'paid',    label: 'Mark as Paid',    onClick: () => handleStatusUpdate(record.id, 'paid')    },
              { key: 'pending', label: 'Mark as Pending', onClick: () => handleStatusUpdate(record.id, 'pending') },
              { key: 'failed',  label: 'Mark as Failed',  onClick: () => handleStatusUpdate(record.id, 'failed')  },
            ],
          }}
          trigger={['click']}
          placement="bottomRight"
        >
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
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Revenue',   value: `GHC${Number(stats.total).toFixed(2)}`,  color: 'text-primary'     },
            { label: 'Total Paid',      value: `GHC${Number(stats.paid).toFixed(2)}`,   color: 'text-green-600'   },
            { label: 'Pending',         value: stats.pending,                            color: 'text-yellow-600'  },
            { label: 'Failed',          value: stats.failed,                             color: 'text-red-500'     },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-border shadow-sm">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-2">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center justify-between gap-4">
        <Input
          prefix={
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={2} className="text-text-muted">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
          placeholder="Search by customer, service..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-xl max-w-sm"
          size="large"
          allowClear
        />
        <Dropdown menu={{ items: filterItems }} trigger={['click']}>
          <Button size="large" className="rounded-xl border-primary text-primary font-medium">
            Filter by Status
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={2} className="ml-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </Button>
        </Dropdown>
      </div>

      {/* Table */}
      <div>
        <h1 className="text-2xl font-bold text-text-main mb-4">Payments</h1>
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
    </div>
  );
}
