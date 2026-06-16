import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Modal, message, Spin } from 'antd';
import { joinRequestsService } from '../../services/join-requests.service';
import { useAuthStore } from '../../store/auth.store';
import { LINKS } from '../../lib/links';

interface JoinRequest {
  id:        string;
  name:      string;
  email:     string;
  phone:     string;
  createdAt: string;
  status:    string;
}

export default function AdminInviteDetailPage() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [data, setData]                   = useState<JoinRequest | null>(null);
  const [loading, setLoading]             = useState(true);
  const [rejectModal, setRejectModal]     = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    joinRequestsService.getById(id)
      .then(setData)
      .catch(() => message.error('Failed to load request'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAccept = async () => {
    if (!id) return;
    try {
      setActionLoading(true);
      await joinRequestsService.approveCustomer(id);
      message.success('Customer approved and invitation email sent');
      navigate(LINKS.ADMIN_INVITES);
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Failed to approve');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!id) return;
    try {
      setActionLoading(true);
      await joinRequestsService.reject(id);
      message.success('Request rejected');
      setRejectModal(false);
      navigate(LINKS.ADMIN_INVITES);
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Failed to reject');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <Spin size="large" />
    </div>
  );

  if (!data) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={() => navigate(LINKS.ADMIN_INVITES)}
            className="font-semibold text-primary hover:underline"
          >
            Requests
          </button>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={2} className="text-text-muted">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
          </svg>
          <span className="text-text-muted">Request Details</span>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="large"
            onClick={() => setRejectModal(true)}
            className="rounded-xl font-semibold border-primary text-primary h-11 px-6"
          >
            Reject
          </Button>
          <Button
            type="primary"
            size="large"
            loading={actionLoading}
            onClick={handleAccept}
            className="rounded-xl font-semibold h-11 px-6"
            style={{ background: 'rgba(101,16,127,1)', border: 'none' }}
          >
            Accept
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border p-8">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-text-muted uppercase tracking-widest mb-1">Customer Name</p>
            <p className="text-base font-semibold text-text-main">{data.name}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted uppercase tracking-widest mb-1">Email</p>
            <p className="text-base font-semibold text-text-main">{data.email}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted uppercase tracking-widest mb-1">Company</p>
            <p className="text-base font-semibold text-text-main">
              {`${user?.firstName} ${user?.lastName}`}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-muted uppercase tracking-widest mb-1">Phone</p>
            <p className="text-base font-semibold text-text-main">{data.phone || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted uppercase tracking-widest mb-1">Date Submitted</p>
            <p className="text-base font-semibold text-text-main">
              {new Date(data.createdAt).toLocaleDateString('en-GB', {
                day: '2-digit', month: '2-digit', year: '2-digit',
              })}
            </p>
          </div>
        </div>
      </div>

      <Modal
        open={rejectModal}
        onCancel={() => setRejectModal(false)}
        footer={null}
        centered
        width={400}
        title={<span className="font-bold text-text-main">Reject Request</span>}
      >
        <div className="py-4 px-2">
          <div
            className="rounded-xl p-4 mb-6 text-center"
            style={{ border: '1px dashed rgba(101,16,127,0.3)' }}
          >
            <p className="text-text-main font-medium">
              Are you sure you want to reject this request?
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              size="large"
              onClick={() => setRejectModal(false)}
              className="flex-1 h-11 rounded-xl font-semibold border-primary text-primary"
            >
              No
            </Button>
            <Button
              type="primary"
              size="large"
              loading={actionLoading}
              onClick={handleReject}
              className="flex-1 h-11 rounded-xl font-semibold"
              style={{ background: 'rgba(101,16,127,1)', border: 'none' }}
            >
              Yes
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
