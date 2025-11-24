import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "../src/Components/ThemeContext";
import { MemoryRouter } from "react-router-dom";
import Login from "../src/pages/Login";

let mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderLogin = (props = {}) => {
  return render(
    <ThemeProvider>
      <MemoryRouter>
        <Login {...props} />
      </MemoryRouter>
    </ThemeProvider>
  );
};

describe("Login Component", () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    vi.clearAllMocks();

    // Mock console methods to prevent timeout from console.log
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});

    // Mock window.alert
    vi.stubGlobal("alert", vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("renders login form", () => {
    renderLogin();
    expect(screen.getByText(/Magazine Journal/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: /remember me/i })
    ).toBeInTheDocument();
  });

  it("validates empty email", async () => {
    const user = userEvent.setup();
    renderLogin();

    const signInButton = screen.getByRole("button", { name: /sign in/i });
    await user.click(signInButton);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  it("validates invalid email format", async () => {
    const user = userEvent.setup();
    renderLogin();

    const emailInput = screen.getByPlaceholderText(/you@example.com/i);
    await user.type(emailInput, "invalid-email");

    const signInButton = screen.getByRole("button", { name: /sign in/i });
    await user.click(signInButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
    });
  });

  it("validates empty password", async () => {
    const user = userEvent.setup();
    renderLogin();

    const emailInput = screen.getByPlaceholderText(/you@example.com/i);
    await user.type(emailInput, "test@example.com");

    const signInButton = screen.getByRole("button", { name: /sign in/i });
    await user.click(signInButton);

    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it("validates password minimum length", async () => {
    const user = userEvent.setup();
    renderLogin();

    const emailInput = screen.getByPlaceholderText(/you@example.com/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "short");

    const signInButton = screen.getByRole("button", { name: /sign in/i });
    await user.click(signInButton);

    await waitFor(() => {
      expect(
        screen.getByText(/password must be at least 8 characters/i)
      ).toBeInTheDocument();
    });
  });

  it("toggles password visibility", async () => {
    const user = userEvent.setup();
    renderLogin();

    const passwordInput = screen.getByLabelText(/password/i);
    expect(passwordInput).toHaveAttribute("type", "password");

    // Find the eye icon button - it's inside the password field container
    const allButtons = screen.getAllByRole("button");
    const eyeButton = allButtons.find((btn) => {
      const svg = btn.querySelector("svg");
      return svg && btn.className.includes("absolute");
    });

    expect(eyeButton).toBeDefined();

    await user.click(eyeButton);
    expect(passwordInput).toHaveAttribute("type", "text");

    await user.click(eyeButton);
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("successfully logs in with valid credentials", async () => {
    const user = userEvent.setup();
    const onLogin = vi.fn().mockResolvedValue(undefined);
    renderLogin({ onLogin });

    const emailInput = screen.getByPlaceholderText(/you@example.com/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "Password123");

    const signInButton = screen.getByRole("button", { name: /sign in/i });
    await user.click(signInButton);

    // Check loading state
    await waitFor(() => {
      expect(screen.getByText(/signing in/i)).toBeInTheDocument();
    });

    // Check success message
    await waitFor(
      () => {
        expect(screen.getByText(/login successful/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Verify onLogin was called with correct params
    expect(onLogin).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "Password123",
      remember: false,
    });
  });

  it("clears password field after successful login", async () => {
    const user = userEvent.setup();
    renderLogin();

    const emailInput = screen.getByPlaceholderText(/you@example.com/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "Password123");

    const signInButton = screen.getByRole("button", { name: /sign in/i });
    await user.click(signInButton);

    await waitFor(
      () => {
        expect(passwordInput).toHaveValue("");
      },
      { timeout: 3000 }
    );
  });

  it("disables submit button while loading", async () => {
    const user = userEvent.setup();
    renderLogin();

    const emailInput = screen.getByPlaceholderText(/you@example.com/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "Password123");

    const submitButton = screen.getByRole("button", { name: /sign in/i });
    await user.click(submitButton);

    // Should be disabled immediately after click
    expect(submitButton).toBeDisabled();

    // Should be enabled again after login completes
    await waitFor(
      () => {
        expect(submitButton).not.toBeDisabled();
      },
      { timeout: 3000 }
    );
  });

  it("shows alert when clicking create account", async () => {
    const user = userEvent.setup();
    renderLogin();

    const createAccountButton = screen.getByText(/create account/i);
    await user.click(createAccountButton);

    expect(window.alert).toHaveBeenCalledWith("Navigate to signup page");
  });

  it("stores token in sessionStorage when remember me is not checked", async () => {
    const user = userEvent.setup();
    renderLogin();

    const emailInput = screen.getByPlaceholderText(/you@example.com/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "Password123");

    const signInButton = screen.getByRole("button", { name: /sign in/i });
    await user.click(signInButton);

    await waitFor(
      () => {
        const token = sessionStorage.getItem("authToken");
        expect(token).toBeTruthy();
        expect(token).toContain("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9");
      },
      { timeout: 3000 }
    );

    expect(localStorage.getItem("authToken")).toBeNull();
  });

  it("stores token in localStorage when remember me is checked", async () => {
    const user = userEvent.setup();
    renderLogin();

    const emailInput = screen.getByPlaceholderText(/you@example.com/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const rememberCheckbox = screen.getByRole("checkbox", {
      name: /remember me/i,
    });

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "Password123");
    await user.click(rememberCheckbox);

    const signInButton = screen.getByRole("button", { name: /sign in/i });
    await user.click(signInButton);

    await waitFor(
      () => {
        const token = localStorage.getItem("authToken");
        expect(token).toBeTruthy();
        expect(token).toContain("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9");
      },
      { timeout: 3000 }
    );
  });

  it("shows forgot password alert", async () => {
    const user = userEvent.setup();
    renderLogin();

    const forgotButton = screen.getByText(/forgot\?/i);
    await user.click(forgotButton);

    expect(window.alert).toHaveBeenCalledWith("Password reset coming soon!");
  });
});
