import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Spin, message, Modal } from 'antd';
import { customerSubscriptionsService } from '../../services/customer-subscriptions.service';
import { useAuthStore } from '../../store/auth.store';
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
  const { user } = useAuthStore();
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

  const orgName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : 'Your Organisation';

  return (
    <div className="flex flex-col gap-6">
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
          <span className="text-text-muted">{sub.productName} Details</span>
        </div>
        <Button
          type="primary" size="large"
          onClick={() => navigate(LINKS.CUSTOMER_SUBSCRIPTIONS)}
          className="rounded-xl font-semibold h-11 px-6"
          style={{ background: 'rgba(101,16,127,1)', border: 'none' }}
        >
          Add New Subscription
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-border p-8">
        <h2 className="text-lg font-bold text-text-main mb-2">{sub.productName}</h2>

        <div className="flex gap-4 mb-6">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-secondary text-primary">
            {sub.serviceName}
          </span>
          {sub.billingType && (
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-secondary text-primary capitalize">
              {sub.billingType}
            </span>
          )}
        </div>

        <p className="text-text-main leading-relaxed whitespace-pre-wrap mb-8">
          {sub.description || 'No description provided for this subscription.'}
        </p>

        <div className="grid grid-cols-2 gap-4 border-t border-border pt-6 mb-6">
          <div>
            <p className="text-xs text-text-muted mb-1">Date Subscribed</p>
            <p className="text-sm font-semibold text-text-main">
              {new Date(sub.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>
          {sub.expiryDate && (
            <div>
              <p className="text-xs text-text-muted mb-1">Expiry Date</p>
              <p className="text-sm font-semibold text-red-500">
                {new Date(sub.expiryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-border pt-6 flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ background: 'rgba(240,231,242,1)', color: 'rgba(101,16,127,1)' }}
          >
            {orgName[0]}
          </div>
          <div>
            <p className="text-xs text-text-muted">Managed by</p>
            <p className="text-sm font-semibold text-text-main">{orgName}</p>
            <p className="text-xs text-text-muted">Organisation Administrator</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            danger size="large"
            onClick={() => setUnsubModal(true)}
            disabled={sub.status === 'unsubscribed'}
            className="rounded-xl"
          >
            Unsubscribe
          </Button>
        </div>
      </div>

      <Modal
        open={unsubModal}
        onCancel={() => setUnsubModal(false)}
        footer={null} centered width={400}
        title={<span className="font-bold text-text-main">Unsubscribe Service</span>}
      >
        <div className="py-4">
          <p className="text-center text-text-main mb-6">
            Are you sure you want to unsubscribe from <strong>{sub.serviceName}</strong>?
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
