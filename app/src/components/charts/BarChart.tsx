import React from 'react';
import {
  Bar,
  BarChart as ReBarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface BarChartProps {
  data: Array<{ [key: string]: any }>;
  xKey: string;
  yKey: string;
  width?: number;
  height?: number;
  barColor?: string;
}

const BarChart: React.FC<BarChartProps> = ({
  data,
  xKey,
  yKey,
  height = 140,
  width,
  barColor = '#06b6d4',
}) => {
  const values = (Array.isArray(data) ? data : [])
    .map((d) => Number(d?.[yKey]))
    .filter((v) => Number.isFinite(v));

  if (!values.length) return <div className="text-sm text-slate-500">Pas de données</div>;

  const nf = new Intl.NumberFormat('fr-FR');

  const chart = (
    <ResponsiveContainer width="100%" height={height}>
      <ReBarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} width={32} />
        <Tooltip
          contentStyle={{
            borderRadius: 12,
            border: '1px solid rgba(226,232,240,0.8)',
            boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
          }}
          labelStyle={{ color: '#0f172a', fontWeight: 600 }}
          cursor={{ fill: 'rgba(148,163,184,0.12)' }}
          formatter={(v: any) => (typeof v === 'number' ? nf.format(v) : String(v))}
        />
        <Bar dataKey={yKey} fill={barColor} radius={[10, 10, 0, 0]} />
      </ReBarChart>
    </ResponsiveContainer>
  );

  if (typeof width === 'number') {
    return (
      <div style={{ width }} role="img" aria-label={`bar chart ${xKey} ${yKey}`}>
        {chart}
      </div>
    );
  }

  return (
    <div role="img" aria-label={`bar chart ${xKey} ${yKey}`}>
      {chart}
    </div>
  );
};

export default BarChart;