import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, AlertTriangle, Info } from 'lucide-react';

interface ToastNotificationProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'success',
  duration = 4000
}) => {
  // Auto-close após a duração especificada
  React.useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <Check className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case 'error':
        return <X className="w-5 h-5 text-red-600 dark:text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      default:
        return <Check className="w-5 h-5 text-green-600 dark:text-green-400" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50/95 dark:bg-green-900/90',
          border: 'border-green-200 dark:border-green-800',
          accent: 'bg-green-500'
        };
      case 'error':
        return {
          bg: 'bg-red-50/95 dark:bg-red-900/90',
          border: 'border-red-200 dark:border-red-800',
          accent: 'bg-red-500'
        };
      case 'warning':
        return {
          bg: 'bg-orange-50/95 dark:bg-orange-900/90',
          border: 'border-orange-200 dark:border-orange-800',
          accent: 'bg-orange-500'
        };
      case 'info':
        return {
          bg: 'bg-blue-50/95 dark:bg-blue-900/90',
          border: 'border-blue-200 dark:border-blue-800',
          accent: 'bg-blue-500'
        };
      default:
        return {
          bg: 'bg-green-50/95 dark:bg-green-900/90',
          border: 'border-green-200 dark:border-green-800',
          accent: 'bg-green-500'
        };
    }
  };

  const colors = getColors();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-4 right-4 z-50 max-w-sm w-full"
        >
          <div className={`relative ${colors.bg} ${colors.border} border rounded-xl shadow-2xl backdrop-blur-sm overflow-hidden`}>
            {/* Accent bar */}
            <div className={`absolute top-0 left-0 right-0 h-1 ${colors.accent}`} />
            
            <div className="p-4">
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="flex-shrink-0 mt-0.5">
                  <div className="p-2 bg-white/95 dark:bg-gray-800/95 rounded-full shadow-sm">
                    {getIcon()}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                    {title}
                  </h3>
                  {message && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {message}
                    </p>
                  )}
                </div>

                {/* Close button */}
                <button
                  onClick={onClose}
                  className="flex-shrink-0 p-1 rounded-full hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* Progress bar for auto-close */}
            {duration > 0 && (
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: duration / 1000, ease: "linear" }}
                className={`absolute bottom-0 left-0 h-1 ${colors.accent} opacity-30`}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};