import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  Lock,
  Mail,
  Sparkles,
  User,
  X,
  AlertCircle,
} from 'lucide-react';
import ApiServices, {
  storeTokens,
  decodeTokenPayload,
} from '../services/ApiServices';
import { useGoogleLogin } from '@react-oauth/google';

interface LoginPageProps {
  onAuthenticated: (role: string) => void;
  onBackToLanding?: () => void;
  onClose?: () => void;
  initialMode?: 'login' | 'register';
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onAuthenticated,
  onBackToLanding,
  onClose,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot-password'>(initialMode);

  // Form Fields
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Password Reset State
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [showResetNewPassword, setShowResetNewPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetErrorMessage, setResetErrorMessage] = useState<string | null>(null);
  const [resetFieldErrors, setResetFieldErrors] = useState<Record<string, string>>({});

  // Google Registration Username Modal State
  const [googleModal, setGoogleModal] = useState<{
    isOpen: boolean;
    token: string;
    email: string;
    name: string;
    username: string;
    error?: string;
    isSubmitting?: boolean;
  } | null>(null);

  // Google Login Handler (Only used during Registration)
  const googleLoginHandler = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsGoogleSubmitting(true);
        setErrorMessage(null);

        const response = await ApiServices.googleLogin({
          token: tokenResponse.access_token,
          role: 'PARENT',
        });

        const result = response.data?.data || response.data;

        // If backend reports new user requires a username
        if (result?.requiresUsername) {
          setGoogleModal({
            isOpen: true,
            token: tokenResponse.access_token,
            email: result.email || '',
            name: result.name || '',
            username: (result.email || '').split('@')[0].replace(/[^a-zA-Z0-9_-]/g, ''),
          });
          return;
        }

        const accessToken =
          result.accessToken ||
          result.tokens?.accessToken ||
          result.tokens?.access_token;
        const refreshToken =
          result.refreshToken ||
          result.tokens?.refreshToken ||
          result.tokens?.refresh_token;

        if (accessToken && refreshToken) {
          storeTokens({ accessToken, refreshToken });
        } else if (accessToken) {
          storeTokens(accessToken);
        }

        const payload = accessToken ? decodeTokenPayload(accessToken) : null;
        const userRole =
          payload?.role ||
          result.user?.role ||
          result.user?.roleName ||
          'Parent';

        onAuthenticated(userRole);
      } catch (error: any) {
        console.error('Google Auth Error:', error);
        setErrorMessage(
          error?.message || 'Unable to sign in with Google. Please try again.'
        );
      } finally {
        setIsGoogleSubmitting(false);
      }
    },
    onError: (errorResponse) => {
      console.warn('Google Login Error:', errorResponse);
      setErrorMessage('Google sign-in was cancelled or failed.');
    },
  });

  const handleGoogleClick = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setErrorMessage(
        'Google Client ID is not configured yet. Please add VITE_GOOGLE_CLIENT_ID in frontend/.env'
      );
      return;
    }
    googleLoginHandler();
  };

  const handleCompleteGoogleRegistration = async () => {
    if (!googleModal) return;

    const trimmedUsername = googleModal.username.trim();
    const validationError = validateUsername(trimmedUsername);
    if (validationError) {
      setGoogleModal({ ...googleModal, error: validationError });
      return;
    }

    setGoogleModal({ ...googleModal, isSubmitting: true, error: undefined });

    try {
      const response = await ApiServices.googleLogin({
        token: googleModal.token,
        username: trimmedUsername,
        role: 'PARENT',
      });

      const result = response.data?.data || response.data;
      const accessToken =
        result.accessToken ||
        result.tokens?.accessToken ||
        result.tokens?.access_token;
      const refreshToken =
        result.refreshToken ||
        result.tokens?.refreshToken ||
        result.tokens?.refresh_token;

      if (accessToken && refreshToken) {
        storeTokens({ accessToken, refreshToken });
      } else if (accessToken) {
        storeTokens(accessToken);
      }

      const payload = accessToken ? decodeTokenPayload(accessToken) : null;
      const userRole =
        payload?.role ||
        result.user?.role ||
        result.user?.roleName ||
        'Parent';

      setGoogleModal(null);
      onAuthenticated(userRole);
    } catch (err: any) {
      console.error('Google Registration Error:', err);
      setGoogleModal({
        ...googleModal,
        isSubmitting: false,
        error: err?.message || 'Failed to complete registration with this username.',
      });
    }
  };

  const clearFieldError = (field: string) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  const handleBack = onBackToLanding || onClose;

  const validateUsername = (u: string): string | null => {
    const trimmed = u.trim();
    if (!trimmed) return 'Username is required.';
    if (trimmed.includes('.')) return "Username cannot contain dots ('.').";
    if (trimmed.includes(' ')) return 'Username cannot contain spaces.';
    if (trimmed.length < 3 || trimmed.length > 30) return 'Username must be between 3 and 30 characters.';
    if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]{1,28}[a-zA-Z0-9]$/.test(trimmed)) {
      return 'Username must start & end with alphanumeric characters and can contain _ or -.';
    }
    return null;
  };

  const passwordStrength = (() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  })();

  const handleModeChange = (nextMode: 'login' | 'register') => {
    setMode(nextMode);
    setErrorMessage(null);
    setFieldErrors({});
    setName('');
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    let hasError = false;
    const newFieldErrors: Record<string, string> = {};

    // Validate Username
    const usernameError = validateUsername(username);
    if (usernameError) {
      newFieldErrors.username = usernameError;
      hasError = true;
    }

    if (!password) {
      newFieldErrors.password = 'Please enter your password.';
      hasError = true;
    }

    if (mode === 'register') {
      if (!name.trim()) {
        newFieldErrors.name = 'Please enter your full name.';
        hasError = true;
      }

      if (!email.trim()) {
        newFieldErrors.email = 'Please enter your email address.';
        hasError = true;
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
          newFieldErrors.email = 'Please enter a valid email address.';
          hasError = true;
        }
      }

      if (password) {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$/;
        if (!passwordRegex.test(password)) {
          newFieldErrors.password =
            'Password must be at least 8 characters long with uppercase, lowercase, number, and special character.';
          hasError = true;
        } else if (password !== confirmPassword) {
          newFieldErrors.confirmPassword = 'Passwords do not match.';
          hasError = true;
        }
      }
    }

    if (hasError) {
      setFieldErrors(newFieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response =
        mode === 'login'
          ? await ApiServices.login({ username: username.trim(), password })
          : await ApiServices.register({
            name: name.trim(),
            username: username.trim(),
            email: email.trim(),
            password,
            role: 'Parent',
          });

      const result = response.data?.data || response.data || response;

      const accessToken =
        result.accessToken || result.tokens?.accessToken;
      const refreshToken =
        result.refreshToken || result.tokens?.refreshToken;

      if (accessToken && refreshToken) {
        storeTokens({ accessToken, refreshToken });
      } else {
        console.warn('Login successful but no tokens found in response:', result);
      }

      const payload = accessToken ? decodeTokenPayload(accessToken) : null;
      const userRole =
        payload?.role ||
        result.user?.role ||
        result.user?.roleName ||
        'Parent';

      onAuthenticated(userRole);
    } catch (error: any) {
      if (error?.message) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          mode === 'login'
            ? 'Invalid username or password. Please try again.'
            : 'Unable to create your account. Please try again.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResetErrorMessage(null);
    setResetFieldErrors({});

    const errs: Record<string, string> = {};
    if (!resetIdentifier.trim()) {
      errs.identifier = 'Please enter your account username.';
    }
    if (!resetNewPassword) {
      errs.newPassword = 'Please enter a new password.';
    } else if (resetNewPassword.length < 6) {
      errs.newPassword = 'Password must be at least 6 characters.';
    }
    if (!resetConfirmPassword) {
      errs.confirmPassword = 'Please confirm your new password.';
    } else if (resetNewPassword !== resetConfirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(errs).length > 0) {
      setResetFieldErrors(errs);
      return;
    }

    setResetSubmitting(true);
    try {
      await ApiServices.resetPassword({
        identifier: resetIdentifier.trim(),
        newPassword: resetNewPassword,
      });
      setResetSuccess(true);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to update password. Please check your username/email and try again.';
      setResetErrorMessage(msg);
    } finally {
      setResetSubmitting(false);
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-white overflow-y-auto relative shadow-2xl">
      <div className="w-full max-w-md mx-auto px-6 pt-8 pb-6 sm:px-8 flex-1 flex flex-col justify-start relative">

        {/* Header with Logo and Close Button */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-400 text-stone-900 flex items-center justify-center shadow-lg shadow-yellow-400/30">
              <GraduationCap size={20} />
            </div>
            <div>
              <div className="text-xl font-black tracking-tight">
                <span className="text-stone-900">Edu</span><span className="text-yellow-500">Path</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleBack}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors -mr-2"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-4">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-stone-900 mb-2">
            {mode === 'forgot-password' ? 'Reset Password' : mode === 'login' ? 'Welcome back' : 'Create an account'}
          </h2>
          <p className="text-stone-500 font-medium text-sm sm:text-base leading-relaxed">
            {mode === 'forgot-password'
              ? 'Enter your account username to create a new password.'
              : mode === 'login'
                ? 'Sign in with your username & password to access your dashboard.'
                : 'Register as a Parent to track assessments and empower your kids.'}
          </p>
        </div>

        {/* Mode Switcher */}
        {mode !== 'forgot-password' && (
          <div className="flex p-1 bg-stone-200/60 rounded-xl mb-4">
            <button
              type="button"
              onClick={() => handleModeChange('login')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${mode === 'login' ? 'bg-white text-yellow-700 shadow-sm' : 'text-stone-500 hover:text-stone-700'
                }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('register')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${mode === 'register' ? 'bg-white text-yellow-700 shadow-sm' : 'text-stone-500 hover:text-stone-700'
                }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* ── View: Forgot Password ── */}
        {mode === 'forgot-password' ? (
          <div>
            {resetSuccess ? (
              <div className="text-center space-y-4 py-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-stone-900">Password Updated!</h3>
                  <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                    Your password has been changed successfully. A security confirmation email has been dispatched to the registered email address.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setUsername(resetIdentifier);
                    setPassword('');
                    setMode('login');
                  }}
                  className="w-full h-11 rounded-xl font-bold text-sm bg-yellow-400 hover:bg-yellow-500 text-stone-900 shadow-lg shadow-yellow-400/25 flex items-center justify-center gap-2 mt-4 cursor-pointer"
                >
                  <span>Sign In with New Password</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-3" noValidate>
                {/* Identifier Field */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1 ml-1">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <User
                      size={18}
                      className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${resetFieldErrors.identifier ? 'text-red-400' : 'text-stone-400 group-focus-within:text-yellow-600'}`}
                    />
                    <input
                      type="text"
                      value={resetIdentifier}
                      onChange={(e) => {
                        setResetIdentifier(e.target.value);
                        setResetFieldErrors((prev) => ({ ...prev, identifier: undefined }));
                      }}
                      placeholder="e.g. rahul2026"
                      className={`w-full h-11 pl-11 pr-4 bg-white border-2 rounded-xl text-sm font-medium text-stone-900 outline-none transition-all placeholder:text-stone-400 ${resetFieldErrors.identifier
                        ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/20'
                        : 'border-stone-200 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-600/10'
                        }`}
                    />
                  </div>
                  {resetFieldErrors.identifier && (
                    <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{resetFieldErrors.identifier}</p>
                  )}
                  <p className="text-[10px] text-stone-400 mt-1 ml-1">
                    Security notification will be sent to the linked email address.
                  </p>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1 ml-1">
                    New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <Lock
                      size={18}
                      className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${resetFieldErrors.newPassword ? 'text-red-400' : 'text-stone-400 group-focus-within:text-yellow-600'}`}
                    />
                    <input
                      type={showResetNewPassword ? 'text' : 'password'}
                      value={resetNewPassword}
                      onChange={(e) => {
                        setResetNewPassword(e.target.value);
                        setResetFieldErrors((prev) => ({ ...prev, newPassword: undefined }));
                      }}
                      placeholder="Min. 6 characters"
                      className={`w-full h-11 pl-11 pr-12 bg-white border-2 rounded-xl text-sm font-medium text-stone-900 outline-none transition-all placeholder:text-stone-400 ${resetFieldErrors.newPassword
                        ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/20'
                        : 'border-stone-200 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-600/10'
                        }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetNewPassword(!showResetNewPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                    >
                      {showResetNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {resetFieldErrors.newPassword && (
                    <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{resetFieldErrors.newPassword}</p>
                  )}
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1 ml-1">
                    Confirm New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <Lock
                      size={18}
                      className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${resetFieldErrors.confirmPassword ? 'text-red-400' : 'text-stone-400 group-focus-within:text-yellow-600'}`}
                    />
                    <input
                      type={showResetConfirmPassword ? 'text' : 'password'}
                      value={resetConfirmPassword}
                      onChange={(e) => {
                        setResetConfirmPassword(e.target.value);
                        setResetFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                      }}
                      placeholder="Re-enter new password"
                      className={`w-full h-11 pl-11 pr-12 bg-white border-2 rounded-xl text-sm font-medium text-stone-900 outline-none transition-all placeholder:text-stone-400 ${resetFieldErrors.confirmPassword
                        ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/20'
                        : 'border-stone-200 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-600/10'
                        }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetConfirmPassword(!showResetConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                    >
                      {showResetConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {resetFieldErrors.confirmPassword && (
                    <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{resetFieldErrors.confirmPassword}</p>
                  )}
                </div>

                {/* Error Banner */}
                {resetErrorMessage && (
                  <div className="p-3 mt-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-600 flex items-start gap-2">
                    <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                    <span>{resetErrorMessage}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={resetSubmitting}
                  className="w-full h-11 mt-3 flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 active:scale-[0.98] text-stone-900 text-sm font-bold rounded-xl transition-all shadow-lg shadow-yellow-400/25 disabled:opacity-70 disabled:pointer-events-none cursor-pointer"
                >
                  {resetSubmitting ? (
                    <Loader2 size={18} className="animate-spin text-stone-900" />
                  ) : (
                    <>
                      <span>Update Password</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

                {/* Back to Login Button */}
                <button
                  type="button"
                  onClick={() => {
                    setResetErrorMessage(null);
                    setResetFieldErrors({});
                    setMode('login');
                  }}
                  className="w-full h-10 mt-2 flex items-center justify-center gap-1.5 text-stone-600 hover:text-stone-900 text-xs font-bold transition-colors cursor-pointer"
                >
                  <ArrowLeft size={16} />
                  <span>Back to Login</span>
                </button>
              </form>
            )}
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="space-y-3" noValidate>

            {/* Google Button ONLY in Sign Up mode */}
            {mode === 'register' && (
              <>
                <button
                  type="button"
                  onClick={handleGoogleClick}
                  disabled={isSubmitting || isGoogleSubmitting}
                  className="w-full h-11 flex items-center justify-center gap-3 bg-white border-2 border-stone-200 hover:border-yellow-300 hover:bg-stone-50 text-stone-700 text-sm font-bold rounded-xl transition-all shadow-sm active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isGoogleSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin text-yellow-600" />
                  ) : (
                    <svg viewBox="0 0 24 24" className="w-4 h-4">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                  )}
                  {isGoogleSubmitting ? 'Connecting with Google...' : 'Continue with Google'}
                </button>

                <div className="relative flex items-center justify-center pb-1">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-stone-200"></div>
                  </div>
                  <div className="relative bg-white px-4 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                    Or register with details
                  </div>
                </div>
              </>
            )}

            {/* Full Name (Sign Up Only) */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1 ml-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <User
                    size={18}
                    className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${fieldErrors.name ? 'text-red-400' : 'text-stone-400 group-focus-within:text-yellow-600'
                      }`}
                  />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      clearFieldError('name');
                    }}
                    placeholder="e.g. Rahul Sharma"
                    className={`w-full h-11 pl-11 pr-4 bg-white border-2 rounded-xl text-sm font-medium text-stone-900 outline-none transition-all placeholder:text-stone-400 ${fieldErrors.name
                      ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/20'
                      : 'border-stone-200 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-600/10'
                      }`}
                  />
                </div>
                {fieldErrors.name && (
                  <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{fieldErrors.name}</p>
                )}
              </div>
            )}

            {/* Username Field (Both Login & Register) */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 ml-1">
                Username <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <User
                  size={18}
                  className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${fieldErrors.username ? 'text-red-400' : 'text-stone-400 group-focus-within:text-yellow-600'
                    }`}
                />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    clearFieldError('username');
                  }}
                  placeholder="e.g. rahul2026"
                  className={`w-full h-11 pl-11 pr-4 bg-white border-2 rounded-xl text-sm font-medium text-stone-900 outline-none transition-all placeholder:text-stone-400 ${fieldErrors.username
                    ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/20'
                    : 'border-stone-200 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-600/10'
                    }`}
                />
              </div>
              {fieldErrors.username && (
                <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{fieldErrors.username}</p>
              )}
            </div>

            {/* Email Address (Sign Up Only) */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1 ml-1">
                  Parent Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <Mail
                    size={18}
                    className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${fieldErrors.email ? 'text-red-400' : 'text-stone-400 group-focus-within:text-yellow-600'
                      }`}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      clearFieldError('email');
                    }}
                    placeholder="parent@example.com"
                    className={`w-full h-11 pl-11 pr-4 bg-white border-2 rounded-xl text-sm font-medium text-stone-900 outline-none transition-all placeholder:text-stone-400 ${fieldErrors.email
                      ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/20'
                      : 'border-stone-200 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-600/10'
                      }`}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{fieldErrors.email}</p>
                )}
              </div>
            )}

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1 ml-1 mr-1">
                <label className="text-xs font-bold text-stone-700">
                  {mode === 'login' ? 'Password' : 'Create Password'} <span className="text-red-500">*</span>
                </label>
              </div>
              <div className="relative group">
                <Lock
                  size={18}
                  className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${fieldErrors.password ? 'text-red-400' : 'text-stone-400 group-focus-within:text-yellow-600'
                    }`}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearFieldError('password');
                  }}
                  placeholder="••••••••"
                  className={`w-full h-11 pl-11 pr-12 bg-white border-2 rounded-xl text-sm font-medium text-stone-900 outline-none transition-all placeholder:text-stone-400 ${fieldErrors.password
                    ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/20'
                    : 'border-stone-200 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-600/10'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 leading-tight">{fieldErrors.password}</p>
              )}

              {/* Forgot Password Link - positioned right below the password field (Admin Style) */}
              {mode === 'login' && (
                <div className="flex justify-end pt-2.5 pb-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setResetIdentifier(username);
                      setResetSuccess(false);
                      setResetErrorMessage(null);
                      setResetFieldErrors({});
                      setResetNewPassword('');
                      setResetConfirmPassword('');
                      setMode('forgot-password');
                    }}
                    className="text-xs font-bold text-yellow-600 hover:text-yellow-700 hover:underline transition-all cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              {mode === 'register' && password.length > 0 && (
                <div className="mt-2 flex gap-1.5">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`h-1.5 flex-1 rounded-full transition-colors ${step <= passwordStrength
                        ? passwordStrength < 3
                          ? 'bg-amber-400'
                          : 'bg-yellow-500'
                        : 'bg-stone-200'
                        }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password (Sign Up Only) */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1 ml-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <Lock
                    size={18}
                    className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${fieldErrors.confirmPassword ? 'text-red-400' : 'text-stone-400 group-focus-within:text-yellow-600'
                      }`}
                  />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      clearFieldError('confirmPassword');
                    }}
                    placeholder="••••••••"
                    className={`w-full h-11 pl-11 pr-12 bg-white border-2 rounded-xl text-sm font-medium text-stone-900 outline-none transition-all placeholder:text-stone-400 ${fieldErrors.confirmPassword
                      ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/20'
                      : 'border-stone-200 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-600/10'
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{fieldErrors.confirmPassword}</p>
                )}
              </div>
            )}

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3 mt-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-600 flex items-start gap-2">
                <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 mt-3 flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 active:scale-[0.98] text-stone-900 text-sm font-bold rounded-xl transition-all shadow-lg shadow-yellow-400/25 disabled:opacity-70 disabled:pointer-events-none cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 size={18} className="animate-spin text-stone-900" />
              ) : (
                <>
                  {mode === 'login' ? 'Log In' : 'Create Parent Account'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Google Username Prompt Modal */}
      {googleModal?.isOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-yellow-400 text-stone-900 flex items-center justify-center font-bold">
                  <User size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">Choose your Username</h3>
                  <p className="text-[11px] text-stone-500">Google Account: {googleModal.email}</p>
                </div>
              </div>
              <button
                onClick={() => setGoogleModal(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-stone-600 mb-4">
              To log in easily from any device using username & password, please choose a unique username for your EduJunction account:
            </p>

            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Desired Username <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={googleModal.username}
                    onChange={(e) =>
                      setGoogleModal({ ...googleModal, username: e.target.value, error: undefined })
                    }
                    placeholder="e.g. Rahul_2026"
                    className="w-full h-10 pl-10 pr-3 bg-white border-2 border-stone-200 focus:border-yellow-400 rounded-xl text-sm font-medium outline-hidden"
                  />
                </div>
                <p className="text-[10px] text-stone-400 mt-1">3-30 characters, no dots (.), no spaces.</p>
              </div>

              {googleModal.error && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-600">
                  {googleModal.error}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setGoogleModal(null)}
                className="flex-1 h-10 rounded-xl border border-stone-200 text-xs font-bold text-stone-600 hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCompleteGoogleRegistration}
                disabled={googleModal.isSubmitting}
                className="flex-1 h-10 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-stone-900 text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-yellow-400/20"
              >
                {googleModal.isSubmitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <span>Confirm & Join</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;