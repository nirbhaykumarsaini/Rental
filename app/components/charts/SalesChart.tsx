// components/SalesChart.tsx
'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, MoreVertical } from 'lucide-react';

interface SalesChartProps {
  chartData?: any;
  theme?: 'dark' | 'glass' | 'minimal' | 'ocean' | 'vibrant';
}

export default function SalesChart({ chartData, theme = 'vibrant' }: SalesChartProps) {
  const [mounted, setMounted] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Theme configurations
  const themeStyles = {
    vibrant: {
      bg: 'bg-[#2A2A3C]',
      border: 'border-[#3A3A4C]',
      text: 'text-white',
      textMuted: 'text-gray-400',
      gridLine: 'border-[#3A3A4C]',
      barGradient: 'from-orange-500 to-pink-500',
      hoverBar: 'hover:from-orange-400 hover:to-pink-400',
      tooltipBg: 'bg-[#1E1E2F]',
      tooltipBorder: 'border-[#3A3A4C]',
    },
    dark: {
      bg: 'bg-[#1A1A1A]',
      border: 'border-[#2A2A2A]',
      text: 'text-white',
      textMuted: 'text-zinc-400',
      gridLine: 'border-[#2A2A2A]',
      barGradient: 'from-purple-500 to-pink-500',
      hoverBar: 'hover:from-purple-400 hover:to-pink-400',
      tooltipBg: 'bg-[#1A1A1A]',
      tooltipBorder: 'border-[#2A2A2A]',
    },
    glass: {
      bg: 'bg-white/50 backdrop-blur-xl',
      border: 'border-white/50',
      text: 'text-gray-800',
      textMuted: 'text-gray-500',
      gridLine: 'border-white/50',
      barGradient: 'from-pink-400 to-purple-400',
      hoverBar: 'hover:from-pink-300 hover:to-purple-300',
      tooltipBg: 'bg-white/80 backdrop-blur-xl',
      tooltipBorder: 'border-white/50',
    },
    minimal: {
      bg: 'bg-white',
      border: 'border-gray-100',
      text: 'text-gray-900',
      textMuted: 'text-gray-400',
      gridLine: 'border-gray-100',
      barGradient: 'from-gray-400 to-gray-600',
      hoverBar: 'hover:from-gray-500 hover:to-gray-700',
      tooltipBg: 'bg-white',
      tooltipBorder: 'border-gray-100',
    },
    ocean: {
      bg: 'bg-white/30 backdrop-blur-md',
      border: 'border-white/50',
      text: 'text-teal-800',
      textMuted: 'text-teal-600',
      gridLine: 'border-white/50',
      barGradient: 'from-teal-400 to-blue-400',
      hoverBar: 'hover:from-teal-300 hover:to-blue-300',
      tooltipBg: 'bg-white/30 backdrop-blur-xl',
      tooltipBorder: 'border-white/50',
    },
  };

  const styles = themeStyles[theme as keyof typeof themeStyles] || themeStyles.vibrant;

  // Sample data - replace with actual chartData
  const yAxisLabels = ['0%', '20%', '40%', '60%', '80%', '100%'];
  const xAxisLabels = ['5k', '10k', '15k', '20k', '25k', '30k', '35k', '40k', '45k', '50k', '55k', '60k'];
  const dataPoints = [10, 40, 30, 70, 50, 90, 70, 100, 80, 120, 110, 150];
  
  const maxValue = Math.max(...dataPoints);

  return (
    <div className="relative">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${styles.barGradient}`}></div>
            <span className={`text-xs ${styles.textMuted}`}>Sales Trend</span>
          </div>
          <div className="flex items-center space-x-1">
            <TrendingUp className={`w-4 h-4 ${styles.textMuted}`} />
            <span className={`text-xs ${styles.textMuted}`}>+12.5%</span>
          </div>
        </div>
        <button className={`p-1 hover:bg-[#3A3A4C] rounded-lg transition-colors opacity-0 group-hover:opacity-100`}>
          <MoreVertical className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Chart Container */}
      <div className="relative h-64">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-xs">
          {yAxisLabels.map((label, index) => (
            <div key={index} className={`text-right ${styles.textMuted}`}>{label}</div>
          ))}
        </div>
        
        {/* Chart area */}
        <div className="ml-10 h-full relative">
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between">
            {yAxisLabels.map((_, index) => (
              <div key={index} className={`border-t ${styles.gridLine}`}></div>
            ))}
          </div>
          
          {/* Data bars */}
          <div className="absolute inset-0 bottom-6">
            <div className="w-full h-full flex items-end justify-between gap-1">
              {dataPoints.map((value, index) => {
                const height = (value / maxValue) * 100;
                const isHovered = hoveredIndex === index;
                
                return (
                  <div 
                    key={index} 
                    className="flex flex-col items-center group/bar relative"
                    style={{ width: `calc(100% / ${dataPoints.length} - 4px)` }}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <div className="w-full relative">
                      {/* Bar */}
                      <div 
                        className={`w-full bg-gradient-to-t ${styles.barGradient} rounded-t-lg transition-all duration-300 cursor-pointer
                          ${isHovered ? 'opacity-100 scale-105' : 'opacity-80'}`}
                        style={{ height: `${height}%` }}
                      />
                      
                      {/* Tooltip */}
                      {isHovered && (
                        <div className={`absolute -top-12 left-1/2 transform -translate-x-1/2 ${styles.tooltipBg} ${styles.tooltipBorder} border rounded-lg px-3 py-2 shadow-xl z-10 whitespace-nowrap`}>
                          <p className={`text-sm font-bold ${styles.text}`}>₹{value * 100}</p>
                          <p className={`text-xs ${styles.textMuted}`}>{xAxisLabels[index]}</p>
                        </div>
                      )}
                    </div>
                    
                    {/* X-axis label */}
                    <div className={`mt-2 text-xs ${styles.textMuted} group-hover/bar:font-bold transition-all`}>
                      {xAxisLabels[index]}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Chart Footer */}
      <div className="mt-8 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <span className={`text-xs ${styles.textMuted}`}>Total Revenue:</span>
            <span className={`text-sm font-bold ${styles.text}`}>₹2,45,678</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className={`text-xs ${styles.textMuted}`}>Avg:</span>
            <span className={`text-sm font-bold ${styles.text}`}>₹20,473</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className={`px-3 py-1 rounded-lg text-xs ${styles.textMuted} hover:bg-[#3A3A4C] transition-colors border ${styles.border}`}>
            Day
          </button>
          <button className={`px-3 py-1 rounded-lg text-xs bg-gradient-to-r ${styles.barGradient} text-white transition-colors border-0`}>
            Week
          </button>
          <button className={`px-3 py-1 rounded-lg text-xs ${styles.textMuted} hover:bg-[#3A3A4C] transition-colors border ${styles.border}`}>
            Month
          </button>
        </div>
      </div>
    </div>
  );
}