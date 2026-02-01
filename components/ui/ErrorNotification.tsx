/**
 * ErrorNotification Component
 * 
 * A reusable error notification component with high contrast colors
 * and clear visual indicators.
 * WCAG 2.1 Compliant: Includes role alert and proper ARIA attributes.
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
          role="alertdialog"
          aria-labelledby="error-notification-title"
          aria-describedby="error-notification-message"
          aria-modal="false"
        >
          <div className="flex items-start gap-4">
            <div className="bg-red-500 p-2 rounded-lg flex-shrink-0" aria-hidden="true">
              <AlertCircle className="w-6 h-6 text-white" aria-hidden="true" />
            </div>

            <div className="flex-1">
              <h3
                id="error-notification-title"
                className="text-lg font-bold text-red-900 mb-1"
              >
                {title}
              </h3>
              <p
                id="error-notification-message"
                className="text-red-800"
                role="alert"
              >
                {message}
              </p>
            </div>

            {onDismiss && (
              <Button
                onClick={onDismiss}
                variant="ghost"
                size="sm"
                className="flex-shrink-0 hover:bg-red-100 transition-colors duration-75"
                aria-label="Dismiss error notification"
                type="button"
              >
                <X className="w-5 h-5 text-red-600" aria-hidden="true" />
                <span className="sr-only">Close</span>
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

