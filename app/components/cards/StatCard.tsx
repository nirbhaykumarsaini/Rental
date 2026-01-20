// components/ui/StatCard.tsx
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'up' | 'down';
}

export default function StatCard({ title, value, change, changeType }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-2">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
        <div className={`p-2 rounded-full ${changeType === 'up' ? 'bg-green-50' : 'bg-red-50'}`}>
          {changeType === 'up' ? (
            <TrendingUp className="w-5 h-5 text-green-500" />
          ) : (
            <TrendingDown className="w-5 h-5 text-red-500" />
          )}
        </div>
      </div>
      <div className={`flex items-center mt-4 text-sm ${changeType === 'up' ? 'text-green-600' : 'text-red-600'}`}>
        {changeType === 'up' ? (
          <TrendingUp className="w-4 h-4 mr-1" />
        ) : (
          <TrendingDown className="w-4 h-4 mr-1" />
        )}
        <span>{change}</span>
      </div>
    </div>
  );
}