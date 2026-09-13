import React from 'react';
import {
  CartesianGrid,
  Line,
  LineChart as ReLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface LineChartProps {
  data: Array<{ [key: string]: any }>;
  xKey: string;
  yKey: string;
  width?: number;
  height?: number;
  lineColor?: string;
  strokeWidth?: number;
}

const LineChart: React.FC<LineChartProps> = ({
  data,
  xKey,
  yKey,
  width,
  height = 180,
  lineColor = '#2563eb',
  strokeWidth = 2,
}) => {
  const hasData = Array.isArray(data) && data.length >= 2;
  if (!hasData) return <div className="text-sm text-slate-500">Pas assez de données</div>;

  const nf = new Intl.NumberFormat('fr-FR');

  const chart = (
    <ResponsiveContainer width="100%" height={height}>
      <ReLineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
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
          cursor={{ stroke: '#e2e8f0', strokeDasharray: '4 4' }}
          formatter={(v: any) => (typeof v === 'number' ? nf.format(v) : String(v))}
        />
        <Line
          type="monotone"
          dataKey={yKey}
          stroke={lineColor}
          strokeWidth={strokeWidth}
          dot={false}
          activeDot={{ r: 4, fill: '#fff', strokeWidth: 2 }}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </ReLineChart>
    </ResponsiveContainer>
  );

  if (typeof width === 'number') {
    return (
      <div style={{ width }} role="img" aria-label={`line chart ${xKey} ${yKey}`}>
        {chart}
      </div>
    );
  }

  return <div role="img" aria-label={`line chart ${xKey} ${yKey}`}>{chart}</div>;
};

export default LineChart;