/**
 * Tests for Utility Components
 * 
 * Verifies that all utility components render correctly and meet requirements.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from '../LoadingSpinner';
import { ErrorNotification } from '../ErrorNotification';
import { BroadcastLoader } from '../BroadcastLoader';
import { BuyerBidNotification } from '../BuyerBidNotification';

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    const { container } = render(<LoadingSpinner />);
    expect(container.querySelector('.animate-spin')).toBeTruthy();
  });

  it('renders with text', () => {
    render(<LoadingSpinner text="Loading..." />);
    expect(screen.getByText('Loading...')).toBeTruthy();
  });

  it('applies size classes correctly', () => {
    const { container } = render(<LoadingSpinner size="xl" />);
    expect(container.querySelector('.w-12')).toBeTruthy();
  });
});

describe('ErrorNotification', () => {
  it('renders error message', () => {
    render(<ErrorNotification message="Test error" />);
    expect(screen.getByText('Test error')).toBeTruthy();
  });

  it('renders custom title', () => {
    render(<ErrorNotification message="Test error" title="Custom Error" />);
    expect(screen.getByText('Custom Error')).toBeTruthy();
  });

  it('shows dismiss button when onDismiss provided', () => {
    const onDismiss = () => {};
    const { container } = render(
      <ErrorNotification message="Test error" onDismiss={onDismiss} />
    );
    expect(container.querySelector('button')).toBeTruthy();
  });

  it('hides when show is false', () => {
    const { container } = render(
      <ErrorNotification message="Test error" show={false} />
    );
    expect(container.firstChild).toBeNull();
  });
});

describe('BroadcastLoader', () => {
  it('renders with default message', () => {
    render(<BroadcastLoader />);
    expect(screen.getByText('Broadcasting to network...')).toBeTruthy();
  });

  it('renders with custom message', () => {
    render(<BroadcastLoader message="Custom message" />);
    expect(screen.getByText('Custom message')).toBeTruthy();
  });

  it('displays ONDC network text', () => {
    render(<BroadcastLoader />);
    expect(screen.getByText(/ONDC network/)).toBeTruthy();
  });
});

describe('BuyerBidNotification', () => {
  const mockBid = {
    buyerName: 'Reliance Fresh',
    bidAmount: 42.50,
    timestamp: new Date('2024-01-15T10:30:00'),
    buyerLogo: '/logos/reliance.png'
  };

  it('renders buyer name', () => {
    render(<BuyerBidNotification bid={mockBid} />);
    expect(screen.getByText('Reliance Fresh')).toBeTruthy();
  });

  it('renders bid amount with currency', () => {
    render(<BuyerBidNotification bid={mockBid} />);
    expect(screen.getByText('42.50')).toBeTruthy();
  });

  it('renders success message', () => {
    render(<BuyerBidNotification bid={mockBid} />);
    expect(screen.getByText('Bid Received!')).toBeTruthy();
  });

  it('renders broadcast success badge', () => {
    render(<BuyerBidNotification bid={mockBid} />);
    expect(screen.getByText(/Broadcast Successful/)).toBeTruthy();
  });
});
