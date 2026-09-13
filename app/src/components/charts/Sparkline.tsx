import React from 'react';
import { Line, LineChart as ReLineChart, ResponsiveContainer } from 'recharts';

interface SparklineProps {
  data: Array<{ name: string; value: number }>;
  width?: number;
  height?: number;
  strokeColor?: string;
}

const Sparkline: React.FC<SparklineProps> = ({
  data,
  width = 100,
  height = 40,
  strokeColor = '#06b6d4',
}) => {
  if (!data?.length) return null;
  return (
    <div style={{ width, height }} aria-label="sparkline">
      <ResponsiveContainer width="100%" height="100%">
        <ReLineChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <Line type="monotone" dataKey="value" stroke={strokeColor} strokeWidth={2} dot={false} strokeLinecap="round" />
        </ReLineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Sparkline;