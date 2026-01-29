// app/page.tsx
"use client";

import { useEffect, useState } from 'react';
import StatCard from '@/app/components/cards/StatCard';
import SalesChart from '@/app/components/charts/SalesChart';
import { MoreVertical } from 'lucide-react';

interface DashboardData {
  stats: {
    totalUsers: number;
    totalOrders: number;
    totalSales: number;
    totalPending: number;
    salesDetails: {
      totalAmount: number;
      chartData: Array<{
        date: string;
        amount: number;
      }>;
    };
    recentActivity: Array<{
      id: string;
      type: string;
      title: string;
      description: string;
      timestamp: string;
    }>;
    salesOverTime: any;
  };
  changeStats: {
    users: any;
    orders: any;
    sales: any;
    pending: any;
  };
}

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/dashboard-stats');
      const data = await response.json();
      
      if (data.status) {
        setDashboardData(data.data);
      } else {
        setError(data.message || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      setError('Error fetching dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="max-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Error</div>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={refreshData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  return (
    <div className="max-h-screen bg-gray-50 flex">
      <main className="flex-1 p-6">
        {/* Header with refresh button */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total User"
            value={dashboardData.stats.totalUsers.toLocaleString()}
            change={dashboardData.changeStats.users.description}
            changeType={dashboardData.changeStats.users.changeType}
          />
          <StatCard
            title="Total Order"
            value={dashboardData.stats.totalOrders.toLocaleString()}
            change={dashboardData.changeStats.orders.description}
            changeType={dashboardData.changeStats.orders.changeType}
          />
          <StatCard
            title="Total Sales"
            value={`₹${dashboardData.stats.totalSales.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            change={dashboardData.changeStats.sales.description}
            changeType={dashboardData.changeStats.sales.changeType}
          />
          <StatCard
            title="Total Pending"
            value={dashboardData.stats.totalPending.toLocaleString()}
            change={dashboardData.changeStats.pending.description}
            changeType={dashboardData.changeStats.pending.changeType}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sales Chart Card */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Sales Details</h3>
              <button className="p-1 hover:bg-gray-100 rounded">
                <MoreVertical className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-3xl font-bold text-gray-900">
                ₹{dashboardData.stats.salesDetails.totalAmount.toLocaleString('en-IN', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}
              </p>
              <p className="text-sm text-gray-500">Last 7 days</p>
            </div>

            <SalesChart chartData={dashboardData.stats.salesOverTime} />
          </div>

          {/* Recent Activity Card */}
          <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {dashboardData.stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                    activity.type === 'order' ? 'bg-blue-100' : 
                    activity.type === 'user' ? 'bg-green-100' : 'bg-purple-100'
                  }`}>
                    <div className={`w-4 h-4 rounded-full ${
                      activity.type === 'order' ? 'bg-blue-500' : 
                      activity.type === 'user' ? 'bg-green-500' : 'bg-purple-500'
                    }`}></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-xs text-gray-500">{activity.description}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(activity.timestamp).toLocaleString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}