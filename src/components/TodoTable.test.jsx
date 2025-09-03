// TodoTable.test.jsx
import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import TodoTable from "./TodoTable";

// Mock fetch globally
global.fetch = jest.fn();

// Store observer instance
let observerInstance;

// Mock IntersectionObserver
class IntersectionObserverMock {
  constructor(callback) {
    this.callback = callback;
    observerInstance = this; // store instance to trigger manually
  }
  observe() {}
  unobserve() {}
  disconnect() {} // normal method for spyOn
  trigger(entries = [{ isIntersecting: true }]) {
    this.callback(entries);
  }
}
global.IntersectionObserver = IntersectionObserverMock;

describe("TodoTable", () => {
  const mockTodos = Array.from({ length: 50 }, (_, i) => ({
    userId: 1,
    id: i + 1,
    title: `Todo ${i + 1}`,
    completed: i % 2 === 0,
  }));

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("shows loading initially", async () => {
    fetch.mockResolvedValueOnce({ json: () => Promise.resolve(mockTodos) });

    render(<TodoTable />);
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();

    await waitFor(() => expect(screen.getByText("Todo List")).toBeInTheDocument());
  });

  test("renders todos after fetch", async () => {
    fetch.mockResolvedValueOnce({ json: () => Promise.resolve(mockTodos) });

    render(<TodoTable />);

    await waitFor(() => expect(screen.getByText("Todo 1")).toBeInTheDocument());

    // First 20 rows only
    expect(screen.getByText("Todo 20")).toBeInTheDocument();
    expect(screen.queryByText("Todo 21")).not.toBeInTheDocument();

    // Completed status
    expect(screen.getAllByText("Yes").length).toBeGreaterThan(0);
    expect(screen.getAllByText("No").length).toBeGreaterThan(0);
  });

  test("handles fetch error gracefully", async () => {
    fetch.mockRejectedValueOnce(new Error("API Error"));

    render(<TodoTable />);

    // Wait for loading to disappear
    await waitFor(() => expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument());

    // No todos rendered
    expect(screen.queryByText("Todo 1")).not.toBeInTheDocument();
  });

  test("loads more todos on intersection", async () => {
    fetch.mockResolvedValueOnce({ json: () => Promise.resolve(mockTodos) });

    render(<TodoTable />);

    await waitFor(() => expect(screen.getByText("Todo 1")).toBeInTheDocument());

    const loader = screen.getByText(/Loading more.../i);
    expect(loader).toBeInTheDocument();

    // Trigger IntersectionObserver
    act(() => {
      observerInstance.trigger([{ isIntersecting: true }]);
    });

    await waitFor(() => expect(screen.getByText("Todo 21")).toBeInTheDocument());
  });
test("hides loader when all todos loaded", async () => {
  fetch.mockResolvedValueOnce({ json: () => Promise.resolve(mockTodos) });

  render(<TodoTable />);

  // Wait for initial load
  await screen.findByText("Todo 1");

  // Keep triggering observer until all todos are visible
  let lastTodoVisible = false;
  while (!lastTodoVisible) {
    act(() => {
      observerInstance.trigger([{ isIntersecting: true }]);
    });

    try {
      await screen.findByText(/Todo 50/i);
      lastTodoVisible = true;
    } catch {
      // not yet visible, trigger again
    }
  }

  // Loader should not exist
  expect(screen.queryByText(/Loading more.../i)).not.toBeInTheDocument();
});


  test("disconnects observer on unmount", async () => {
    const disconnectSpy = jest.spyOn(IntersectionObserverMock.prototype, "disconnect");

    fetch.mockResolvedValueOnce({ json: () => Promise.resolve(mockTodos) });

    const { unmount } = render(<TodoTable />);

    await waitFor(() => expect(screen.getByText("Todo 1")).toBeInTheDocument());

    unmount();
    expect(disconnectSpy).toHaveBeenCalled();
  });
});
