import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Modal, Spin, message, Input, Checkbox } from 'antd';
import { issuesService } from '../../services/issues.service';
import { LINKS } from '../../lib/links';

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

interface Comment {
  id:         string;
  body:       string;
  authorName: string;
  createdAt:  string;
}

interface Employee {
  id:     string;
  name:   string;
  role:   string;
  avatar: string | null;
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending:     { bg: 'rgba(234,179,8,0.1)',  color: 'rgba(161,98,7,1)'   },
  in_progress: { bg: 'rgba(59,130,246,0.1)', color: 'rgba(29,78,216,1)'  },
  resolved:    { bg: 'rgba(34,197,94,0.1)',  color: 'rgba(21,128,61,1)'  },
  failed:      { bg: 'rgba(239,68,68,0.1)',  color: 'rgba(185,28,28,1)'  },
};

export default function IssueDetailPage() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [issue, setIssue]             = useState<Issue | null>(null);
  const [loading, setLoading]         = useState(true);
  const [assignModal, setAssignModal] = useState(false);
  const [employees, setEmployees]     = useState<Employee[]>([]);
  const [selected, setSelected]       = useState<string[]>([]);
  const [empSearch, setEmpSearch]     = useState('');
  const [comment, setComment]         = useState('');
  const [sending, setSending]         = useState(false);
  const [assigning, setAssigning]     = useState(false);
  const commentRef = useRef<HTMLDivElement>(null);

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

  const openAssignModal = async () => {
    const emps = await issuesService.getEmployees();
    setEmployees(emps);
    if (issue?.assigneeId) setSelected([issue.assigneeId]);
    setAssignModal(true);
  };

  const handleAssign = async () => {
    if (!id || selected.length === 0) return;
    try {
      setAssigning(true);
      await issuesService.assignTicket(id, selected[0]);
      message.success('Ticket assigned');
      setAssignModal(false);
      fetchIssue();
    } catch {
      message.error('Failed to assign ticket');
    } finally {
      setAssigning(false);
    }
  };

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
  const filteredEmps = employees.filter(
    (e) => e.name.toLowerCase().includes(empSearch.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center h-full"><Spin size="large" /></div>
  );
  if (!issue) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb + assign */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <button onClick={() => navigate(LINKS.ADMIN_CRM)}
            className="font-semibold text-primary hover:underline">CRM</button>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={2} className="text-text-muted">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
          </svg>
          <span className="text-text-muted">Issue Details</span>
        </div>
        <Button
          type="primary"
          size="large"
          onClick={openAssignModal}
          className="rounded-xl font-semibold h-11 px-6"
          style={{ background: 'rgba(101,16,127,1)', border: 'none' }}
        >
          Assign Ticket
        </Button>
      </div>

      {/* Issue card */}
      <div className="bg-white rounded-2xl border border-border p-8">
        {/* Status */}
        <div className="mb-4">
          <span
            className="text-xs font-bold px-3 py-1 rounded-full"
            style={{ background: statusStyle.bg, color: statusStyle.color }}
          >
            #{issue.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        <h2 className="text-lg font-bold text-text-main mb-4">{issue.topic}</h2>
        <p className="text-text-main leading-relaxed mb-8">{issue.description}</p>

        <div className="grid grid-cols-2 gap-6 border-t border-border pt-6">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              style={{ background: 'rgba(101,16,127,0.15)', color: 'rgba(101,16,127,1)' }}
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
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              style={{ background: issue.assigneeId ? 'rgba(101,16,127,1)' : 'rgba(200,200,200,1)' }}
            >
              {issue.assigneeName?.[0] ?? '?'}
            </div>
            <div>
              <p className="text-xs text-text-muted">Assigned to</p>
              <p className="text-sm font-semibold text-text-main">
                {issue.assigneeName || 'Unassigned'}
              </p>
              <p className="text-xs text-text-muted">
                {issue.assigneeId ? 'Employee' : 'Role'}
              </p>
            </div>
          </div>
        </div>

        {/* Comments */}
        <div className="mt-8 border-t border-border pt-6">
          <p className="text-sm font-semibold text-text-main mb-4">Comments</p>
          <div ref={commentRef} className="flex flex-col gap-3 mb-4 max-h-48 overflow-y-auto">
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
                  <div className="flex-1 bg-gray-50 rounded-xl px-4 py-2">
                    <p className="text-xs font-semibold text-text-main">{c.authorName}</p>
                    <p className="text-sm text-text-main mt-0.5">{c.body}</p>
                    <p className="text-xs text-text-muted mt-1">
                      {new Date(c.createdAt).toLocaleDateString('en-GB')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

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

      {/* Assign Ticket Modal */}
      <Modal
        open={assignModal}
        onCancel={() => setAssignModal(false)}
        footer={null}
        centered
        width={480}
        title={
          <div>
            <p className="font-bold text-text-main">Assign Ticket</p>
            <p className="text-sm text-text-muted font-normal">Choose an employee to assign a ticket</p>
          </div>
        }
      >
        <div className="mt-4">
          <Input
            prefix={
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" strokeWidth={2} className="text-text-muted">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
            placeholder="Search for a technician"
            value={empSearch}
            onChange={(e) => setEmpSearch(e.target.value)}
            className="rounded-xl mb-3"
            size="large"
          />

          {/* Selected tags */}
          {selected.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {selected.map((sid) => {
                const emp = employees.find((e) => e.id === sid);
                return emp ? (
                  <span
                    key={sid}
                    className="flex items-center gap-1 text-xs px-3 py-1 rounded-full border border-primary text-primary"
                  >
                    {emp.name}
                    <button onClick={() => setSelected((s) => s.filter((x) => x !== sid))}>
                      <svg width="12" height="12" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ) : null;
              })}
            </div>
          )}

          {/* Employee list */}
          <div className="border border-border rounded-xl overflow-hidden max-h-64 overflow-y-auto">
            {filteredEmps.map((emp) => (
              <div
                key={emp.id}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-secondary transition-colors ${
                  selected.includes(emp.id) ? 'bg-secondary' : ''
                }`}
                onClick={() => {
                  setSelected(selected.includes(emp.id)
                    ? selected.filter((x) => x !== emp.id)
                    : [emp.id], // single select for now
                  );
                }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{ background: 'rgba(101,16,127,1)' }}
                >
                  {emp.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-text-main">{emp.name}</p>
                  <p className="text-xs text-text-muted">{emp.role}</p>
                </div>
                <Checkbox checked={selected.includes(emp.id)} />
              </div>
            ))}
            {filteredEmps.length === 0 && (
              <p className="text-center text-text-muted text-sm py-6">No employees found</p>
            )}
          </div>

          <div className="flex gap-3 mt-4">
            <Button size="large" onClick={() => setAssignModal(false)}
              className="flex-1 h-11 rounded-xl">Cancel</Button>
            <Button type="primary" size="large" loading={assigning}
              onClick={handleAssign}
              disabled={selected.length === 0}
              className="flex-1 h-11 rounded-xl font-semibold"
              style={{ background: 'rgba(101,16,127,1)', border: 'none' }}>
              Assign
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
