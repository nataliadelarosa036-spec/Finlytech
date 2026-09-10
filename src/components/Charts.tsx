import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  Tooltip, CartesianGrid, BarChart, Bar, Cell,
  LineChart, Line, PieChart, Pie,
} from 'recharts';
import { formatCurrency, formatCompact } from '@/utils/format';

/* ── Shared styles ────────────────────────────────────────────────────────── */
const axis = { fontSize: 11, fill: '#7d8faf', fontFamily: 'Inter, system-ui, sans-serif' };

const tooltip = {
  backgroundColor: '#141a2e',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 14,
  padding: '10px 14px',
  fontSize: 12,
  color: '#e8ecf5',
  boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
};

const grid = (dark?: boolean) => dark ? '#1f2840' : '#e8ecf5';

/* ── NetWorthChart ────────────────────────────────────────────────────────── */
interface NetWorthChartProps {
  data: { date: string; net: number; assets: number; liabilities: number }[];
  dark?: boolean;
}

export function NetWorthChart({ data, dark }: NetWorthChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center text-ink-400">
        <p className="text-xs">Sin historial de patrimonio disponible</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 10, right: 4, left: 4, bottom: 0 }}>
        <defs>
          <linearGradient id="gradNet" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D4AF37" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#D4AF37" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={grid(dark)} vertical={false} />
        <XAxis dataKey="date" tick={axis} axisLine={false} tickLine={false} />
        <YAxis tick={axis} axisLine={false} tickLine={false} tickFormatter={(v: number) => formatCompact(v)} width={52} />
        <Tooltip
          contentStyle={tooltip}
          formatter={(v: number) => [formatCurrency(v), 'Patrimonio']}
          labelStyle={{ color: '#7d8faf', marginBottom: 4 }}
          cursor={{ stroke: 'rgba(212,175,55,0.2)', strokeWidth: 1 }}
        />
        <Area
          type="monotone"
          dataKey="net"
          stroke="#D4AF37"
          strokeWidth={2.5}
          fill="url(#gradNet)"
          dot={false}
          activeDot={{ r: 5, fill: '#D4AF37', stroke: '#fff', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* ── SpendingChart ────────────────────────────────────────────────────────── */
interface SpendingChartProps {
  data: { category: { name: string; color: string }; amount: number }[];
  dark?: boolean;
}

export function SpendingChart({ data, dark }: SpendingChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center text-ink-400">
        <p className="text-xs">No hay gastos registrados este mes</p>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name: d.category.name,
    amount: d.amount,
    color: d.category.color,
  }));

  return (
    <ResponsiveContainer width="100%" height={Math.max(160, chartData.length * 36)}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 8, left: 4, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={grid(dark)} horizontal={false} />
        <XAxis type="number" tick={axis} axisLine={false} tickLine={false} tickFormatter={(v: number) => formatCompact(v)} />
        <YAxis type="category" dataKey="name" tick={axis} axisLine={false} tickLine={false} width={84} />
        <Tooltip
          contentStyle={tooltip}
          formatter={(v: number) => [formatCurrency(v), 'Gasto']}
          labelStyle={{ color: '#7d8faf' }}
          cursor={{ fill: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }}
        />
        <Bar dataKey="amount" radius={[0, 8, 8, 0]} barSize={14}>
          {chartData.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ── ProjectionChart ──────────────────────────────────────────────────────── */
interface ProjectionChartProps {
  data: { month: number; current: number; simulated: number }[];
  dark?: boolean;
}

export function ProjectionChart({ data, dark }: ProjectionChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center text-ink-400">
        <p className="text-xs">Sin proyección disponible</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 10, right: 4, left: 4, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={grid(dark)} vertical={false} />
        <XAxis dataKey="month" tick={axis} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}m`} />
        <YAxis tick={axis} axisLine={false} tickLine={false} tickFormatter={(v: number) => formatCompact(v)} width={52} />
        <Tooltip
          contentStyle={tooltip}
          formatter={(v: number, name: string) => [formatCurrency(v), name === 'current' ? 'Actual' : 'Simulado']}
          labelStyle={{ color: '#7d8faf' }}
          labelFormatter={(v) => `Mes ${v}`}
          cursor={{ stroke: 'rgba(255,255,255,0.06)', strokeWidth: 1 }}
        />
        <Line
          type="monotone" dataKey="current"
          stroke="#566485" strokeWidth={2} dot={false} strokeDasharray="5 4"
        />
        <Line
          type="monotone" dataKey="simulated"
          stroke="#D4AF37" strokeWidth={2.5} dot={false}
          activeDot={{ r: 5, fill: '#D4AF37', stroke: '#fff', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

/* ── DonutChart ───────────────────────────────────────────────────────────── */
interface DonutChartProps {
  data: { name: string; value: number; color: string }[];
  size?: number;
  dark?: boolean;
}

export function DonutChart({ data, size = 160, dark }: DonutChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center text-ink-400">
        <p className="text-xs">Sin datos para distribuir</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={size}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={size * 0.30}
          outerRadius={size * 0.44}
          paddingAngle={3}
          stroke="none"
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={tooltip}
          formatter={(v: number) => formatCurrency(v)}
          labelStyle={{ color: '#7d8faf' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
