/**
 * ErrorNotification Component
 * 
 * A reusable error notification component with high contrast colors
 * and clear visual indicators.
 */

import { AlertCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./button";

export interface ErrorNotificationProps {
  message: string;
  title?: string;
  onDismiss?: () => void;
  show?: boolean;
}

export function ErrorNotification({ 
  message, 
  title = "Error", 
  onDismiss,
  show = true 
}: ErrorNotificationProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="bg-red-50 border-2 border-red-300 rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-start gap-4">
            <div className="bg-red-500 p-2 rounded-lg flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-bold text-red-900 mb-1">
                {title}
              </h3>
              <p className="text-red-800">
                {message}
              </p>
            </div>
            
            {onDismiss && (
              <Button
                onClick={onDismiss}
                variant="ghost"
                size="sm"
                className="flex-shrink-0 hover:bg-red-100"
              >
                <X className="w-5 h-5 text-red-600" />
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
