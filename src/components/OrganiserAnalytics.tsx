import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TrendingUp, Users, DollarSign, Calendar, Filter, Sparkles, ArrowUpRight } from 'lucide-react';
import { EntebbeEvent } from '../types';

interface OrganiserAnalyticsProps {
  events: EntebbeEvent[];
  totalTicketsSold: number;
}

// 7-day daily ticket sales and revenue growth data for Entebbe events
const DAILY_GROWTH_DATA_7D = [
  { day: 'Mon', date: 'Oct 27', tickets: 28, revenueUGX: 980000, vip: 4, regular: 24 },
  { day: 'Tue', date: 'Oct 28', tickets: 45, revenueUGX: 1575000, vip: 8, regular: 37 },
  { day: 'Wed', date: 'Oct 29', tickets: 62, revenueUGX: 2170000, vip: 12, regular: 50 },
  { day: 'Thu', date: 'Oct 30', tickets: 88, revenueUGX: 3080000, vip: 20, regular: 68 },
  { day: 'Fri', date: 'Oct 31', tickets: 142, revenueUGX: 4970000, vip: 38, regular: 104 },
  { day: 'Sat', date: 'Nov 01', tickets: 210, revenueUGX: 7350000, vip: 55, regular: 155 },
  { day: 'Sun', date: 'Nov 02', tickets: 165, revenueUGX: 5775000, vip: 40, regular: 125 },
];

const DAILY_GROWTH_DATA_30D = [
  { day: 'W1', date: 'Oct 05-11', tickets: 240, revenueUGX: 8400000, vip: 50, regular: 190 },
  { day: 'W2', date: 'Oct 12-18', tickets: 360, revenueUGX: 12600000, vip: 85, regular: 275 },
  { day: 'W3', date: 'Oct 19-25', tickets: 490, revenueUGX: 17150000, vip: 110, regular: 380 },
  { day: 'W4', date: 'Oct 26-Nov 02', tickets: 740, revenueUGX: 25900000, vip: 177, regular: 563 },
];

const EVENT_SALES_COMPARISON = [
  { name: 'Entebbe Quiz', venue: 'Riders Kitoro', tickets: 148, revenueUGX: 2960000, fill: '#FF2D55' },
  { name: 'Lakeside Jazz', venue: 'Waterfront Beach', tickets: 310, revenueUGX: 15500000, fill: '#FFCC00' },
  { name: 'Aero Beach Rave', venue: 'Aero Beach', tickets: 520, revenueUGX: 18200000, fill: '#007AFF' },
  { name: 'Botanical Roast', venue: 'Botanical Gardens', tickets: 690, revenueUGX: 37950000, fill: '#34C759' },
  { name: 'Nakiwogo Cruise', venue: 'Nakiwogo Pier', tickets: 180, revenueUGX: 15300000, fill: '#AF52DE' },
];

// Custom Dark Glassmorphism Tooltip for Recharts
const CustomAreaTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-3 rounded-xl bg-[#16161f]/95 border border-white/15 backdrop-blur-md shadow-2xl text-left font-sans">
        <p className="text-xs font-bold text-white mb-1">
          {label} · <span className="text-white/50">{data.date}</span>
        </p>
        <div className="space-y-1 text-xs">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[#FF2D55] font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#FF2D55]" /> Total Tickets:
            </span>
            <span className="font-mono font-bold text-white">{data.tickets} passes</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[#FFCC00] font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#FFCC00]" /> Daily Revenue:
            </span>
            <span className="font-mono font-bold text-white">
              UGX {(data.revenueUGX / 1000000).toFixed(2)}M
            </span>
          </div>
          <div className="pt-1 mt-1 border-t border-white/10 flex items-center justify-between text-[11px] text-white/50">
            <span>VIP: {data.vip}</span>
            <span>Regular: {data.regular}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const CustomBarTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-3 rounded-xl bg-[#16161f]/95 border border-white/15 backdrop-blur-md shadow-2xl text-left font-sans">
        <p className="text-xs font-bold text-white">{data.name}</p>
        <p className="text-[11px] text-white/50 mb-2">{data.venue}</p>
        <div className="space-y-1 text-xs font-mono">
          <p className="text-[#FF2D55] font-bold">Tickets: {data.tickets} sold</p>
          <p className="text-[#FFCC00] font-bold">
            Gross: UGX {data.revenueUGX.toLocaleString()}
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export const OrganiserAnalytics: React.FC<OrganiserAnalyticsProps> = ({
  events,
  totalTicketsSold,
}) => {
  const [timeframe, setTimeframe] = useState<'7d' | '30d'>('7d');
  const [metricView, setMetricView] = useState<'tickets' | 'revenue'>('tickets');

  const chartData = timeframe === '7d' ? DAILY_GROWTH_DATA_7D : DAILY_GROWTH_DATA_30D;

  // Aggregate stats
  const totalPeriodTickets = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.tickets, 0) + totalTicketsSold;
  }, [chartData, totalTicketsSold]);

  const totalPeriodRevenueUGX = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.revenueUGX, 0) + totalTicketsSold * 35000;
  }, [chartData, totalTicketsSold]);

  return (
    <div className="space-y-5 animate-fadeIn text-left">
      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Card 1: Tickets Sold */}
        <div className="p-4 rounded-2xl bg-[#0d0d12] border border-white/10 relative overflow-hidden group">
          <div className="flex items-center justify-between text-white/50 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Tickets Sold</span>
            <Users className="w-3.5 h-3.5 text-[#FF2D55]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">
              {totalPeriodTickets.toLocaleString()}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
            <ArrowUpRight className="w-3 h-3" />
            <span>+24.8% growth</span>
          </div>
        </div>

        {/* Card 2: Gross Revenue */}
        <div className="p-4 rounded-2xl bg-[#0d0d12] border border-white/10 relative overflow-hidden group">
          <div className="flex items-center justify-between text-white/50 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Gross Revenue</span>
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-emerald-400 font-mono">
              UGX {(totalPeriodRevenueUGX / 1000000).toFixed(1)}M
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
            <ArrowUpRight className="w-3 h-3" />
            <span>+31.2% WoW</span>
          </div>
        </div>

        {/* Card 3: Avg Ticket Price */}
        <div className="p-4 rounded-2xl bg-[#0d0d12] border border-white/10">
          <div className="flex items-center justify-between text-white/50 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Avg Ticket</span>
            <TrendingUp className="w-3.5 h-3.5 text-[#FFCC00]" />
          </div>
          <div className="text-xl font-black text-white font-mono">UGX 35,000</div>
          <div className="mt-1 text-[11px] text-white/50 font-medium">VIP uptake: 28%</div>
        </div>

        {/* Card 4: Gate Check-in Rate */}
        <div className="p-4 rounded-2xl bg-[#0d0d12] border border-white/10">
          <div className="flex items-center justify-between text-white/50 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Scan Rate</span>
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-[#FFCC00] font-mono">94.6%</div>
          <div className="mt-1 text-[11px] text-emerald-400 font-semibold">Fast door flow</div>
        </div>
      </div>

      {/* Primary Chart: Daily Growth Trends using Recharts */}
      <div className="p-4 md:p-5 rounded-2xl bg-[#0d0d12] border border-white/10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#FF2D55]" />
              Daily Growth Trends (Ticket Sales &amp; Revenue)
            </h4>
            <p className="text-xs text-white/50 mt-0.5">
              Daily ticket sales trajectory leading into Entebbe weekend lakeshore events
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            {/* Metric Switch */}
            <div className="flex items-center p-0.5 rounded-xl bg-[#16161f] border border-white/5 text-[11px]">
              <button
                onClick={() => setMetricView('tickets')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  metricView === 'tickets' ? 'bg-[#FF2D55] text-white shadow' : 'text-white/50'
                }`}
              >
                Tickets
              </button>
              <button
                onClick={() => setMetricView('revenue')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  metricView === 'revenue' ? 'bg-[#FFCC00] text-black shadow' : 'text-white/50'
                }`}
              >
                Revenue
              </button>
            </div>

            {/* Timeframe Filter */}
            <div className="flex items-center p-0.5 rounded-xl bg-[#16161f] border border-white/5 text-[11px]">
              <button
                onClick={() => setTimeframe('7d')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  timeframe === '7d' ? 'bg-white/20 text-white' : 'text-white/50'
                }`}
              >
                7 Days
              </button>
              <button
                onClick={() => setTimeframe('30d')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  timeframe === '30d' ? 'bg-white/20 text-white' : 'text-white/50'
                }`}
              >
                30 Days
              </button>
            </div>
          </div>
        </div>

        {/* Recharts AreaChart Container */}
        <div className="w-full h-64 md:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="ticketGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF2D55" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#FF2D55" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFCC00" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#FFCC00" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#252538" vertical={false} />

              <XAxis
                dataKey="day"
                stroke="#666680"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#252538' }}
              />

              <YAxis
                stroke="#666680"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) =>
                  metricView === 'tickets' ? `${value}` : `${(value / 1000000).toFixed(1)}M`
                }
              />

              <Tooltip content={<CustomAreaTooltip />} />

              {metricView === 'tickets' ? (
                <Area
                  type="monotone"
                  dataKey="tickets"
                  stroke="#FF2D55"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#ticketGradient)"
                  dot={{ r: 4, fill: '#FF2D55', strokeWidth: 2, stroke: '#FFFFFF' }}
                  activeDot={{ r: 6, fill: '#FFFFFF', stroke: '#FF2D55', strokeWidth: 3 }}
                />
              ) : (
                <Area
                  type="monotone"
                  dataKey="revenueUGX"
                  stroke="#FFCC00"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#revenueGradient)"
                  dot={{ r: 4, fill: '#FFCC00', strokeWidth: 2, stroke: '#FFFFFF' }}
                  activeDot={{ r: 6, fill: '#FFFFFF', stroke: '#FFCC00', strokeWidth: 3 }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Secondary Chart: Entebbe Events Sales Comparison BarChart */}
      <div className="p-4 md:p-5 rounded-2xl bg-[#0d0d12] border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-sm font-bold text-white">Entebbe Event Ticket Sales Benchmark</h4>
            <p className="text-xs text-white/50">Cumulative passes sold per major Entebbe production</p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-white/60">
            Total 1,848 Passes
          </span>
        </div>

        <div className="w-full h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={EVENT_SALES_COMPARISON}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#252538" horizontal={false} />
              <XAxis
                type="number"
                stroke="#666680"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: '#252538' }}
              />
              <YAxis
                dataKey="name"
                type="category"
                stroke="#ffffff"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={100}
              />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar dataKey="tickets" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
