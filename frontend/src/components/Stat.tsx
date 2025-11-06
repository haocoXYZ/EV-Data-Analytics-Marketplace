import React from 'react';
import { ArrowUp, ArrowDown, Minus, LucideIcon } from 'lucide-react';

export interface StatProps {
  label: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: LucideIcon;
  className?: string;
}

export const Stat: React.FC<StatProps> = ({
  label,
  value,
  change,
  trend = 'neutral',
  icon: Icon,
  className = '',
}) => {
  const trendIcons = {
    up: ArrowUp,
    down: ArrowDown,
    neutral: Minus,
  };

  const trendColors = {
    up: 'text-green-600 bg-green-50',
    down: 'text-red-600 bg-red-50',
    neutral: 'text-gray-600 bg-gray-50',
  };

  const TrendIcon = trendIcons[trend];

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
          
          {change !== undefined && (
            <div className="mt-2 flex items-center gap-1">
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${trendColors[trend]}`}
              >
                <TrendIcon className="w-3 h-3" />
                {Math.abs(change)}%
              </span>
              <span className="text-xs text-gray-500 ml-1">vs last period</span>
            </div>
          )}
        </div>

        {Icon && (
          <div className="flex-shrink-0">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Icon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
