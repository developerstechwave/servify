import { useEffect, useState, useCallback, useRef } from 'react';
import { Table, Button, Dropdown, Modal, message } from 'antd';
import type { MenuProps } from 'antd';
import { paymentsService } from '../../services/payments.service';
import { useAuthStore } from '../../store/auth.store';

interface Payment {
  id:          string;
  serviceName: string;
  productName: string;
  amount:      number;
  vat:         string;
  status:      string;
  createdAt:   string;
  expiryDate:  string | null;
}

const StatusTag = ({ status }: { status: string }) => {
  const map: Record<string, { color: string; bg: string; label: string }> = {
    paid:    { color: 'text-green-600',  bg: 'bg-green-50',  label: 'Success' },
    pending: { color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Pending' },
    failed:  { color: 'text-red-500',    bg: 'bg-red-50',    label: 'Failed'  },
  };
  const s = map[status] ?? map['pending'];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${s.color} ${s.bg}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {s.label}
    </span>
  );
};

export default function CustomerPaymentsPage() {
  const { user }  = useAuthStore();
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [data, setData]               = useState<Payment[]>([]);
  const [loading, setLoading]         = useState(true);
  const [invoiceModal, setInvoiceModal] = useState(false);
  const [selectedPayments, setSelectedPayments] = useState<Payment[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await paymentsService.getMyPayments();
      setData(res);
    } catch {
      message.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handlePrintInvoice = () => {
    const selected = data.filter((p) => p.status === 'paid');
    if (selected.length === 0) {
      message.warning('No paid payments to generate invoice for');
      return;
    }
    setSelectedPayments(selected);
    setInvoiceModal(true);
  };

  const handlePrint = () => {
    const content = invoiceRef.current;
    if (!content) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>Invoice</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
            .logo { display: flex; align-items: center; gap: 12px; }
            .invoice-title { font-size: 48px; color: #ccc; font-weight: bold; }
            .invoice-id { font-size: 14px; color: rgba(101,16,127,1); }
            table { width: 100%; border-collapse: collapse; margin: 24px 0; }
            th { text-align: left; padding: 8px; border-bottom: 2px solid #eee; font-size: 12px; text-transform: uppercase; color: #888; }
            td { padding: 12px 8px; border-bottom: 1px solid #eee; }
            .total { font-weight: bold; font-size: 16px; }
            .amount-due { color: rgba(101,16,127,1); font-size: 22px; font-weight: bold; }
            .footer { margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px; }
            .section-label { font-size: 11px; text-transform: uppercase; color: #888; letter-spacing: 1px; margin-bottom: 4px; }
          </style>
        </head>
        <body>${content.innerHTML}</body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  const getRowMenu = (record: Payment): MenuProps => ({
    items: [
      { key: 'invoice', label: 'View Details',
        onClick: () => { setSelectedPayments([record]); setInvoiceModal(true); } },
    ],
  });

  const total = selectedPayments.reduce((sum, p) => sum + Number(p.amount), 0);
  const invoiceId = `AB${Date.now().toString().slice(-4)}-01`;
  const today     = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const dueDate   = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
    .toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const columns = [
    { title: '', key: 'cb', width: 40, render: () => <input type="checkbox" /> },
    {
      title:     'Price',
      dataIndex: 'amount',
      key:       'amount',
      sorter:    (a: Payment, b: Payment) => a.amount - b.amount,
      render:    (v: number) => <span className="font-medium">GHC{Number(v).toFixed(2)}</span>,
    },
    {
      title:     'Service',
      dataIndex: 'serviceName',
      key:       'serviceName',
      render:    (t: string) => <span className="text-text-muted">{t}</span>,
    },
    {
      title:  'Status',
      key:    'status',
      render: (_: any, r: Payment) => <StatusTag status={r.status} />,
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
      render:    (d: string | null) => d
        ? <span className="text-red-500 font-medium text-sm">
            {new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}
          </span>
        : <span className="text-text-muted">—</span>,
    },
    {
      title:  '',
      key:    'actions',
      width:  40,
      render: (_: any, record: Payment) => (
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-main">Payments</h1>
        <Button
          type="primary" size="large"
          onClick={handlePrintInvoice}
          className="rounded-xl font-semibold"
          style={{ background: 'rgba(101,16,127,1)', border: 'none' }}
          icon={
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        >
          Request Invoice
        </Button>
      </div>

      {/* Table */}
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

      {/* Invoice Modal */}
      <Modal
        open={invoiceModal}
        onCancel={() => setInvoiceModal(false)}
        footer={
          <div className="flex gap-3 justify-end">
            <Button size="large" onClick={() => setInvoiceModal(false)} className="rounded-xl">Close</Button>
            <Button type="primary" size="large" onClick={handlePrint}
              className="rounded-xl font-semibold"
              style={{ background: 'rgba(101,16,127,1)', border: 'none' }}>
              Print / Download
            </Button>
          </div>
        }
        centered
        width={680}
        title={<span className="font-bold text-text-main">Invoice</span>}
      >
        {/* Invoice content */}
        <div ref={invoiceRef} className="p-6 bg-white">
          {/* Header */}
          <div className="flex items-start justify-between mb-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                  style={{ background: 'rgba(101,16,127,1)' }}
                >
                  S
                </div>
                <div>
                  <p className="font-bold text-text-main text-sm">Customer Service</p>
                  <p className="text-xs text-text-muted">customer.service@servify.com</p>
                  <p className="text-xs text-text-muted">+91 00000 00000</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-5xl font-bold text-gray-200">Invoice</p>
              <p className="text-sm font-semibold" style={{ color: 'rgba(101,16,127,1)' }}>
                #{invoiceId}
              </p>
            </div>
          </div>

          {/* Billed to + dates */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div>
              <p className="text-xs text-text-muted uppercase tracking-widest mb-2">Billed To</p>
              <p className="font-semibold text-sm text-text-main">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-text-muted">{user?.email}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted uppercase tracking-widest mb-2">Invoice Date</p>
              <p className="font-semibold text-sm text-text-main">{today}</p>
              <p className="text-xs text-text-muted uppercase tracking-widest mt-3 mb-2">Due Date</p>
              <p className="font-semibold text-sm text-text-main">{dueDate}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-text-muted uppercase tracking-widest mb-2">Amount Due</p>
              <p className="text-2xl font-bold" style={{ color: 'rgba(101,16,127,1)' }}>
                GHC{total.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Line items */}
          <div className="mb-6">
            <p className="font-semibold text-text-main mb-3">Services</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-xs text-text-muted font-semibold uppercase">#</th>
                  <th className="text-left py-2 text-xs text-text-muted font-semibold uppercase">Title / Description</th>
                  <th className="text-right py-2 text-xs text-text-muted font-semibold uppercase">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {selectedPayments.map((p, i) => (
                  <tr key={p.id} className="border-b border-border">
                    <td className="py-3 text-text-muted">{i + 1}</td>
                    <td className="py-3">
                      <p className="font-medium text-text-main">{p.serviceName}</p>
                      <p className="text-xs text-text-muted">{p.productName}</p>
                    </td>
                    <td className="py-3 text-right font-medium">GHC{Number(p.amount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={2} className="py-3 font-bold text-text-main">Total</td>
                  <td className="py-3 text-right font-bold text-text-main">GHC{total.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Note */}
          <p className="text-xs text-text-muted mb-8">
            ☑ Please pay within 15 days of receiving this invoice.
          </p>

          {/* Footer */}
          <div className="border-t border-border pt-6">
            <p className="text-sm font-medium text-text-main mb-4">Thank you for the business!</p>
            <div>
              <p className="text-xs text-text-muted uppercase tracking-widest mb-3">Payment Info</p>
              <div className="grid grid-cols-4 gap-4 text-xs">
                <div>
                  <p className="font-semibold text-text-main">Account Name</p>
                  <p className="text-text-muted">Servify Ltd</p>
                  <p className="text-text-muted">Business Address, City</p>
                </div>
                <div>
                  <p className="font-semibold text-text-main">Bank Name</p>
                  <p className="text-text-muted">ABCD BANK</p>
                </div>
                <div>
                  <p className="font-semibold text-text-main">Swift Code</p>
                  <p className="text-text-muted">ABCDUSBBXXX</p>
                </div>
                <div>
                  <p className="font-semibold text-text-main">Account #</p>
                  <p className="text-text-muted">37474892300011</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
