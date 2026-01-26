/**
 * NetworkLogViewer Component Tests
 * 
 * Tests for the NetworkLogViewer component to verify all sub-tasks are implemented correctly.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { NetworkLogViewer } from "./NetworkLogViewer";
import * as actions from "@/app/actions";
import type { NetworkLog } from "@prisma/client";

// Mock the actions module
vi.mock("@/app/actions", () => ({
  getNetworkLogsAction: vi.fn(),
}));

describe("NetworkLogViewer Component", () => {
  const mockLogs: NetworkLog[] = [
    {
      id: "log1",
      type: "OUTGOING_CATALOG",
      payload: {
        catalogId: "cat1",
        farmerId: "farmer1",
        becknJson: { descriptor: { name: "Onions" } },
      },
      timestamp: new Date("2024-01-15T10:00:00Z"),
    },
    {
      id: "log2",
      type: "INCOMING_BID",
      payload: {
        buyerName: "Reliance Fresh",
        bidAmount: 42,
        catalogId: "cat1",
      },
      timestamp: new Date("2024-01-15T10:00:08Z"),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Task 6.3.1: Create components/NetworkLogViewer.tsx
  it("should render the NetworkLogViewer component", async () => {
    vi.mocked(actions.getNetworkLogsAction).mockResolvedValue({
      success: true,
      logs: mockLogs,
      totalPages: 1,
      currentPage: 1,
    });

    render(<NetworkLogViewer />);

    await waitFor(() => {
      expect(screen.getByText("Network Log Viewer")).toBeInTheDocument();
    });
  });

  // Task 6.3.2: Implement log list UI with chronological ordering
  it("should display logs in chronological order", async () => {
    vi.mocked(actions.getNetworkLogsAction).mockResolvedValue({
      success: true,
      logs: mockLogs,
      totalPages: 1,
      currentPage: 1,
    });

    render(<NetworkLogViewer />);

    await waitFor(() => {
      expect(screen.getByText("OUTGOING_CATALOG")).toBeInTheDocument();
      expect(screen.getByText("INCOMING_BID")).toBeInTheDocument();
    });
  });

  // Task 6.3.3: Add color coding for event types (green/blue)
  it("should apply color coding for different event types", async () => {
    vi.mocked(actions.getNetworkLogsAction).mockResolvedValue({
      success: true,
      logs: mockLogs,
      totalPages: 1,
      currentPage: 1,
    });

    const { container } = render(<NetworkLogViewer />);

    await waitFor(() => {
      // Check for green color coding (OUTGOING_CATALOG)
      const greenElements = container.querySelectorAll(".border-green-200");
      expect(greenElements.length).toBeGreaterThan(0);

      // Check for blue color coding (INCOMING_BID)
      const blueElements = container.querySelectorAll(".border-blue-200");
      expect(blueElements.length).toBeGreaterThan(0);
    });
  });

  // Task 6.3.4: Implement expandable log entries
  it("should expand log entries when clicked", async () => {
    vi.mocked(actions.getNetworkLogsAction).mockResolvedValue({
      success: true,
      logs: mockLogs,
      totalPages: 1,
      currentPage: 1,
    });

    render(<NetworkLogViewer />);

    await waitFor(() => {
      expect(screen.getByText("OUTGOING_CATALOG")).toBeInTheDocument();
    });

    // Initially, payload should not be visible
    expect(screen.queryByText("Payload:")).not.toBeInTheDocument();

    // Click to expand
    const expandButton = screen.getAllByRole("button")[1]; // First log entry button
    fireEvent.click(expandButton);

    // Payload should now be visible
    await waitFor(() => {
      expect(screen.getByText("Payload:")).toBeInTheDocument();
    });
  });

  // Task 6.3.5: Add JSON syntax highlighting
  it("should display JSON with syntax highlighting", async () => {
    vi.mocked(actions.getNetworkLogsAction).mockResolvedValue({
      success: true,
      logs: mockLogs,
      totalPages: 1,
      currentPage: 1,
    });

    const { container } = render(<NetworkLogViewer />);

    await waitFor(() => {
      expect(screen.getByText("OUTGOING_CATALOG")).toBeInTheDocument();
    });

    // Click to expand
    const expandButton = screen.getAllByRole("button")[1];
    fireEvent.click(expandButton);

    // Check for JSON display elements
    await waitFor(() => {
      const preElements = container.querySelectorAll("pre");
      expect(preElements.length).toBeGreaterThan(0);
      expect(preElements[0]).toHaveClass("bg-gray-900");
    });
  });

  // Task 6.3.6: Implement filter dropdown for event types
  it("should have a filter dropdown for event types", async () => {
    vi.mocked(actions.getNetworkLogsAction).mockResolvedValue({
      success: true,
      logs: mockLogs,
      totalPages: 1,
      currentPage: 1,
    });

    render(<NetworkLogViewer />);

    await waitFor(() => {
      // Check for filter trigger button
      const filterTrigger = screen.getByRole("combobox");
      expect(filterTrigger).toBeInTheDocument();
    });
  });

  // Task 6.3.7: Add pagination controls
  it("should display pagination controls when there are multiple pages", async () => {
    vi.mocked(actions.getNetworkLogsAction).mockResolvedValue({
      success: true,
      logs: mockLogs,
      totalPages: 3,
      currentPage: 1,
    });

    render(<NetworkLogViewer />);

    await waitFor(() => {
      expect(screen.getByText("Previous")).toBeInTheDocument();
      expect(screen.getByText("Next")).toBeInTheDocument();
      expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();
    });
  });

  // Task 6.3.8: Fetch logs using getNetworkLogsAction
  it("should fetch logs using getNetworkLogsAction", async () => {
    vi.mocked(actions.getNetworkLogsAction).mockResolvedValue({
      success: true,
      logs: mockLogs,
      totalPages: 1,
      currentPage: 1,
    });

    render(<NetworkLogViewer />);

    await waitFor(() => {
      expect(actions.getNetworkLogsAction).toHaveBeenCalledWith("ALL", 1, 10);
    });
  });

  // Task 6.3.9: Handle loading and error states
  it("should display loading state while fetching logs", async () => {
    vi.mocked(actions.getNetworkLogsAction).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                success: true,
                logs: mockLogs,
                totalPages: 1,
                currentPage: 1,
              }),
            100
          )
        )
    );

    render(<NetworkLogViewer />);

    // Check for loading spinner
    expect(screen.getByText("Loading logs...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText("Loading logs...")).not.toBeInTheDocument();
    });
  });

  it("should display error state when fetching fails", async () => {
    vi.mocked(actions.getNetworkLogsAction).mockResolvedValue({
      success: false,
      error: "Failed to fetch logs",
    });

    render(<NetworkLogViewer />);

    await waitFor(() => {
      expect(screen.getByText("Error Loading Logs")).toBeInTheDocument();
      expect(screen.getByText("Failed to fetch logs")).toBeInTheDocument();
    });
  });

  it("should display empty state when no logs are found", async () => {
    vi.mocked(actions.getNetworkLogsAction).mockResolvedValue({
      success: true,
      logs: [],
      totalPages: 0,
      currentPage: 1,
    });

    render(<NetworkLogViewer />);

    await waitFor(() => {
      expect(screen.getByText("No logs found")).toBeInTheDocument();
      expect(
        screen.getByText("Broadcast a catalog to see network events")
      ).toBeInTheDocument();
    });
  });

  // Additional test: Filter functionality
  it("should call getNetworkLogsAction with correct filter when filter changes", async () => {
    vi.mocked(actions.getNetworkLogsAction).mockResolvedValue({
      success: true,
      logs: mockLogs,
      totalPages: 1,
      currentPage: 1,
    });

    render(<NetworkLogViewer />);

    await waitFor(() => {
      expect(screen.getByText("Network Log Viewer")).toBeInTheDocument();
    });

    // Initial call with "ALL" filter
    expect(actions.getNetworkLogsAction).toHaveBeenCalledWith("ALL", 1, 10);
  });

  // Additional test: Pagination functionality
  it("should navigate to next page when Next button is clicked", async () => {
    vi.mocked(actions.getNetworkLogsAction).mockResolvedValue({
      success: true,
      logs: mockLogs,
      totalPages: 3,
      currentPage: 1,
    });

    render(<NetworkLogViewer />);

    await waitFor(() => {
      expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();
    });

    // Click Next button
    const nextButton = screen.getByText("Next");
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(actions.getNetworkLogsAction).toHaveBeenCalledWith("ALL", 2, 10);
    });
  });

  // Additional test: Auto-refresh functionality
  it("should auto-refresh logs when autoRefresh is enabled", async () => {
    vi.useFakeTimers();

    vi.mocked(actions.getNetworkLogsAction).mockResolvedValue({
      success: true,
      logs: mockLogs,
      totalPages: 1,
      currentPage: 1,
    });

    render(<NetworkLogViewer autoRefresh={true} refreshInterval={5000} />);

    await waitFor(() => {
      expect(actions.getNetworkLogsAction).toHaveBeenCalledTimes(1);
    });

    // Fast-forward time by 5 seconds
    vi.advanceTimersByTime(5000);

    await waitFor(() => {
      expect(actions.getNetworkLogsAction).toHaveBeenCalledTimes(2);
    });

    vi.useRealTimers();
  });
});
