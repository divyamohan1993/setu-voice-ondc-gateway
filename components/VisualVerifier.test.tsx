/**
 * VisualVerifier Component Tests
 * 
 * Tests for the Visual Verifier component that displays catalog data
 * as an accessible visual card with minimal text.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VisualVerifier } from './VisualVerifier';
import type { BecknCatalogItem } from '@/lib/beckn-schema';

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, width, height }: any) => (
    <img src={src} alt={alt} width={width} height={height} />
  ),
}));

// Mock Framer Motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('VisualVerifier Component', () => {
  const mockCatalog: BecknCatalogItem = {
    descriptor: {
      name: 'Nasik Onions',
      symbol: '/icons/onion.png',
    },
    price: {
      value: 40,
      currency: 'INR',
    },
    quantity: {
      available: {
        count: 500,
      },
      unit: 'kg',
    },
    tags: {
      grade: 'A',
      perishability: 'medium',
      logistics_provider: 'India Post',
    },
  };

  const mockOnBroadcast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the component with catalog data', () => {
      render(
        <VisualVerifier
          catalog={mockCatalog}
          onBroadcast={mockOnBroadcast}
          isBroadcasting={false}
        />
      );

      // Check product name is displayed
      expect(screen.getByText('Nasik Onions')).toBeInTheDocument();
    });

    it('should display commodity icon with correct path', () => {
      render(
        <VisualVerifier
          catalog={mockCatalog}
          onBroadcast={mockOnBroadcast}
          isBroadcasting={false}
        />
      );

      const icon = screen.getByAltText('Nasik Onions');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('src', '/icons/onion.png');
      expect(icon).toHaveAttribute('width', '128');
      expect(icon).toHaveAttribute('height', '128');
    });

    it('should display price badge with currency symbol and large font', () => {
      render(
        <VisualVerifier
          catalog={mockCatalog}
          onBroadcast={mockOnBroadcast}
          isBroadcasting={false}
        />
      );

      // Check price is displayed with rupee symbol
      expect(screen.getByText(/₹40/)).toBeInTheDocument();
      expect(screen.getByText(/kg/)).toBeInTheDocument();
    });

    it('should display quantity indicator with visual representation', () => {
      render(
        <VisualVerifier
          catalog={mockCatalog}
          onBroadcast={mockOnBroadcast}
          isBroadcasting={false}
        />
      );

    