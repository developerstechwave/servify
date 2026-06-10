import { useEffect, useState } from 'react';
import { Spin, Select, message } from 'antd';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { useAuthStore } from '../../store/auth.store';
import { dashboardService } from '../../services/dashboard.service';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

interface Stat {
  value: number;
  change: number;
}

interface DashboardData {
  stats: {
    totalOrganisations: Stat;
    totalCustomers:     Stat;
    totalEmployees:     Stat;
  };
  revenueAnalytics: { month: string; value: number }[];
  customerActivity: { month: string; value: number }[];
}

const StatCard = ({
  title,
  value,
  change,
  showView,
}: {
  title: string;
  value: number;
  change: number;
  showView?: boolean;
}) => {
  const isPositive = change >= 0;
  return (
    <div className="bg-white rounded-2xl p-6 flex flex-col gap-3 shadow-sm border border-border">
      <p className="text-xs font-semibold text-text-muted uppercase tracking-widest">
        {title}
      </p>
      <div className="flex items-center justify-between">
        <span className="text-4xl font-bold text-text-main">
          {value.toLocaleString()}
        </span>
        <span className={`flex items-center gap-1 text-sm font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive
            ? <ArrowUpOutlined />
            : <ArrowDownOutlined />
          }
          {Math.abs(change).toFixed(2)}
        </span>
      </div>
      {showView && (
        <button className="text-sm font-medium text-primary flex items-center gap-1 hover:gap-2 transition-all w-fit">
          View
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default function SuperAdminDashboard() {
  const { user } = useAuthStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.getSuperAdminStats()
      .then(setData)
      .catch(() => message.error('Failed to load dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-text-main">
          Hello {user?.firstName} 👋
        </h1>
        <p className="text-text-muted text-sm mt-1">
          Here's an overview of your platform
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Organizations"
          value={data?.stats.totalOrganisations.value ?? 0}
          change={data?.stats.totalOrganisations.change ?? 0}
          showView
        />
        <StatCard
          title="Total Customers"
          value={data?.stats.totalCustomers.value ?? 0}
          change={data?.stats.totalCustomers.change ?? 0}
        />
        <StatCard
          title="Total Employees"
          value={data?.stats.totalEmployees.value ?? 0}
          change={data?.stats.totalEmployees.change ?? 0}
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
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, 'Revenue']} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="rgba(101,16,127,1)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Customer Activity */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-bold text-text-main">Customer Activity</h2>
          <Select defaultValue="year" size="small" style={{ width: 100 }}>
            <Select.Option value="year">Year</Select.Option>
            <Select.Option value="month">Month</Select.Option>
            <Select.Option value="week">Week</Select.Option>
          </Select>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data?.customerActivity ?? []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip formatter={(v: number) => [v.toLocaleString(), 'Customers']} />
            <Bar
              dataKey="value"
              fill="rgba(101,16,127,1)"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
