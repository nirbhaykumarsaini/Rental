// components/ui/StatCard.tsx
import { TrendingUp, TrendingDown, MoreVertical } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'up' | 'down';
  icon?: React.ReactNode;
  theme?: 'vibrant';
}

export default function StatCard({ title, value, change, changeType, icon }: StatCardProps) {
  const getGradient = () => {
    switch(title) {
      case 'Total Users':
        return 'from-blue-500 to-cyan-500';
      case 'Total Orders':
        return 'from-purple-500 to-pink-500';
      case 'Total Sales':
        return 'from-orange-500 to-red-500';
      case 'Pending':
        return 'from-yellow-500 to-orange-500';
      default:
        return 'from-orange-500 to-pink-500';
    }
  };

  return (
    <div className="bg-[#2A2A3C] rounded-xl border border-[#3A3A4C] p-6 hover:border-orange-500/50 transition-all duration-300 group relative overflow-hidden">      

      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-3">
            {icon && (
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${getGradient()} bg-opacity-20 flex items-center justify-center`}>
                <div className="text-white">{icon}</div>
              </div>
            )}
            <p className="text-sm font-medium text-gray-400">{title}</p>
          </div>
          <p className="text-2xl font-bold text-white mb-2">{value}</p>
          
          <div className={`flex items-center text-sm ${
            changeType === 'up' ? 'text-green-400' : 'text-red-400'
          } bg-${changeType === 'up' ? 'green' : 'red'}-500/10 px-3 py-1.5 rounded-lg inline-flex`}>
            {changeType === 'up' ? (
              <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 mr-1.5" />
            )}
            <span className="font-medium">{change}</span>
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${getGradient()} flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
            {changeType === 'up' ? (
              <TrendingUp className="w-5 h-5 text-white" />
            ) : (
              <TrendingDown className="w-5 h-5 text-white" />
            )}
          </div>
      
        </div>
      </div>
      
    </div>
  );
}