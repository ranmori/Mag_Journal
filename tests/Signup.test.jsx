import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "../src/Components/ThemeContext";

import { MemoryRouter } from "react-router-dom";

// module-scoped navigate mock used by the vi.mock below
let navigateMock = vi.fn();

// Mock react-router-dom's useNavigate before importing the component.
// Keep all other actual exports (MemoryRouter, etc.) by spreading the real module.
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

// import component after mocking react-router-dom
import Signup from "../src/pages/Signup";

const renderSignup = () => {
  return render(
    <ThemeProvider>
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    </ThemeProvider>
  );
};

describe("Signup component", () => {
  let fetchMock;

  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    vi.clearAllMocks();

    // reset navigate mock before each test
    navigateMock = vi.fn();

    fetchMock = vi.fn(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({
                  message: "Account created successfully!",
                  token: "fake-token",
                  user: {
                    id: "1",
                    name: "John Doe",
                    email: "test@example.com",
                  },
                }),
              }),
            50
          )
        )
    );

    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders all signup form elements", () => {
    renderSignup();
    expect(screen.getByText(/Magazine Journal/i)).toBeInTheDocument();
    expect(screen.getByText(/Create an Account/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Jane Doe/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/At least 8 characters, A-Z, a-z, 0-9/i)
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/repeat your password/i)
    ).toBeInTheDocument();
  });

  it("validate empty name field", async () => {
    const user = userEvent.setup();
    renderSignup();
    const form = screen.getByRole("form", { name: /signup-form/i });
    // submit the form to trigger onSubmit reliably in jsdom
    fireEvent.submit(form);
    // findByText waits for the element to appear
    expect(await screen.findByText(/Name is required/i)).toBeInTheDocument();
  });
  it("validate password requirements - number", async () => {
    const user = userEvent.setup();
    renderSignup();
    await user.type(screen.getByPlaceholderText(/jane doe/i), "Jane Doe");
    await user.type(
      screen.getByPlaceholderText(/you@example.com/i),
      "test@example.com"
    );
    await user.type(
      screen.getByPlaceholderText(/At least 8 characters, A-Z, a-z, 0-9/i),
      "Password"
    );

    const form = screen.getByRole("form", { name: /signup/i });
    fireEvent.submit(form);
    expect(
      await screen.findByText(/password must contain a number/i)
    ).toBeInTheDocument();
  });
  it("validates name minimum length", async () => {
    const user = userEvent.setup();
    renderSignup();

    await user.type(screen.getByPlaceholderText(/jane doe/i), "A");
    await user.click(screen.getByRole("button", { name: /sign up/i }));
    const form = screen.getByRole("form", { name: /signup/i });
    fireEvent.submit(form);
    expect(
      screen.getByText(/name must be at least 2 characters/i)
    ).toBeInTheDocument();
  });

  it("validates invalid email format", async () => {
    const user = userEvent.setup();
    renderSignup();

    await user.type(screen.getByPlaceholderText(/jane doe/i), "John Doe");
    await user.type(
      screen.getByPlaceholderText(/you@example.com/i),
      "invalid-email"
    );
    await user.click(screen.getByRole("button", { name: /sign up/i }));

    const form = screen.getByRole("form", { name: /signup/i });
    fireEvent.submit(form);
    expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
  });
  it("validates password requirements - lowercase", async () => {
    const user = userEvent.setup();
    renderSignup();

    await user.type(screen.getByPlaceholderText(/jane doe/i), "John Doe");
    await user.type(
      screen.getByPlaceholderText(/you@example.com/i),
      "test@example.com"
    );
    await user.type(
      screen.getByPlaceholderText(/at least 8 characters/i),
      "PASSWORD1"
    );
    await user.click(screen.getByRole("button", { name: /sign up/i }));
    const form = screen.getByRole("form", { name: /signup/i });
    fireEvent.submit(form);
    expect(
      screen.getByText(/password must contain a lowercase letter/i)
    ).toBeInTheDocument();
  });

  it("validates password requirements - uppercase", async () => {
    const user = userEvent.setup();
    renderSignup();

    await user.type(screen.getByPlaceholderText(/jane doe/i), "John Doe");
    await user.type(
      screen.getByPlaceholderText(/you@example.com/i),
      "test@example.com"
    );
    await user.type(
      screen.getByPlaceholderText(/at least 8 characters/i),
      "password1"
    );
    await user.click(screen.getByRole("button", { name: /sign up/i }));

    const form = screen.getByRole("form", { name: /signup/i });
    fireEvent.submit(form);
    expect(
      screen.getByText(/password must contain an uppercase letter/i)
    ).toBeInTheDocument();
  });

  it("validates password confirmation match", async () => {
    const user = userEvent.setup();
    renderSignup();

    await user.type(screen.getByPlaceholderText(/jane doe/i), "John Doe");
    await user.type(
      screen.getByPlaceholderText(/you@example.com/i),
      "test@example.com"
    );
    await user.type(
      screen.getByPlaceholderText(/at least 8 characters/i),
      "Password123"
    );
    await user.type(
      screen.getByPlaceholderText(/repeat your password/i),
      "Password456"
    );
    await user.click(screen.getByRole("button", { name: /sign up/i }));
    const form = screen.getByRole("form", { name: /signup/i });
    fireEvent.submit(form);
    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
  });

  // ...existing code...
  it("successfully signs up with valid data", async () => {
    const user = userEvent.setup();
    renderSignup();

    await user.type(screen.getByPlaceholderText(/jane doe/i), "John Doe");
    await user.type(
      screen.getByPlaceholderText(/you@example.com/i),
      "test@example.com"
    );
    await user.type(
      screen.getByPlaceholderText(/at least 8 characters/i),
      "Password123"
    );
    await user.type(
      screen.getByPlaceholderText(/repeat your password/i),
      "Password123"
    );

    const submitButton = screen.getByRole("button", { name: /sign up/i });
    await user.click(submitButton);

    // button should show loading state immediately
    expect(submitButton).toHaveTextContent(/creating account/i);
    expect(submitButton).toBeDisabled();

    await waitFor(
      () => {
        expect(screen.getByText(/signup successful/i)).toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    expect(sessionStorage.getItem("user")).toBeTruthy();
  });

  it("clears form after successful signup", async () => {
    const user = userEvent.setup();
    renderSignup();

    await user.type(screen.getByPlaceholderText(/jane doe/i), "John Doe");
    await user.type(
      screen.getByPlaceholderText(/you@example.com/i),
      "test@example.com"
    );
    await user.type(
      screen.getByPlaceholderText(/at least 8 characters/i),
      "Password123"
    );
    await user.type(
      screen.getByPlaceholderText(/repeat your password/i),
      "Password123"
    );

    const submitButton = screen.getByRole("button", { name: /sign up/i });
    await user.click(submitButton);

    await waitFor(
      () => {
        expect(screen.getByPlaceholderText(/jane doe/i)).toHaveValue("");
        expect(screen.getByPlaceholderText(/you@example.com/i)).toHaveValue("");
        expect(
          screen.getByPlaceholderText(/at least 8 characters/i)
        ).toHaveValue("");
        expect(
          screen.getByPlaceholderText(/repeat your password/i)
        ).toHaveValue("");
      },
      { timeout: 2000 }
    );
  });
  // ...existing code...
  it("clears field-specific errors on input change", async () => {
    const user = userEvent.setup();
    renderSignup();

    await user.click(screen.getByRole("button", { name: /sign up/i }));
    const form = screen.getByRole("form", { name: /signup/i });
    fireEvent.submit(form);
    expect(screen.getByText(/name is required/i)).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText(/jane doe/i), "John");

    expect(screen.queryByText(/name is required/i)).not.toBeInTheDocument();
  });

  it("toggles password visibility for both password fields", async () => {
    const user = userEvent.setup();
    renderSignup();

    const passwordInput = screen.getByPlaceholderText(/at least 8 characters/i);
    const confirmPasswordInput =
      screen.getByPlaceholderText(/repeat your password/i);

    expect(passwordInput).toHaveAttribute("type", "password");
    expect(confirmPasswordInput).toHaveAttribute("type", "password");

    // Find the eye icon button (exclude other buttons by aria-label)
    const eyeButton = screen
      .getAllByRole("button")
      .find((btn) =>
        btn.getAttribute("aria-label")?.toLowerCase()?.includes("show password")
      );

    await user.click(eyeButton);
    const form = screen.getByRole("form", { name: /signup/i });
    fireEvent.submit(form);

    expect(passwordInput).toHaveAttribute("type", "text");
    expect(confirmPasswordInput).toHaveAttribute("type", "text");
  });

  it("disables submit button while loading", async () => {
    const user = userEvent.setup();
    renderSignup();

    await user.type(screen.getByPlaceholderText(/jane doe/i), "John Doe");
    await user.type(
      screen.getByPlaceholderText(/you@example.com/i),
      "test@example.com"
    );
    await user.type(
      screen.getByPlaceholderText(/at least 8 characters/i),
      "Password123"
    );
    await user.type(
      screen.getByPlaceholderText(/repeat your password/i),
      "Password123"
    );

    const submitButton = screen.getByRole("button", { name: /sign up/i });
    await user.click(submitButton);

    const form = screen.getByRole("form", { name: /signup/i });
    fireEvent.submit(form);
    expect(submitButton).toBeDisabled();

    await waitFor(
      () => {
        expect(submitButton).not.toBeDisabled();
      },
      { timeout: 2000 }
    );
  });

  it("navigates to login page on sign in link click", async () => {
    const user = userEvent.setup();
    renderSignup();

    await user.click(screen.getByText(/sign in/i));

    expect(navigateMock).toHaveBeenCalledWith("./login");
  });

  it("displays security badge", () => {
    renderSignup();
    expect(
      screen.getByText(/🔒 Secured with JWT Authentication/i)
    ).toBeInTheDocument();
  });
});
