import { useEffect, useState } from 'react';
import { Spin, Select, message } from 'antd';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from 'recharts';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../store/auth.store';
import { dashboardService } from '../../services/dashboard.service';

interface Stat {
  value:  number;
  change: number;
}

interface DashboardData {
  stats: {
    verifiedCustomers: Stat;
    newCustomers:      Stat;
    openTickets:       Stat;
    subAdmins:         Stat;
  };
  revenueAnalytics: { month: string; success: number; pending: number; failed: number }[];
  customerActivity: { month: string; value: number }[];
  topLocations:     { country: string; value: number; color: string }[];
}

const StatCard = ({
  title,
  value,
  change,
}: {
  title:  string;
  value:  number;
  change: number;
}) => {
  const isPositive = change >= 0;
  return (
    <div className="bg-white rounded-2xl p-6 flex flex-col gap-3 shadow-sm border border-border">
      <p className="text-xs font-semibold text-text-muted uppercase tracking-widest">{title}</p>
      <div className="flex items-center justify-between">
        <span className="text-4xl font-bold text-text-main">
          {value.toLocaleString()}
        </span>
        <span className={`flex items-center gap-1 text-sm font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
          {Math.abs(change).toFixed(2)}
        </span>
      </div>
      <button className="text-sm font-medium text-primary flex items-center gap-1 hover:gap-2 transition-all w-fit">
        View
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  );
};

const RADIAN = Math.PI / 180;
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, value }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return value > 15 ? (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {name}
    </text>
  ) : null;
};

export default function AdminDashboard() {
  const { user }  = useAuthStore();
  const [data, setData]       = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.getAdminStats()
      .then(setData)
      .catch(() => message.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <Spin size="large" />
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-text-main">
          Hello {user?.firstName} 👋
        </h1>
        <p className="text-text-muted text-sm mt-1">Here's an overview of your profile</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Verified Customers"
          value={data?.stats.verifiedCustomers.value ?? 0}
          change={data?.stats.verifiedCustomers.change ?? 0}
        />
        <StatCard
          title="New Customers"
          value={data?.stats.newCustomers.value ?? 0}
          change={data?.stats.newCustomers.change ?? 0}
        />
        <StatCard
          title="Open Tickets"
          value={data?.stats.openTickets.value ?? 0}
          change={data?.stats.openTickets.change ?? 0}
        />
        <StatCard
          title="EMPLOYEES"
          value={data?.stats.subAdmins.value ?? 0}
          change={data?.stats.subAdmins.change ?? 0}
        />
      </div>

      {/* Revenue Analytics */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-bold text-text-main">Revenue Analytics</h2>
          <Select defaultValue="year" size="small" style={{ width: 100 }}>
            <Select.Option value="year">Year</Select.Option>
            <Select.Option value="month">Month</Select.Option>
            <Select.Option value="week">Week</Select.Option>
          </Select>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data?.revenueAnalytics ?? []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 12 }} axisLine={false} tickLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="success" stroke="rgba(34,197,94,1)"   strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
            <Line type="monotone" dataKey="pending" stroke="rgba(234,179,8,1)"   strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
            <Line type="monotone" dataKey="failed"  stroke="rgba(239,68,68,1)"   strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-bold text-text-main">Customer Activity</h2>
            <Select defaultValue="year" size="small" style={{ width: 100 }}>
              <Select.Option value="year">Year</Select.Option>
              <Select.Option value="month">Month</Select.Option>
            </Select>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data?.customerActivity ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip formatter={(v) => [Number(v).toLocaleString(), 'Customers']} />
              <Bar dataKey="value" fill="rgba(101,16,127,0.5)" radius={[4,4,0,0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Customer Locations */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-bold text-text-main">Top Customer Locations</h2>
            <Select defaultValue="year" size="small" style={{ width: 100 }}>
              <Select.Option value="year">Year</Select.Option>
              <Select.Option value="month">Month</Select.Option>
            </Select>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie
                    data={data?.topLocations ?? []}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    nameKey="country"
                    labelLine={false}
                    label={renderCustomLabel}
                  >
                    {(data?.topLocations ?? []).map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-xs text-text-muted">Customers</p>
                <p className="text-base font-bold text-text-main">45,201</p>
              </div>
            </div>
            <div className="flex flex-col gap-2 flex-1">
              {(data?.topLocations ?? []).map((loc, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: loc.color }} />
                    <span className="text-sm text-text-muted">{loc.country}</span>
                  </div>
                  <span className="text-sm font-medium text-text-main">{loc.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
