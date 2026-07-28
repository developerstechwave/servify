import { useEffect, useState, useCallback, useRef } from 'react';
import { Table, Button, Dropdown, Modal, message } from 'antd';
import type { MenuProps } from 'antd';
import { paymentsService } from '../../services/payments.service';
import { useAuthStore } from '../../store/auth.store';
import { profileService } from '../../services/profile.service';

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

interface Profile {
  firstName:   string;
  lastName:    string;
  email:       string;
  phone:       string;
  address:     string;
  country:     string;
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

// Generate invoice number from payment ID
const toInvoiceNo = (id: string) => `INV-${id.slice(0,8).toUpperCase()}`;

export default function CustomerPaymentsPage() {
  const { user }   = useAuthStore();
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [data, setData]               = useState<Payment[]>([]);
  const [profile, setProfile]         = useState<Profile | null>(null);
  const [loading, setLoading]         = useState(true);
  const [invoiceModal, setInvoiceModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [payments, prof] = await Promise.all([
        paymentsService.getMyPayments(),
        profileService.getProfile(),
      ]);
      setData(payments);
      setProfile(prof);
    } catch {
      message.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handlePrintInvoice = (payment?: Payment) => {
    const target = payment || data.find((p) => p.status === 'paid');
    if (!target) {
      message.warning('No paid payments to generate invoice for');
      return;
    }
    setSelectedPayment(target);
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
          <title>Invoice ${selectedPayment ? toInvoiceNo(selectedPayment.id) : ''}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
            table { width: 100%; border-collapse: collapse; margin: 24px 0; }
            th { text-align: left; padding: 8px; border-bottom: 2px solid #eee; font-size: 12px; text-transform: uppercase; color: #888; }
            td { padding: 12px 8px; border-bottom: 1px solid #eee; }
            .total { font-weight: bold; font-size: 16px; }
            .amount-due { color: rgba(101,16,127,1); font-size: 22px; font-weight: bold; }
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
      {
        key: 'invoice', label: 'View Invoice',
        disabled: record.status !== 'paid',
        onClick: () => handlePrintInvoice(record),
      },
    ],
  });

  const invoiceDate = selectedPayment
    ? new Date(selectedPayment.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '';
  const dueDate = selectedPayment
    ? new Date(new Date(selectedPayment.createdAt).getTime() + 15 * 24 * 60 * 60 * 1000)
        .toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '';

  const columns = [
    { title: '', key: 'cb', width: 40, render: () => <input type="checkbox" /> },
    {
      title: 'Price', dataIndex: 'amount', key: 'amount',
      sorter: (a: Payment, b: Payment) => a.amount - b.amount,
      render: (v: number) => <span className="font-medium">GHC{Number(v).toFixed(2)}</span>,
    },
    {
      title: 'Service', dataIndex: 'serviceName', key: 'serviceName',
      render: (t: string) => <span className="text-text-muted">{t}</span>,
    },
    {
      title: 'Status', key: 'status',
      render: (_: any, r: Payment) => <StatusTag status={r.status} />,
    },
    {
      title: 'Date Purchased', dataIndex: 'createdAt', key: 'createdAt',
      render: (d: string) => (
        <span className="text-text-muted">
          {new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}
        </span>
      ),
    },
    {
      title: 'Expiry Date', dataIndex: 'expiryDate', key: 'expiryDate',
      render: (d: string | null) => d
        ? <span className="text-red-500 font-medium text-sm">
            {new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}
          </span>
        : <span className="text-text-muted">—</span>,
    },
    {
      title: '', key: 'actions', width: 40,
      render: (_: any, record: Payment) => (
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

  const customerName = profile ? `${profile.firstName} ${profile.lastName}` : user?.email ?? '';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-main">Payments</h1>
        <Button
          type="primary" size="large"
          onClick={() => handlePrintInvoice()}
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
        centered width={680}
        title={<span className="font-bold text-text-main">
          Invoice {selectedPayment ? toInvoiceNo(selectedPayment.id) : ''}
        </span>}
      >
        <div ref={invoiceRef} className="p-6 bg-white">
          <div className="flex items-start justify-between mb-10">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                style={{ background: 'rgba(101,16,127,1)' }}
              >
                S
              </div>
              <div>
                <p className="font-bold text-text-main text-sm">Servify</p>
                <p className="text-xs text-text-muted">support@servify.com</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-5xl font-bold text-gray-200">Invoice</p>
              <p className="text-sm font-semibold" style={{ color: 'rgba(101,16,127,1)' }}>
                {selectedPayment ? `#${toInvoiceNo(selectedPayment.id)}` : ''}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-8">
            <div>
              <p className="text-xs text-text-muted uppercase tracking-widest mb-2">Billed To</p>
              <p className="font-semibold text-sm text-text-main">{customerName}</p>
              <p className="text-xs text-text-muted">{profile?.email || user?.email}</p>
              {profile?.phone   && <p className="text-xs text-text-muted">{profile.phone}</p>}
              {profile?.address && <p className="text-xs text-text-muted">{profile.address}</p>}
              {profile?.country && <p className="text-xs text-text-muted">{profile.country}</p>}
            </div>
            <div>
              <p className="text-xs text-text-muted uppercase tracking-widest mb-2">Invoice Date</p>
              <p className="font-semibold text-sm text-text-main">{invoiceDate}</p>
              <p className="text-xs text-text-muted uppercase tracking-widest mt-3 mb-2">Due Date</p>
              <p className="font-semibold text-sm text-text-main">{dueDate}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-text-muted uppercase tracking-widest mb-2">Amount Due</p>
              <p className="text-2xl font-bold" style={{ color: 'rgba(101,16,127,1)' }}>
                GHC{selectedPayment ? Number(selectedPayment.amount).toFixed(2) : '0.00'}
              </p>
              {selectedPayment?.vat && (
                <p className="text-xs text-text-muted mt-1">VAT: {selectedPayment.vat}%</p>
              )}
            </div>
          </div>

          <div className="mb-6">
            <p className="font-semibold text-text-main mb-3">Service Details</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-xs text-text-muted font-semibold uppercase">#</th>
                  <th className="text-left py-2 text-xs text-text-muted font-semibold uppercase">Title / Description</th>
                  <th className="text-right py-2 text-xs text-text-muted font-semibold uppercase">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {selectedPayment && (
                  <tr className="border-b border-border">
                    <td className="py-3 text-text-muted">1</td>
                    <td className="py-3">
                      <p className="font-medium text-text-main">{selectedPayment.serviceName}</p>
                      <p className="text-xs text-text-muted">{selectedPayment.productName}</p>
                    </td>
                    <td className="py-3 text-right font-medium">
                      GHC{Number(selectedPayment.amount).toFixed(2)}
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={2} className="py-3 font-bold text-text-main">Total</td>
                  <td className="py-3 text-right font-bold text-text-main">
                    GHC{selectedPayment ? Number(selectedPayment.amount).toFixed(2) : '0.00'}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <p className="text-xs text-text-muted mb-8">
            Please pay within 15 days of receiving this invoice.
          </p>

          <div className="border-t border-border pt-6">
            <p className="text-sm font-medium text-text-main mb-1">Thank you for your business!</p>
            <p className="text-xs text-text-muted">
              For any payment queries, contact us at support@servify.com
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
