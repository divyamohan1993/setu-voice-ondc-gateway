/**
 * Utility Components Demo
 * 
 * This file demonstrates all four utility components in action.
 * Use this for visual testing and documentation purposes.
 */

'use client';

import { useState } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorNotification } from './ErrorNotification';
import { BroadcastLoader } from './BroadcastLoader';
import { BuyerBidNotification } from './BuyerBidNotification';
import { Button } from './button';
import { Card } from './card';

export function UtilityComponentsDemo() {
  const [showError, setShowError] = useState(true);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [showBid, setShowBid] = useState(false);

  const mockBid = {
    buyerName: 'Reliance Fresh',
    bidAmount: 42.50,
    timestamp: new Date(),
    buyerLogo: '/logos/reliance.png',
    buyerRating: 4.5,
    buyerLocation: 'Mumbai, Maharashtra',
    buyerVerified: true,
    bidId: 'mock-bid-001'
  };

  const handleBroadcast = () => {
    setShowBroadcast(true);
    setTimeout(() => {
      setShowBroadcast(false);
      setShowBid(true);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Utility Components Demo
          </h1>
          <p className="text-gray-600">
            Visual demonstration of all four utility components
          </p>
        </div>

        {/* LoadingSpinner Demo */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">1. LoadingSpinner</h2>
          <p className="text-gray-600 mb-4">
            Reusable loading spinner with customizable sizes
          </p>
          <div className="flex gap-8 items-center">
            <div>
              <p className="text-sm font-semibold mb-2">Small</p>
              <LoadingSpinner size="sm" />
            </div>
            <div>
              <p className="text-sm font-semibold mb-2">Medium (default)</p>
              <LoadingSpinner size="md" />
            </div>
            <div>
              <p className="text-sm font-semibold mb-2">Large</p>
              <LoadingSpinner size="lg" />
            </div>
            <div>
              <p className="text-sm font-semibold mb-2">Extra Large</p>
              <LoadingSpinner size="xl" />
            </div>
            <div>
              <p className="text-sm font-semibold mb-2">With Text</p>
              <LoadingSpinner size="md" text="Loading data..." />
            </div>
          </div>
        </Card>

        {/* ErrorNotification Demo */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">2. ErrorNotification</h2>
          <p className="text-gray-600 mb-4">
            High-contrast error notification with animations
          </p>
          <div className="space-y-4">
            <ErrorNotification
              message="Failed to translate voice input. Please try again."
              show={showError}
              onDismiss={() => setShowError(false)}
            />
            {!showError && (
              <Button onClick={() => setShowError(true)}>
                Show Error Again
              </Button>
            )}
          </div>
        </Card>

        {/* BroadcastLoader Demo */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">3. BroadcastLoader</h2>
          <p className="text-gray-600 mb-4">
            Animated loader for broadcast operations with pulsing radio waves
          </p>
          <div className="space-y-4">
            {!showBroadcast && !showBid && (
              <Button onClick={handleBroadcast} size="lg">
                Start Broadcast Demo
              </Button>
            )}
            {showBroadcast && (
              <div className="bg-white rounded-xl p-8">
                <BroadcastLoader />
              </div>
            )}
          </div>
        </Card>

        {/* BuyerBidNotification Demo */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">4. BuyerBidNotification</h2>
          <p className="text-gray-600 mb-4">
            Success notification for buyer bids with spring animations
          </p>
          <div className="space-y-4">
            {showBid && (
              <div className="flex justify-center">
                <BuyerBidNotification bid={mockBid} />
              </div>
            )}
            {!showBid && !showBroadcast && (
              <Button onClick={() => setShowBid(true)} size="lg">
                Show Bid Notification
              </Button>
            )}
            {showBid && (
              <Button onClick={() => setShowBid(false)} variant="outline">
                Hide Notification
              </Button>
            )}
          </div>
        </Card>

        {/* Integration Example */}
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50">
          <h2 className="text-2xl font-bold mb-4">Integration Example</h2>
          <p className="text-gray-600 mb-4">
            These components work together in the main application flow:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>
              <strong>LoadingSpinner</strong> - Shows during voice translation
            </li>
            <li>
              <strong>ErrorNotification</strong> - Displays if translation fails
            </li>
            <li>
              <strong>BroadcastLoader</strong> - Animates during 8-second network wait
            </li>
            <li>
              <strong>BuyerBidNotification</strong> - Celebrates successful bid reception
            </li>
          </ol>
        </Card>

        {/* Technical Details */}
        <Card className="p-6 bg-gray-50">
          <h2 className="text-2xl font-bold mb-4">Technical Details</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-semibold mb-2">Technologies Used:</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>React 18+ with TypeScript</li>
                <li>Framer Motion for animations</li>
                <li>Lucide React for icons</li>
                <li>Tailwind CSS for styling</li>
                <li>Shadcn/UI components</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Accessibility Features:</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>High contrast ratios (4.5:1+)</li>
                <li>Large, clear icons (64x64px+)</li>
                <li>Color-coded status indicators</li>
                <li>Smooth, attention-guiding animations</li>
                <li>Minimal text, maximum visuals</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
