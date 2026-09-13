import React from 'react';
import Card from '../../../components/ui/Card';
import { useDashboard } from '../hooks/useDashboard';

interface ChartCardProps {
  title: string;
  dataKey: string;
  color: string;
}

const ChartCard: React.FC<ChartCardProps> = ({ title }) => {
  const { data, isLoading, error } = useDashboard();

  if (isLoading) return <Card title={title}>Loading...</Card>;
  if (error) return <Card title={title}>Error loading data</Card>;

  return <Card title={title}><div className="text-sm text-slate-500">Chart not available in this build</div></Card>;
};

export default ChartCard;