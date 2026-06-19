import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Modal, Spin, message } from 'antd';
import { issuesService } from '../../services/issues.service';
import { useAuthStore } from '../../store/auth.store';
import { LINKS } from '../../lib/links';

interface Comment {
  id:         string;
  body:       string;
  authorId:   string;
  authorName: string;
  createdAt:  string;
}

interface Issue {
  id:           string;
  topic:        string;
  description:  string;
  status:       string;
  customerName: string;
  serviceName:  string;
  assigneeId:   string | null;
  assigneeName: string | null;
  comments:     Comment[];
  createdAt:    string;
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending:     { bg: 'rgba(234,179,8,0.1)',  color: 'rgba(161,98,7,1)'  },
  in_progress: { bg: 'rgba(59,130,246,0.1)', color: 'rgba(29,78,216,1)' },
  resolved:    { bg: 'rgba(34,197,94,0.1)',  color: 'rgba(21,128,61,1)' },
  failed:      { bg: 'rgba(239,68,68,0.1)',  color: 'rgba(185,28,28,1)' },
};

export default function CustomerIssueDetailPage() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [issue, setIssue]               = useState<Issue | null>(null);
  const [loading, setLoading]           = useState(true);
  const [comment, setComment]           = useState('');
  const [sending, setSending]           = useState(false);
  const [deleteCommentTarget, setDeleteCommentTarget] = useState<Comment | null>(null);
  const [reportModal, setReportModal]   = useState(false);

  const fetchIssue = async () => {
    if (!id) return;
    try {
      const data = await issuesService.getOne(id);
      setIssue(data);
    } catch {
      message.error('Failed to load issue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchIssue(); }, [id]);

  const handleComment = async () => {
    if (!id || !comment.trim()) return;
    try {
      setSending(true);
      await issuesService.addComment(id, comment.trim());
      setComment('');
      fetchIssue();
    } catch {
      message.error('Failed to add comment');
    } finally {
      setSending(false);
    }
  };

  const statusStyle = STATUS_COLORS[issue?.status ?? 'pending'] ?? STATUS_COLORS.pending;

  if (loading) return (
    <div className="flex items-center justify-center h-full"><Spin size="large" /></div>
  );
  if (!issue) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb + Send Report */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <button onClick={() => navigate(LINKS.CUSTOMER_ISSUES)}
            className="font-semibold text-primary hover:underline">Issues</button>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={2} className="text-text-muted">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
          </svg>
          <span className="text-text-muted">Issue Details</span>
        </div>
        <Button
          type="primary" size="large"
          onClick={() => setReportModal(true)}
          className="rounded-xl font-semibold h-11 px-6"
          style={{ background: 'rgba(101,16,127,1)', border: 'none' }}
          icon={
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          }
        >
          Send Report
        </Button>
      </div>

      {/* Issue card */}
      <div className="bg-white rounded-2xl border border-border p-8">
        {/* Status */}
        <div className="mb-4">
          <span
            className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full"
            style={{ background: statusStyle.bg, color: statusStyle.color }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {issue.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        <h2 className="text-lg font-bold text-text-main mb-4">{issue.topic}</h2>
        <p className="text-text-main leading-relaxed mb-8">{issue.description}</p>

        {/* Created by / Assigned to */}
        <div className="grid grid-cols-2 gap-6 border-t border-border pt-6 mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{ background: 'rgba(240,231,242,1)', color: 'rgba(101,16,127,1)' }}
            >
              {issue.customerName?.[0] ?? 'C'}
            </div>
            <div>
              <p className="text-xs text-text-muted">Created by</p>
              <p className="text-sm font-semibold text-text-main">{issue.customerName}</p>
              <p className="text-xs text-text-muted">Customer</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{ background: issue.assigneeId ? 'rgba(101,16,127,1)' : 'rgba(200,200,200,1)', color: 'white' }}
            >
              {issue.assigneeName?.[0] ?? '?'}
            </div>
            <div>
              <p className="text-xs text-text-muted">Assigned to</p>
              <p className="text-sm font-semibold text-text-main">
                {issue.assigneeName || 'Unassigned'}
              </p>
              <p className="text-xs text-text-muted">
                {issue.assigneeId ? 'Technician' : 'Role'}
              </p>
            </div>
          </div>
        </div>

        {/* Comments */}
        <div className="border-t border-border pt-6">
          <p className="text-sm font-semibold text-text-main mb-4">Comments</p>

          <div className="flex flex-col gap-4 mb-4 max-h-64 overflow-y-auto">
            {issue.comments?.length === 0 ? (
              <p className="text-sm text-text-muted">No comments yet</p>
            ) : (
              issue.comments?.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ background: 'rgba(101,16,127,1)' }}
                  >
                    {c.authorName?.[0] ?? 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="bg-gray-50 rounded-xl px-4 py-2 flex-1">
                        <p className="text-xs font-semibold text-primary">@{c.authorName}</p>
                        <p className="text-sm text-text-main mt-0.5">{c.body}</p>
                      </div>
                      <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                        <span className="text-xs text-text-muted">
                          {new Date(c.createdAt).toLocaleDateString('en-GB')}
                        </span>
                        {c.authorId === user?.id && (
                          <Dropdown
                            menu={{
                              items: [
                                { key: 'delete', label: 'Delete', danger: true,
                                  onClick: () => setDeleteCommentTarget(c) },
                              ],
                            }}
                            trigger={['click']}
                          >
                            <button className="text-text-muted hover:text-text-main ml-1">
                              <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                                <circle cx="12" cy="5"  r="1.5" />
                                <circle cx="12" cy="12" r="1.5" />
                                <circle cx="12" cy="19" r="1.5" />
                              </svg>
                            </button>
                          </Dropdown>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-1 ml-2">
                      <button className="text-xs text-text-muted hover:text-primary">↩ Reply</button>
                      <button className="text-xs text-text-muted hover:text-primary">♡ Like</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Comment input */}
          <div className="flex items-center gap-3 border border-border rounded-xl px-4 py-2">
            <input
              className="flex-1 outline-none text-sm text-text-main bg-transparent"
              placeholder="Leave a comment; use @ to tag technician"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleComment()}
            />
            <button
              onClick={handleComment}
              disabled={sending || !comment.trim()}
              className="text-primary hover:text-primary-hover disabled:opacity-40 transition-colors"
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Comment Modal */}
      <Modal
        open={!!deleteCommentTarget}
        onCancel={() => setDeleteCommentTarget(null)}
        footer={null} centered width={400}
        title={<span className="font-bold text-text-main">Delete Comment</span>}
      >
        <div className="py-4">
          <p className="text-center text-text-main mb-6">
            Are you sure you want to delete comment?
          </p>
          <div className="flex gap-3">
            <Button size="large" onClick={() => setDeleteCommentTarget(null)}
              className="flex-1 h-11 rounded-xl font-semibold">No</Button>
            <Button danger type="primary" size="large"
              onClick={() => { message.info('Coming soon'); setDeleteCommentTarget(null); }}
              className="flex-1 h-11 rounded-xl font-semibold">Yes</Button>
          </div>
        </div>
      </Modal>

      {/* Send Another Report Modal — reuse */}
      <Modal
        open={reportModal}
        onCancel={() => setReportModal(false)}
        footer={null} centered width={400}
        title={<span className="font-bold text-text-main">Send Report</span>}
      >
        <div className="py-4">
          <p className="text-center text-text-main mb-6">
            Go to Issues page to send a new report.
          </p>
          <Button type="primary" size="large" block
            onClick={() => { setReportModal(false); navigate(LINKS.CUSTOMER_ISSUES); }}
            className="h-11 rounded-xl font-semibold"
            style={{ background: 'rgba(101,16,127,1)', border: 'none' }}>
            Go to Issues
          </Button>
        </div>
      </Modal>
    </div>
  );
}
