// components/SalesChart.tsx
'use client';

import { useState, useEffect } from 'react';

export default function SalesChart() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const yAxisLabels = ['0%', '20%', '40%', '60%', '80%', '100%'];
  const xAxisLabels = ['5k', '10k', '15k', '20k', '25k', '30k', '35k', '40k', '45k', '50k', '55k', '60k'];
  const dataPoints = [10, 40, 30, 70, 50, 90, 70, 100, 80, 120, 110, 150];
  
  const maxValue = Math.max(...dataPoints);

  return (
    <div className="relative">
      {/* Y-axis labels */}
      <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-400 font-medium pb-10">
        {yAxisLabels.map((label, index) => (
          <div key={index} className="text-right">{label}</div>
        ))}
      </div>
      
      {/* Chart area */}
      <div className="ml-8 h-48 relative">
        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between">
          {yAxisLabels.map((_, index) => (
            <div key={index} className="border-t border-gray-100"></div>
          ))}
        </div>
        
        {/* Data line */}
        <div className="absolute inset-0 flex items-end">
          <div className="w-full h-full flex items-end justify-between">
            {dataPoints.map((value, index) => {
              const height = (value / maxValue) * 100;
              return (
                <div key={index} className="flex flex-col items-center" style={{ width: `8%` }}>
                  <div 
                    className="w-2 bg-blue-500 rounded-t"
                    style={{ height: `${height}%` }}
                  />
                  <div className="mt-1 text-xs text-gray-500">{xAxisLabels[index]}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}