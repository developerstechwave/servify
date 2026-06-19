import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Spin, message, Modal } from 'antd';
import { customerSubscriptionsService } from '../../services/customer-subscriptions.service';
import { LINKS } from '../../lib/links';

interface Subscription {
  id:          string;
  productName: string;
  serviceName: string;
  description: string;
  status:      string;
  billingType: string;
  createdAt:   string;
  expiryDate:  string;
}

export default function SubscriptionDetailPage() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sub, setSub]               = useState<Subscription | null>(null);
  const [loading, setLoading]       = useState(true);
  const [unsubModal, setUnsubModal] = useState(false);
  const [saving, setSaving]         = useState(false);

  useEffect(() => {
    if (!id) return;
    customerSubscriptionsService.getOne(id)
      .then(setSub)
      .catch(() => message.error('Failed to load subscription'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleUnsubscribe = async () => {
    if (!id) return;
    try {
      setSaving(true);
      await customerSubscriptionsService.unsubscribe(id);
      message.success('Unsubscribed successfully');
      setUnsubModal(false);
      navigate(LINKS.CUSTOMER_SUBSCRIPTIONS);
    } catch {
      message.error('Failed to unsubscribe');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full"><Spin size="large" /></div>
  );
  if (!sub) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb + action */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <button onClick={() => navigate(LINKS.CUSTOMER_SUBSCRIPTIONS)}
            className="font-semibold text-primary hover:underline">
            Subscriptions
          </button>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={2} className="text-text-muted">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
          </svg>
          <span className="text-text-muted">Network Details</span>
        </div>
        <Button
          type="primary" size="large"
          onClick={() => navigate(LINKS.CUSTOMER_SUBSCRIPTIONS)}
          icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" />
          </svg>}
          className="rounded-xl font-semibold h-11 px-6"
          style={{ background: 'rgba(101,16,127,1)', border: 'none' }}
        >
          Add New Subscription
        </Button>
      </div>

      {/* Detail card */}
      <div className="bg-white rounded-2xl border border-border p-8">
        <h2 className="text-lg font-bold text-text-main mb-4">{sub.productName}</h2>
        <p className="text-text-main leading-relaxed whitespace-pre-wrap mb-8">
          {sub.description || 'No description provided.'}
        </p>

        <div className="border-t border-border pt-6 flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ background: 'rgba(240,231,242,1)', color: 'rgba(101,16,127,1)' }}
          >
            A
          </div>
          <div>
            <p className="text-xs text-text-muted">Created by</p>
            <p className="text-sm font-semibold text-text-main">Admin</p>
          </div>
        </div>
      </div>

      {/* Unsubscribe modal */}
      <Modal
        open={unsubModal}
        onCancel={() => setUnsubModal(false)}
        footer={null} centered width={400}
        title={<span className="font-bold text-text-main">Unsubscribe Service</span>}
      >
        <div className="py-4">
          <p className="text-center text-text-main mb-6">
            Are you sure you want to unsubscribe service?
          </p>
          <div className="flex gap-3">
            <Button size="large" onClick={() => setUnsubModal(false)}
              className="flex-1 h-11 rounded-xl font-semibold">No</Button>
            <Button type="primary" size="large" loading={saving} onClick={handleUnsubscribe}
              className="flex-1 h-11 rounded-xl font-semibold"
              style={{ background: 'rgba(101,16,127,1)', border: 'none' }}>Yes</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
