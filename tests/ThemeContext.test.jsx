import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider, useTheme } from "../src/Components/ThemeContext";

// Test component to access theme context
const TestComponent = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
};

describe("ThemeContext", () => {
  let matchMediaMock;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");

    // Setup default matchMedia mock
    matchMediaMock = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(), // Deprecated but some browsers still use it
      removeListener: vi.fn(), // Deprecated but some browsers still use it
    }));

    window.matchMedia = matchMediaMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("provides default light theme", async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Wait for useEffect to complete
    await waitFor(() => {
      expect(screen.getByTestId("current-theme")).toHaveTextContent("light");
    });

    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("loads saved theme from localStorage", async () => {
    localStorage.setItem("theme", "dark");

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Wait for useEffect to load from localStorage
    await waitFor(() => {
      expect(screen.getByTestId("current-theme")).toHaveTextContent("dark");
    });

    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("toggles theme between light and dark", async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Wait for initial theme to load
    await waitFor(() => {
      expect(screen.getByTestId("current-theme")).toHaveTextContent("light");
    });

    // Toggle to dark
    await user.click(screen.getByRole("button", { name: /toggle theme/i }));

    expect(screen.getByTestId("current-theme")).toHaveTextContent("dark");
    expect(localStorage.getItem("theme")).toBe("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");

    // Toggle back to light
    await user.click(screen.getByRole("button", { name: /toggle theme/i }));

    expect(screen.getByTestId("current-theme")).toHaveTextContent("light");
    expect(localStorage.getItem("theme")).toBe("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("respects system dark mode preference when no saved theme", async () => {
    // Override matchMedia to return dark mode preference
    matchMediaMock.mockImplementation((query) => ({
      matches: query === "(prefers-color-scheme: dark)",
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    }));

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Wait for useEffect to apply system preference
    await waitFor(() => {
      expect(screen.getByTestId("current-theme")).toHaveTextContent("dark");
    });

    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("prefers localStorage over system preference", async () => {
    localStorage.setItem("theme", "light");

    // Set system preference to dark
    matchMediaMock.mockImplementation((query) => ({
      matches: query === "(prefers-color-scheme: dark)",
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    }));

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Should use localStorage value (light) not system preference (dark)
    await waitFor(() => {
      expect(screen.getByTestId("current-theme")).toHaveTextContent("light");
    });
  });

  it("throws error when useTheme is used outside provider", () => {
    // Suppress console.error for this test
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow("useTheme must be used within a ThemeProvider");

    consoleError.mockRestore();
  });

  it("sets data-theme attribute on document element", async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Wait for initial theme
    await waitFor(() => {
      expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    });

    // Toggle theme
    await user.click(screen.getByRole("button", { name: /toggle theme/i }));

    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");

    // Toggle back
    await user.click(screen.getByRole("button", { name: /toggle theme/i }));

    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("persists theme changes to localStorage", async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId("current-theme")).toHaveTextContent("light");
    });

    // Initially no theme in localStorage (or it defaults to light)
    expect(localStorage.getItem("theme")).toBeNull();

    // Toggle to dark
    await user.click(screen.getByRole("button", { name: /toggle theme/i }));

    // Should save to localStorage
    expect(localStorage.getItem("theme")).toBe("dark");

    // Toggle to light
    await user.click(screen.getByRole("button", { name: /toggle theme/i }));

    // Should update localStorage
    expect(localStorage.getItem("theme")).toBe("light");
  });

  it("maintains theme state across re-renders", async () => {
    const user = userEvent.setup();

    const { rerender } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Wait for initial theme
    await waitFor(() => {
      expect(screen.getByTestId("current-theme")).toHaveTextContent("light");
    });

    // Toggle theme
    await user.click(screen.getByRole("button", { name: /toggle theme/i }));

    expect(screen.getByTestId("current-theme")).toHaveTextContent("dark");

    // Re-render
    rerender(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Theme should still be dark (loaded from localStorage)
    await waitFor(() => {
      expect(screen.getByTestId("current-theme")).toHaveTextContent("dark");
    });
  });

  it("handles multiple theme toggles correctly", async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("current-theme")).toHaveTextContent("light");
    });

    const toggleButton = screen.getByRole("button", { name: /toggle theme/i });

    // Toggle multiple times
    await user.click(toggleButton);
    expect(screen.getByTestId("current-theme")).toHaveTextContent("dark");

    await user.click(toggleButton);
    expect(screen.getByTestId("current-theme")).toHaveTextContent("light");

    await user.click(toggleButton);
    expect(screen.getByTestId("current-theme")).toHaveTextContent("dark");

    await user.click(toggleButton);
    expect(screen.getByTestId("current-theme")).toHaveTextContent("light");

    // Final state should be saved
    expect(localStorage.getItem("theme")).toBe("light");
  });
});
