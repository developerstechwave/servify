import React, { useEffect, useState } from 'react';
import { Spin, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { dashboardService } from '../../services/dashboard.service';
import { LINKS } from '../../lib/links';

interface Stat  { value: number; label: string }
interface Ticket {
  id: string; topic: string; status: string;
  customerName: string; serviceName: string; createdAt: string;
}

const StatusTag = ({ status }: { status: string }) => {
  const map: Record<string, { color: string; bg: string; label: string }> = {
    pending:     { color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Pending'     },
    in_progress: { color: 'text-blue-600',   bg: 'bg-blue-50',   label: 'In Progress' },
    resolved:    { color: 'text-green-600',  bg: 'bg-green-50',  label: 'Resolved'    },
    failed:      { color: 'text-red-500',    bg: 'bg-red-50',    label: 'Failed'      },
  };
  const s = map[status] ?? map['pending'];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${s.color} ${s.bg}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {s.label}
    </span>
  );
};

export default function EmployeeDashboard() {
  const { user }  = useAuthStore();
  const navigate  = useNavigate();
  const [stats, setStats]     = useState<Record<string, Stat> | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.getEmployeeStats()
      .then((data) => {
        setStats(data.stats);
        setTickets(data.recentTickets);
      })
      .catch(() => message.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-full"><Spin size="large" /></div>
  );

  const statCards = [
    {
      key: 'total', color: 'rgba(101,16,127,0.1)', textColor: 'rgba(101,16,127,1)',
      icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
    },
    {
      key: 'pending', color: 'rgba(234,179,8,0.1)', textColor: 'rgba(161,98,7,1)',
      icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" /></svg>,
    },
    {
      key: 'inProgress', color: 'rgba(59,130,246,0.1)', textColor: 'rgba(29,78,216,1)',
      icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
    },
    {
      key: 'resolved', color: 'rgba(34,197,94,0.1)', textColor: 'rgba(21,128,61,1)',
      icon: <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-text-main">
          Hello {user?.firstName}
        </h1>
        <p className="text-text-muted text-sm mt-1">Here's an overview of your assigned tickets</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ key, icon, color, textColor }) => {
          const stat = stats?.[key];
          return (
            <div key={key} className="bg-white rounded-2xl p-5 border border-border shadow-sm">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: color }}
              >
                <span style={{ color: textColor }}>{icon as React.ReactNode}</span>
              </div>
              <p className="text-3xl font-bold" style={{ color: textColor }}>
                {stat?.value ?? 0}
              </p>
              <p className="text-xs font-semibold text-text-muted mt-1">{stat?.label}</p>
            </div>
          );
        })}
      </div>

      {/* Recent tickets */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-bold text-text-main">Recent Tickets</h2>
          <button
            onClick={() => navigate(LINKS.EMPLOYEE_MY_TICKETS)}
            className="text-sm font-medium text-primary hover:underline"
          >
            View all
          </button>
        </div>

        {tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <p className="text-sm font-semibold text-text-muted">No tickets assigned yet</p>
            <p className="text-xs text-text-muted">Tickets assigned to you will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => navigate(`${LINKS.EMPLOYEE_CRM}/${ticket.id}`)}
                className="flex items-center justify-between px-6 py-4 hover:bg-secondary cursor-pointer transition-colors"
              >
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold text-text-main">{ticket.topic}</p>
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <span>{ticket.customerName}</span>
                    {ticket.serviceName && (
                      <>
                        <span>•</span>
                        <span>{ticket.serviceName}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <StatusTag status={ticket.status} />
                  <span className="text-xs text-text-muted">
                    {new Date(ticket.createdAt).toLocaleDateString('en-GB', {
                      day: '2-digit', month: '2-digit', year: '2-digit',
                    })}
                  </span>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor" strokeWidth={2} className="text-text-muted">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
