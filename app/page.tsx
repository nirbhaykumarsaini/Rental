// app/page.tsx
import StatCard from '@/app/components/cards/StatCard';
import DealsTable from '@/app/components/table/DealsTable';
import SalesChart from '@/app/components/charts/SalesChart';
import {
  MoreVertical,
} from 'lucide-react';


export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <main className="flex-1">

        <div>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total User"
              value="40,689"
              change="8.5% Up from yesterday"
              changeType="up"
            />
            <StatCard
              title="Total Order"
              value="10,293"
              change="1.3% Up from past week"
              changeType="up"
            />
            <StatCard
              title="Total Sales"
              value="$89,000"
              change="4.3% Down from yesterday"
              changeType="down"
            />
            <StatCard
              title="Total Pending"
              value="2,040"
              change="1.8% Up from yesterday"
              changeType="up"
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
                <p className="text-3xl font-bold text-gray-900">$64,366.77</p>
              </div>

              <SalesChart />
            </div>

            {/* Recent Activity or Additional Info Card */}
            <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex items-start">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">New order received</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Deals Table */}
          <div className="mt-6 bg-white rounded-xl shadow border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Deals Details</h3>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View All
              </button>
            </div>

            <DealsTable />
          </div>
        </div>
      </main>
    </div>
  );
}