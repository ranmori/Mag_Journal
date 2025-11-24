import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Signup from '../src/Pages/Signup';
import { ThemeProvider } from '../src/Components/ThemeContext';

const renderSignup = () => {
  return render(
    <ThemeProvider>
      <Signup />
    </ThemeProvider>
  );
};

describe('Signup Component', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders signup form with all elements', () => {
    renderSignup();
    
    expect(screen.getByText(/Magazine Journal/i)).toBeInTheDocument();
    expect(screen.getByText(/Create an Account/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/jane doe/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/at least 8 characters/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/repeat your password/i)).toBeInTheDocument();
  });

  it('validates empty name field', async () => {
    const user = userEvent.setup();
    renderSignup();
    
    await user.click(screen.getByRole('button', { name: /sign up/i }));
    
    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
  });

  it('validates name minimum length', async () => {
    const user = userEvent.setup();
    renderSignup();
    
    await user.type(screen.getByPlaceholderText(/jane doe/i), 'A');
    await user.click(screen.getByRole('button', { name: /sign up/i }));
    
    expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument();
  });

  it('validates invalid email format', async () => {
    const user = userEvent.setup();
    renderSignup();
    
    await user.type(screen.getByPlaceholderText(/jane doe/i), 'John Doe');
    await user.type(screen.getByPlaceholderText(/you@example.com/i), 'invalid-email');
    await user.click(screen.getByRole('button', { name: /sign up/i }));
    
    expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
  });

  it('validates password requirements - lowercase', async () => {
    const user = userEvent.setup();
    renderSignup();
    
    await user.type(screen.getByPlaceholderText(/jane doe/i), 'John Doe');
    await user.type(screen.getByPlaceholderText(/you@example.com/i), 'test@example.com');
    await user.type(screen.getByPlaceholderText(/at least 8 characters/i), 'PASSWORD1');
    await user.click(screen.getByRole('button', { name: /sign up/i }));
    
    expect(screen.getByText(/password must contain a lowercase letter/i)).toBeInTheDocument();
  });

  it('validates password requirements - uppercase', async () => {
    const user = userEvent.setup();
    renderSignup();
    
    await user.type(screen.getByPlaceholderText(/jane doe/i), 'John Doe');
    await user.type(screen.getByPlaceholderText(/you@example.com/i), 'test@example.com');
    await user.type(screen.getByPlaceholderText(/at least 8 characters/i), 'password1');
    await user.click(screen.getByRole('button', { name: /sign up/i }));
    
    expect(screen.getByText(/password must contain an uppercase letter/i)).toBeInTheDocument();
  });

  it('validates password requirements - number', async () => {
    const user = userEvent.setup();
    renderSignup();
    
    await user.type(screen.getByPlaceholderText(/jane doe/i), 'John Doe');
    await user.type(screen.getByPlaceholderText(/you@example.com/i), 'test@example.com');
    await user.type(screen.getByPlaceholderText(/at least 8 characters/i), 'Password');
    await user.click(screen.getByRole('button', { name: /sign up/i }));
    
    expect(screen.getByText(/password must contain a number/i)).toBeInTheDocument();
  });

  it('validates password confirmation match', async () => {
    const user = userEvent.setup();
    renderSignup();
    
    await user.type(screen.getByPlaceholderText(/jane doe/i), 'John Doe');
    await user.type(screen.getByPlaceholderText(/you@example.com/i), 'test@example.com');
    await user.type(screen.getByPlaceholderText(/at least 8 characters/i), 'Password123');
    await user.type(screen.getByPlaceholderText(/repeat your password/i), 'Password456');
    await user.click(screen.getByRole('button', { name: /sign up/i }));
    
    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
  });

  it('successfully signs up with valid data', async () => {
    const user = userEvent.setup();
    renderSignup();
    
    await user.type(screen.getByPlaceholderText(/jane doe/i), 'John Doe');
    await user.type(screen.getByPlaceholderText(/you@example.com/i), 'test@example.com');
    await user.type(screen.getByPlaceholderText(/at least 8 characters/i), 'Password123');
    await user.type(screen.getByPlaceholderText(/repeat your password/i), 'Password123');
    await user.click(screen.getByRole('button', { name: /sign up/i }));
    
    expect(screen.getByText(/creating account/i)).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText(/signup successful/i)).toBeInTheDocument();
    }, { timeout: 2000 });
    
    expect(sessionStorage.getItem('authToken')).toBeTruthy();
  });

  it('clears form after successful signup', async () => {
    const user = userEvent.setup();
    renderSignup();
    
    await user.type(screen.getByPlaceholderText(/jane doe/i), 'John Doe');
    await user.type(screen.getByPlaceholderText(/you@example.com/i), 'test@example.com');
    await user.type(screen.getByPlaceholderText(/at least 8 characters/i), 'Password123');
    await user.type(screen.getByPlaceholderText(/repeat your password/i), 'Password123');
    await user.click(screen.getByRole('button', { name: /sign up/i }));
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/jane doe/i)).toHaveValue('');
      expect(screen.getByPlaceholderText(/you@example.com/i)).toHaveValue('');
      expect(screen.getByPlaceholderText(/at least 8 characters/i)).toHaveValue('');
      expect(screen.getByPlaceholderText(/repeat your password/i)).toHaveValue('');
    }, { timeout: 2000 });
  });

  it('clears field-specific errors on input change', async () => {
    const user = userEvent.setup();
    renderSignup();
    
    await user.click(screen.getByRole('button', { name: /sign up/i }));
    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    
    await user.type(screen.getByPlaceholderText(/jane doe/i), 'John');
    expect(screen.queryByText(/name is required/i)).not.toBeInTheDocument();
  });

  it('toggles password visibility for both password fields', async () => {
    const user = userEvent.setup();
    renderSignup();
    
    const passwordInput = screen.getByPlaceholderText(/at least 8 characters/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/repeat your password/i);
    
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    
    // Find the eye icon button
    const toggleButtons = screen.getAllByRole('button');
    const eyeButton = toggleButtons.find(btn => 
      btn.querySelector('svg') && !btn.textContent.includes('Sign up')
    );
    
    await user.click(eyeButton);
    
    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(confirmPasswordInput).toHaveAttribute('type', 'text');
  });

  it('disables submit button while loading', async () => {
    const user = userEvent.setup();
    renderSignup();
    
    await user.type(screen.getByPlaceholderText(/jane doe/i), 'John Doe');
    await user.type(screen.getByPlaceholderText(/you@example.com/i), 'test@example.com');
    await user.type(screen.getByPlaceholderText(/at least 8 characters/i), 'Password123');
    await user.type(screen.getByPlaceholderText(/repeat your password/i), 'Password123');
    
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    await user.click(submitButton);
    
    expect(submitButton).toBeDisabled();
    
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    }, { timeout: 2000 });
  });

  it('navigates to login page on sign in link click', async () => {
    const user = userEvent.setup();
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    renderSignup();
    
    await user.click(screen.getByText(/sign in/i));
    
    expect(alertMock).toHaveBeenCalledWith('Navigate to login page');
    alertMock.mockRestore();
  });

  it('displays security badge', () => {
    renderSignup();
    expect(screen.getByText(/🔒 Secured with JWT Authentication/i)).toBeInTheDocument();
  });
});