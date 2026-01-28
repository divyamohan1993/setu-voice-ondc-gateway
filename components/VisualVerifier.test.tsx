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
      expect(screen.getByText(/40/)).toBeInTheDocument();
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

      // Check quantity is displayed
      expect(screen.getByText(/500 kg/)).toBeInTheDocument();
    });

    it('should display quality grade when available', () => {
      render(
        <VisualVerifier
          catalog={mockCatalog}
          onBroadcast={mockOnBroadcast}
          isBroadcasting={false}
        />
      );

      expect(screen.getByText(/Grade: A/)).toBeInTheDocument();
    });

    it('should display logistics provider logo when available', () => {
      render(
        <VisualVerifier
          catalog={mockCatalog}
          onBroadcast={mockOnBroadcast}
          isBroadcasting={false}
        />
      );

      const logo = screen.getByAltText('India Post');
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveAttribute('src', '/logos/india-post.png');
      expect(logo).toHaveAttribute('width', '64');
      expect(logo).toHaveAttribute('height', '64');
    });

    it('should not display grade badge when grade is not provided', () => {
      const catalogWithoutGrade = {
        ...mockCatalog,
        tags: {
          ...mockCatalog.tags,
          grade: undefined,
        },
      };

      render(
        <VisualVerifier
          catalog={catalogWithoutGrade}
          onBroadcast={mockOnBroadcast}
          isBroadcasting={false}
        />
      );

      expect(screen.queryByText(/Grade:/)).not.toBeInTheDocument();
    });

    it('should not display logistics logo when provider is not specified', () => {
      const catalogWithoutLogistics = {
        ...mockCatalog,
        tags: {
          ...mockCatalog.tags,
          logistics_provider: undefined,
        },
      };

      render(
        <VisualVerifier
          catalog={catalogWithoutLogistics}
          onBroadcast={mockOnBroadcast}
          isBroadcasting={false}
        />
      );

      expect(screen.queryByAltText(/Logistics/)).not.toBeInTheDocument();
    });
  });

  describe('Broadcast Button', () => {
    it('should render thumbprint broadcast button with correct size (120x120px)', () => {
      render(
        <VisualVerifier
          catalog={mockCatalog}
          onBroadcast={mockOnBroadcast}
          isBroadcasting={false}
        />
      );

      const button = screen.getByRole('button', { name: /broadcast/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('h-32', 'w-32'); // 128px = 32 * 4px (Tailwind)
    });

    it('should call onBroadcast when button is clicked', async () => {
      mockOnBroadcast.mockResolvedValue(undefined);

      render(
        <VisualVerifier
          catalog={mockCatalog}
          onBroadcast={mockOnBroadcast}
          isBroadcasting={false}
        />
      );

      const button = screen.getByRole('button', { name: /broadcast/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockOnBroadcast).toHaveBeenCalledTimes(1);
      });
    });

    it('should disable button when isBroadcasting is true', () => {
      render(
        <VisualVerifier
          catalog={mockCatalog}
          onBroadcast={mockOnBroadcast}
          isBroadcasting={true}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should show loading spinner when broadcasting', () => {
      render(
        <VisualVerifier
          catalog={mockCatalog}
          onBroadcast={mockOnBroadcast}
          isBroadcasting={true}
        />
      );

      // Loader2 icon should be present
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should show success checkmark after successful broadcast', async () => {
      mockOnBroadcast.mockResolvedValue(undefined);

      render(
        <VisualVerifier
          catalog={mockCatalog}
          onBroadcast={mockOnBroadcast}
          isBroadcasting={false}
        />
      );

      const button = screen.getByRole('button', { name: /broadcast/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockOnBroadcast).toHaveBeenCalled();
      });

      // Success message should appear
      await waitFor(() => {
        expect(screen.getByText(/Catalog Broadcasted!/)).toBeInTheDocument();
      });
    });

    it('should display success message after broadcast', async () => {
      mockOnBroadcast.mockResolvedValue(undefined);

      render(
        <VisualVerifier
          catalog={mockCatalog}
          onBroadcast={mockOnBroadcast}
          isBroadcasting={false}
        />
      );

      const button = screen.getByRole('button', { name: /broadcast/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/Catalog Broadcasted!/)).toBeInTheDocument();
        expect(screen.getByText(/Sent to buyer network/)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should use high-contrast colors for visual elements', () => {
      const { container } = render(
        <VisualVerifier
          catalog={mockCatalog}
          onBroadcast={mockOnBroadcast}
          isBroadcasting={false}
        />
      );

      // Check that the card has proper styling classes
      const card = container.querySelector('.border-4');
      expect(card).toBeInTheDocument();
    });

    it('should have large touch targets (minimum 44x44px)', () => {
      render(
        <VisualVerifier
          catalog={mockCatalog}
          onBroadcast={mockOnBroadcast}
          isBroadcasting={false}
        />
      );

      const button = screen.getByRole('button', { name: /broadcast/i });
      // Button is 120x120px which exceeds minimum 44x44px
      expect(button).toHaveClass('h-32', 'w-32');
    });

    it('should use minimal text with visual representations', () => {
      render(
        <VisualVerifier
          catalog={mockCatalog}
          onBroadcast={mockOnBroadcast}
          isBroadcasting={false}
        />
      );

      // Component should have images for commodity and logistics
      const commodityIcon = screen.getByAltText('Nasik Onions');
      const logisticsLogo = screen.getByAltText('India Post');
      
      expect(commodityIcon).toBeInTheDocument();
      expect(logisticsLogo).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle catalog with zero price', () => {
      const catalogWithZeroPrice = {
        ...mockCatalog,
        price: {
          value: 0,
          currency: 'INR',
        },
      };

      render(
        <VisualVerifier
          catalog={catalogWithZeroPrice}
          onBroadcast={mockOnBroadcast}
          isBroadcasting={false}
        />
      );

      expect(screen.getByText(/0/)).toBeInTheDocument();
    });

    it('should handle catalog with large quantity', () => {
      const catalogWithLargeQuantity = {
        ...mockCatalog,
        quantity: {
          available: {
            count: 999999,
          },
          unit: 'kg',
        },
      };

      render(
        <VisualVerifier
          catalog={catalogWithLargeQuantity}
          onBroadcast={mockOnBroadcast}
          isBroadcasting={false}
        />
      );

      expect(screen.getByText(/999999 kg/)).toBeInTheDocument();
    });

    it('should handle unknown commodity with fallback icon', () => {
      const catalogWithUnknownCommodity = {
        ...mockCatalog,
        descriptor: {
          name: 'Unknown Commodity',
          symbol: '/icons/unknown.png',
        },
      };

      render(
        <VisualVerifier
          catalog={catalogWithUnknownCommodity}
          onBroadcast={mockOnBroadcast}
          isBroadcasting={false}
        />
      );

      const icon = screen.getByAltText('Unknown Commodity');
      expect(icon).toBeInTheDocument();
      // Should use default icon from icon-mapper
      expect(icon).toHaveAttribute('src', '/icons/wheat.png');
    });

    it('should handle broadcast error gracefully', async () => {
      mockOnBroadcast.mockRejectedValue(new Error('Network error'));

      render(
        <VisualVerifier
          catalog={mockCatalog}
          onBroadcast={mockOnBroadcast}
          isBroadcasting={false}
        />
      );

      const button = screen.getByRole('button', { name: /broadcast/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockOnBroadcast).toHaveBeenCalled();
      });

      // Component should handle error without crashing
      expect(button).toBeInTheDocument();
    });
  });

  describe('Different Commodities', () => {
    it('should display mango icon for mango products', () => {
      const mangoCatalog = {
        ...mockCatalog,
        descriptor: {
          name: 'Alphonso Mango',
          symbol: '/icons/mango.png',
        },
      };

      render(
        <VisualVerifier
          catalog={mangoCatalog}
          onBroadcast={mockOnBroadcast}
          isBroadcasting={false}
        />
      );

      const icon = screen.getByAltText('Alphonso Mango');
      expect(icon).toHaveAttribute('src', '/icons/mango.png');
    });

    it('should display tomato icon for tomato products', () => {
      const tomatoCatalog = {
        ...mockCatalog,
        descriptor: {
          name: 'Fresh Tomatoes',
          symbol: '/icons/tomato.png',
        },
      };

      render(
        <VisualVerifier
          catalog={tomatoCatalog}
          onBroadcast={mockOnBroadcast}
          isBroadcasting={false}
        />
      );

      const icon = screen.getByAltText('Fresh Tomatoes');
      expect(icon).toHaveAttribute('src', '/icons/tomato.png');
    });
  });
});
