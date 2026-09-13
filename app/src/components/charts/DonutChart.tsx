import React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface DonutChartProps {
  data: { name: string; value: number }[];
  colors: string[];
  size?: number;
}

const DonutChart: React.FC<DonutChartProps> = ({ data, colors, size = 160 }) => {
  return (
    <div style={{ width: size, height: size }} role="img" aria-label="donut chart">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="86%" paddingAngle={2}>
            {data.map((_, index) => (
              <Cell key={index} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: '1px solid rgba(226,232,240,0.8)',
              boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
            }}
            labelStyle={{ color: '#0f172a', fontWeight: 600 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DonutChart;