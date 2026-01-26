/**
 * VoiceInjector Component Tests
 * Phase 10.4.1: Test VoiceInjector rendering and interactions
 * 
 * Tests for the voice input simulation component.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@/tests/utils/test-utils';
import { VoiceInjector } from './VoiceInjector';
import userEvent from '@testing-library/user-event';

describe('VoiceInjector Component', () => {
  describe('10.4.1: Rendering and interactions', () => {
    it('should render the component with title', () => {
      const mockOnScenarioSelect = vi.fn();
      
      render(
        <VoiceInjector 
          onScenarioSelect={mockOnScenarioSelect} 
          isProcessing={false} 
        />
      );
      
      expect(screen.getByText('Voice Input Simulator')).toBeInTheDocument();
    });

    it('should render scenario selection dropdown', () => {
      const mockOnScenarioSelect = vi.fn();
      
      render(
        <VoiceInjector 
          onScenarioSelect={mockOnScenarioSelect} 
          isProcessing={false} 
        />
      );
      
      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByText(/Select a voice scenario/i)).toBeInTheDocument();
    });

    it('should display instructions', () => {
      const mockOnScenarioSelect = vi.fn();
      
      render(
        <VoiceInjector 
          onScenarioSelect={mockOnScenarioSelect} 
          isProcessing={false} 
        />
      );
      
      expect(screen.getByText('How it works:')).toBeInTheDocument();
    });

    it('should call onScenarioSelect when scenario is selected', async () => {
      const user = userEvent.setup();
      const mockOnScenarioSelect = vi.fn().mockResolvedValue(undefined);
      
      render(
        <VoiceInjector 
          onScenarioSelect={mockOnScenarioSelect} 
          isProcessing={false} 
        />
      );
      
      // Open dropdown
      const trigger = screen.getByRole('combobox');
      await user.click(trigger);
      
      // Wait for dropdown to open and select first option
      await waitFor(() => {
        const option = screen.getByText(/Nasik Onions/i);
        expect(option).toBeInTheDocument();
      });
      
      const option = screen.getByText(/Nasik Onions/i);
      await user.click(option);
      
      // Verify callback was called with correct text
      await waitFor(() => {
        expect(mockOnScenarioSelect).toHaveBeenCalledWith(
          expect.stringContaining('pyaaz')
        );
      });
    });

    it('should disable dropdown when processing', () => {
      const mockOnScenarioSelect = vi.fn();
      
      render(
        <VoiceInjector 
          onScenarioSelect={mockOnScenarioSelect} 
          isProcessing={true} 
        />
      );
      
      const trigger = screen.getByRole('combobox');
      expect(trigger).toBeDisabled();
    });

    it('should show processing state when isProcessing is true', () => {
      const mockOnScenarioSelect = vi.fn();
      
      render(
        <VoiceInjector 
          onScenarioSelect={mockOnScenarioSelect} 
          isProcessing={true} 
        />
      );
      
      expect(screen.getByText(/Processing Voice Input/i)).toBeInTheDocument();
      expect(screen.getByText(/Converting voice command to Beckn Protocol JSON/i)).toBeInTheDocument();
    });

    it('should not show processing state when isProcessing is false', () => {
      const mockOnScenarioSelect = vi.fn();
      
      render(
        <VoiceInjector 
          onScenarioSelect={mockOnScenarioSelect} 
          isProcessing={false} 
        />
      );
      
      expect(screen.queryByText(/Processing Voice Input/i)).not.toBeInTheDocument();
    });

    it('should have minimum touch target size for dropdown', () => {
      const mockOnScenarioSelect = vi.fn();
      
      render(
        <VoiceInjector 
          onScenarioSelect={mockOnScenarioSelect} 
          isProcessing={false} 
        />
      );
      
      const trigger = screen.getByRole('combobox');
      const styles = window.getComputedStyle(trigger);
      
      // Check minimum height is set
      expect(trigger).toHaveStyle({ minHeight: '44px' });
    });

    it('should display selected scenario text', async () => {
      const user = userEvent.setup();
      const mockOnScenarioSelect = vi.fn().mockResolvedValue(undefined);
      
      render(
        <VoiceInjector 
          onScenarioSelect={mockOnScenarioSelect} 
          isProcessing={false} 
        />
      );
      
      // Open dropdown and select option
      const trigger = screen.getByRole('combobox');
      await user.click(trigger);
      
      await waitFor(() => {
        const option = screen.getByText(/Nasik Onions/i);
        expect(option).toBeInTheDocument();
      });
      
      const option = screen.getByText(/Nasik Onions/i);
      await user.click(option);
      
      // Check if selected text is displayed
      await waitFor(() => {
        expect(screen.getByText(/Selected Voice Input:/i)).toBeInTheDocument();
      });
    });

    it('should handle scenario selection errors gracefully', async () => {
      const user = userEvent.setup();
      const mockOnScenarioSelect = vi.fn().mockRejectedValue(new Error('Test error'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <VoiceInjector 
          onScenarioSelect={mockOnScenarioSelect} 
          isProcessing={false} 
        />
      );
      
      // Open dropdown and select option
      const trigger = screen.getByRole('combobox');
      await user.click(trigger);
      
      await waitFor(() => {
        const option = screen.getByText(/Nasik Onions/i);
        expect(option).toBeInTheDocument();
      });
      
      const option = screen.getByText(/Nasik Onions/i);
      await user.click(option);
      
      // Verify error was logged
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });
      
      consoleSpy.mockRestore();
    });
  });
});
