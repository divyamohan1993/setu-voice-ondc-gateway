/**
 * User-friendly error messages for the Setu Voice-to-ONDC Gateway
 * 
 * Provides consistent, helpful error messages throughout the application
 * with appropriate context and suggested actions for users.
 */

export interface ErrorMessage {
  title: string;
  description: string;
  action?: string;
  technical?: string;
}

/**
 * Error message categories
 */
export const ERROR_MESSAGES = {
  // Translation errors
  TRANSLATION_FAILED: {
    title: "Voice Translation Failed",
    description: "We couldn't understand your voice input. Please try speaking more clearly or select a different scenario.",
    action: "Try selecting another voice scenario from the dropdown",
  },
  
  TRANSLATION_API_ERROR: {
    title: "Translation Service Unavailable",
    description: "The voice translation service is temporarily unavailable. We're using a backup system instead.",
    action: "Your catalog has been created with default values. You can still broadcast it.",
  },
  
  TRANSLATION_INVALID_INPUT: {
    title: "Invalid Voice Input",
    description: "The voice input appears to be empty or invalid. Please select a voice scenario to continue.",
    action: "Choose a scenario from the dropdown menu above",
  },

  // Database errors
  DATABASE_CONNECTION_ERROR: {
    title: "Database Connection Failed",
    description: "We're having trouble connecting to our database. Your data might not be saved properly.",
    action: "Please try again in a few moments",
    technical: "Check database connection and credentials",
  },
  
  CATALOG_SAVE_FAILED: {
    title: "Catalog Save Failed",
    description: "We couldn't save your catalog to the database. Your progress might be lost.",
    action: "Please try creating the catalog again",
  },
  
  CATALOG_NOT_FOUND: {
    title: "Catalog Not Found",
    description: "The catalog you're looking for doesn't exist or has been removed.",
    action: "Please create a new catalog",
  },

  // Broadcast errors
  BROADCAST_FAILED: {
    title: "Broadcast Failed",
    description: "We couldn't send your catalog to the buyer network. No buyers will see your listing.",
    action: "Please try broadcasting again",
  },
  
  BROADCAST_NO_CATALOG: {
    title: "No Catalog to Broadcast",
    description: "You need to create a catalog first before you can broadcast it to buyers.",
    action: "Select a voice scenario to create your catalog",
  },
  
  NETWORK_SIMULATION_ERROR: {
    title: "Network Error",
    description: "There was a problem simulating the buyer network response. Your catalog was broadcasted but we can't show buyer interest.",
    action: "Check the debug console for network activity",
  },

  // Validation errors
  INVALID_CATALOG_DATA: {
    title: "Invalid Catalog Data",
    description: "The catalog information is incomplete or invalid. Some required fields are missing.",
    action: "Please try creating the catalog again with a different voice scenario",
  },
  
  INVALID_FARMER_ID: {
    title: "Invalid Farmer Profile",
    description: "We couldn't identify your farmer profile. This might affect saving your catalog.",
    action: "Please contact support if this problem persists",
  },

  // Network errors
  NETWORK_ERROR: {
    title: "Network Connection Error",
    description: "We're having trouble connecting to our servers. Some features might not work properly.",
    action: "Please check your internet connection and try again",
  },
  
  TIMEOUT_ERROR: {
    title: "Request Timeout",
    description: "The operation is taking longer than expected. This might be due to high server load.",
    action: "Please wait a moment and try again",
  },

  // Generic errors
  UNKNOWN_ERROR: {
    title: "Something Went Wrong",
    description: "An unexpected error occurred. We're working to fix this issue.",
    action: "Please try again or contact support if the problem persists",
  },
  
  FEATURE_UNAVAILABLE: {
    title: "Feature Temporarily Unavailable",
    description: "This feature is currently under maintenance and will be available soon.",
    action: "Please try again later",
  },
} as const;

/**
 * Error types for type safety
 */
export type ErrorType = keyof typeof ERROR_MESSAGES;

/**
 * Get user-friendly error message
 */
export function getErrorMessage(
  errorType: ErrorType, 
  context?: Record<string, string>
): ErrorMessage {
  const baseMessage = ERROR_MESSAGES[errorType];
  
  // Replace placeholders in the message with context values
  if (context) {
    const processText = (text: string) => {
      return Object.entries(context).reduce((result, [key, value]) => {
        return result.replace(new RegExp(`{${key}}`, 'g'), value);
      }, text);
    };

    return {
      ...baseMessage,
      title: processText(baseMessage.title),
      description: processText(baseMessage.description),
      action: baseMessage.action ? processText(baseMessage.action) : undefined,
      technical: baseMessage.technical ? processText(baseMessage.technical) : undefined,
    };
  }
  
  return baseMessage;
}

/**
 * Format error for toast notification
 */
export function formatErrorForToast(errorType: ErrorType, context?: Record<string, string>): string {
  const message = getErrorMessage(errorType, context);
  return `${message.title}: ${message.description}`;
}

/**
 * Format error for detailed display
 */
export function formatErrorForDisplay(errorType: ErrorType, context?: Record<string, string>) {
  const message = getErrorMessage(errorType, context);
  return {
    title: message.title,
    description: message.description,
    action: message.action,
    showTechnical: !!message.technical,
    technical: message.technical,
  };
}

/**
 * Determine error type from error object
 */
export function categorizeError(error: unknown): ErrorType {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    // Database errors
    if (message.includes('database') || message.includes('prisma') || message.includes('connection')) {
      return 'DATABASE_CONNECTION_ERROR';
    }
    
    // Network errors
    if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
      return 'NETWORK_ERROR';
    }
    
    // Translation errors
    if (message.includes('translation') || message.includes('ai') || message.includes('openai')) {
      return 'TRANSLATION_API_ERROR';
    }
    
    // Validation errors
    if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
      return 'INVALID_CATALOG_DATA';
    }
  }
  
  return 'UNKNOWN_ERROR';
}

/**
 * Create error with user-friendly message
 */
export class UserFriendlyError extends Error {
  public readonly errorType: ErrorType;
  public readonly userMessage: ErrorMessage;
  
  constructor(errorType: ErrorType, context?: Record<string, string>, originalError?: Error) {
    const userMessage = getErrorMessage(errorType, context);
    super(userMessage.description);
    
    this.name = 'UserFriendlyError';
    this.errorType = errorType;
    this.userMessage = userMessage;
    
    if (originalError) {
      this.stack = originalError.stack;
      this.cause = originalError;
    }
  }
}