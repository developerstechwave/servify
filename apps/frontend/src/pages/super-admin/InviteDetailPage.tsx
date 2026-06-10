import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Modal, message, Spin } from 'antd';
import { joinRequestsService } from '../../services/join-requests.service';
import { LINKS } from '../../lib/links';

interface JoinRequest {
  id:                  string;
  name:                string;
  email:               string;
  phone:               string;
  description:         string;
  businessCertificate: string;
  createdAt:           string;
  status:              string;
}

export default function InviteDetailPage() {
  const { id }    = useParams<{ id: string }>();
  const navigate  = useNavigate();
  const [data, setData]           = useState<JoinRequest | null>(null);
  const [loading, setLoading]     = useState(true);
  const [rejectModal, setReject]  = useState(false);
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
      await joinRequestsService.approveOrganisation(id);
      message.success('Organisation approved and invitation email sent');
      navigate(LINKS.SUPER_ADMIN_INVITES);
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
      setReject(false);
      navigate(LINKS.SUPER_ADMIN_INVITES);
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Failed to reject');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spin size="large" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* Topbar breadcrumb + actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={() => navigate(LINKS.SUPER_ADMIN_INVITES)}
            className="font-semibold text-primary hover:underline"
          >
            Request
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
            onClick={() => setReject(true)}
            className="rounded-xl font-semibold border-primary text-primary h-11 px-6"
            icon={
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728" />
              </svg>
            }
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
            icon={
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            }
          >
            Accept
          </Button>
        </div>
      </div>

      {/* Detail card */}
      <div className="bg-white rounded-2xl border border-border p-8">
        {/* Description */}
        <p className="text-text-main leading-relaxed mb-8">
          {data.description || 'No description provided.'}
        </p>

        {/* Certificate */}
        {data.businessCertificate && (
          <div className="flex items-center gap-4 p-4 border border-border rounded-xl w-fit">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(239,68,68,0.08)' }}
            >
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24"
                stroke="rgba(239,68,68,1)" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-text-main">Business_Certificate.pdf</p>
              <p className="text-xs text-text-muted mt-0.5">
                Shared by {data.name} on{' '}
                {new Date(data.createdAt).toLocaleDateString('en-GB', {
                  day: '2-digit', month: '2-digit', year: '2-digit',
                })}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Reject confirmation modal */}
      <Modal
        open={rejectModal}
        onCancel={() => setReject(false)}
        footer={null}
        centered
        width={400}
        title={<span className="font-bold text-text-main">Reject Invite</span>}
      >
        <div className="py-4 px-2">
          <div
            className="rounded-xl p-4 mb-6 text-center"
            style={{ border: '1px dashed rgba(101,16,127,0.3)' }}
          >
            <p className="text-text-main font-medium">
              Are you sure you want to reject this invite?
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              size="large"
              onClick={() => setReject(false)}
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
