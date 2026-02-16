// app/page.tsx
"use client";

import { useEffect, useState } from 'react';
import StatCard from '@/app/components/cards/StatCard';
import SalesChart from '@/app/components/charts/SalesChart';
import { MoreVertical, RefreshCw, TrendingUp, Users, ShoppingBag, Clock, Award, Zap } from 'lucide-react';

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<any>(null);
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
      <div className="min-h-screen bg-[#1E1E2F] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#1E1E2F] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">Error</div>
          <p className="text-gray-400">{error}</p>
          <button
            onClick={refreshData}
            className="mt-4 px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all"
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
    <div className="min-h-screen ">
      <main className="p-6">
        {/* Header with refresh button */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-black">Dashboard Overview</h1>
            <p className="text-sm text-gray-400 mt-1">Welcome back, Admin</p>
          </div>
          
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={dashboardData.stats.totalUsers.toLocaleString()}
            change={dashboardData.changeStats.users.description}
            changeType={dashboardData.changeStats.users.changeType}
            icon={<Users className="w-5 h-5" />}
            theme="vibrant"
          />
          <StatCard
            title="Total Orders"
            value={dashboardData.stats.totalOrders.toLocaleString()}
            change={dashboardData.changeStats.orders.description}
            changeType={dashboardData.changeStats.orders.changeType}
            icon={<ShoppingBag className="w-5 h-5" />}
            theme="vibrant"
          />
          <StatCard
            title="Total Sales"
            value={`₹${dashboardData.stats.totalSales.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            change={dashboardData.changeStats.sales.description}
            changeType={dashboardData.changeStats.sales.changeType}
            icon={<TrendingUp className="w-5 h-5" />}
            theme="vibrant"
          />
          <StatCard
            title="Pending"
            value={dashboardData.stats.totalPending.toLocaleString()}
            change={dashboardData.changeStats.pending.description}
            changeType={dashboardData.changeStats.pending.changeType}
            icon={<Clock className="w-5 h-5" />}
            theme="vibrant"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sales Chart Card */}
          <div className="lg:col-span-2 bg-[#2A2A3C] rounded-xl border border-[#3A3A4C] p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Sales Details</h3>
              <button className="p-1 hover:bg-[#3A3A4C] rounded-lg transition-colors">
                <MoreVertical className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-3xl font-bold text-white">
                ₹{dashboardData.stats.salesDetails.totalAmount.toLocaleString('en-IN', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}
              </p>
              <p className="text-sm text-gray-400">Last 7 days</p>
            </div>

            <SalesChart chartData={dashboardData.stats.salesOverTime} theme="vibrant" />
          </div>

          {/* Recent Activity Card */}
          <div className="bg-[#2A2A3C] rounded-xl border border-[#3A3A4C] p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
              <Award className="w-5 h-5 text-orange-400" />
            </div>
            <div className="space-y-4">
              {dashboardData.stats.recentActivity.map((activity: any) => (
                <div key={activity.id} className="flex items-start p-3 bg-[#1E1E2F] rounded-xl border-l-4 border-l-orange-500">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                    activity.type === 'order' ? 'bg-orange-500/20' : 
                    activity.type === 'user' ? 'bg-pink-500/20' : 'bg-purple-500/20'
                  }`}>
                    <div className={`w-3 h-3 rounded-full ${
                      activity.type === 'order' ? 'bg-orange-400' : 
                      activity.type === 'user' ? 'bg-pink-400' : 'bg-purple-400'
                    }`}></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{activity.title}</p>
                    <p className="text-xs text-gray-400 mt-1">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
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