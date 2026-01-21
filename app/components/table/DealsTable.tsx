// components/DealsTable.tsx
import { MoreVertical } from 'lucide-react';

const deals = [
  {
    productName: 'Apple Watch',
    location: '6096 Marjolaine Landing',
    dateTime: '12.09.2019 - 12.53 PM',
    piece: 423,
    amount: '₹34,295',
    status: 'Delivered'
  },
  {
    productName: 'iPhone 13 Pro',
    location: '123 Main Street',
    dateTime: '15.09.2019 - 10.30 AM',
    piece: 215,
    amount: '₹25,800',
    status: 'Processing'
  },
  {
    productName: 'MacBook Pro',
    location: '456 Tech Park',
    dateTime: '18.09.2019 - 03.15 PM',
    piece: 89,
    amount: '₹58,420',
    status: 'Delivered'
  },
  {
    productName: 'AirPods Pro',
    location: '789 Shopping Mall',
    dateTime: '20.09.2019 - 09.45 AM',
    piece: 540,
    amount: '₹16,200',
    status: 'Pending'
  },
];

export default function DealsTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Product Name</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Location</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date - Time</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Piece</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Amount</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Action</th>
          </tr>
        </thead>
        <tbody>
          {deals.map((deal, index) => (
            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-4 px-4 text-sm font-medium text-gray-900">{deal.productName}</td>
              <td className="py-4 px-4 text-sm text-gray-600">{deal.location}</td>
              <td className="py-4 px-4 text-sm text-gray-600">{deal.dateTime}</td>
              <td className="py-4 px-4 text-sm text-gray-600">{deal.piece}</td>
              <td className="py-4 px-4 text-sm font-medium text-gray-900">{deal.amount}</td>
              <td className="py-4 px-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  deal.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                  deal.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {deal.status}
                </span>
              </td>
              <td className="py-4 px-4">
                <button className="p-1 hover:bg-gray-100 rounded">
                  <MoreVertical className="w-5 h-5 text-gray-500" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}