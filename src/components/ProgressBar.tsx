import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  progress: number;
  color?: 'blue' | 'green' | 'purple' | 'orange';
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
  animated?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = 'blue',
  size = 'md',
  showPercentage = true,
  animated = true,
}) => {
  const colors = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    purple: 'bg-purple-600',
    orange: 'bg-orange-600',
  };

  const sizes = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className="w-full">
      {showPercentage && (
        <div className="flex justify-between mb-1">
          <span className={`${textSizes[size]} text-gray-300`}>Progresso</span>
          <span className={`${textSizes[size]} text-gray-300`}>{Math.round(progress)}%</span>
        </div>
      )}
      <div className={`w-full ${sizes[size]} bg-gray-700 rounded-full overflow-hidden`}>
        <motion.div
          className={`${sizes[size]} ${colors[color]} rounded-full`}
          initial={animated ? { width: 0 } : { width: `${progress}%` }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: animated ? 1 : 0, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};