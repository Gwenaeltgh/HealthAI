import React from 'react';
import LineChart from './LineChart';

interface AreaChartProps {
  data: Array<{ [key: string]: any }>;
  dataKey: string;
  strokeColor: string;
  fillColor: string;
  title?: string;
}

const AreaChart: React.FC<AreaChartProps> = ({ data, dataKey, strokeColor, fillColor, title }) => {
  return (
    <div className="area-chart">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <div className="rounded bg-white">
        <LineChart data={data} xKey="name" yKey={dataKey} lineColor={strokeColor || fillColor} />
      </div>
    </div>
  );
};

export default AreaChart;