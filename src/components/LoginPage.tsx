import React, { useEffect, useState, useMemo } from 'react';
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
  Users,
  Info,
  BookOpen,
  X,
  AlertCircle,
  RefreshCw,
  Calculator,
  KeyRound,
  Send,
} from 'lucide-react';
import ApiServices, {
  storeTokens,
  clearTokens,
  decodeTokenPayload,
} from '../services/ApiServices';
import { useGoogleLogin } from '@react-oauth/google';

interface MasterOption {
  id: number;
  name: string;
}

interface LoginPageProps {
  onAuthenticated: (role: string) => void;
  onBackToLanding?: () => void;
  onClose?: () => void;
  initialMode?: 'login' | 'register';
  initialPersona?: 'parent' | 'student';
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onAuthenticated,
  onBackToLanding,
  onClose,
  initialMode = 'login',
  initialPersona = 'parent',
}) => {
  const [selectedPersona, setSelectedPersona] = useState<'parent' | 'student'>(initialPersona);
  const [mode, setMode] = useState<'login' | 'register' | 'forgot-password'>(initialMode);

  useEffect(() => {
    if (initialPersona) {
      setSelectedPersona(initialPersona);
    }
  }, [initialPersona]);

  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
    }
  }, [initialMode]);

  // Form Fields
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [targetBoard, setTargetBoard] = useState('');
  const [classGrade, setClassGrade] = useState('');

  // Dynamic Database Masters
  const [dbBoards, setDbBoards] = useState<MasterOption[]>([]);
  const [dbClasses, setDbClasses] = useState<MasterOption[]>([]);
  const [boardClassesMap, setBoardClassesMap] = useState<Record<string, string[]>>({});
  const [isLoadingMasters, setIsLoadingMasters] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoadingMasters(true);
    ApiServices.getBoardClassDropdown()
      .then((res: any) => {
        if (!isMounted) return;
        const fetchedBoards: MasterOption[] = res?.boards || res?.data?.boards || [];
        const fetchedClasses: MasterOption[] = res?.classes || res?.classGrades || res?.data?.classes || res?.data?.classGrades || [];
        const fetchedMap = res?.boardClassesMap || res?.data?.boardClassesMap || {};

        setDbBoards(fetchedBoards);
        setDbClasses(fetchedClasses);
        if (fetchedMap) setBoardClassesMap(fetchedMap);
      })
      .catch((err) => {
        console.error('Failed to fetch dynamic board/class masters:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingMasters(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const availableClasses = useMemo(() => {
    if (targetBoard && boardClassesMap[targetBoard] && boardClassesMap[targetBoard].length > 0) {
      const allowed = boardClassesMap[targetBoard];
      return dbClasses.filter((c) => allowed.includes(c.name));
    }
    return dbClasses;
  }, [targetBoard, boardClassesMap, dbClasses]);

  // If selected targetBoard changes, check if classGrade is still valid
  useEffect(() => {
    if (classGrade && availableClasses.length > 0) {
      const exists = availableClasses.some((c) => c.name === classGrade);
      if (!exists) {
        setClassGrade('');
      }
    }
  }, [availableClasses, classGrade]);

  // Captcha State
  const [captchaData, setCaptchaData] = useState<{ captchaId: string; question: string } | null>(null);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [isCaptchaLoading, setIsCaptchaLoading] = useState(false);

  const fetchCaptcha = async () => {
    try {
      setIsCaptchaLoading(true);
      const res = await ApiServices.getCaptcha();
      if (res && res.captchaId && res.question) {
        setCaptchaData(res);
        setCaptchaAnswer('');
      }
    } catch (err) {
      console.error('Failed to load captcha', err);
    } finally {
      setIsCaptchaLoading(false);
    }
  };

  useEffect(() => {
    if (mode === 'login' || mode === 'register') {
      fetchCaptcha();
    }
  }, [mode]);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Password Reset State (OTP Flow)
  const [resetStep, setResetStep] = useState<'ENTER_IDENTIFIER' | 'VERIFY_OTP'>('ENTER_IDENTIFIER');
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [resetMaskedEmail, setResetMaskedEmail] = useState<string | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [showResetNewPassword, setShowResetNewPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetErrorMessage, setResetErrorMessage] = useState<string | null>(null);
  const [resetFieldErrors, setResetFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [resendCountdown]);

  // Google Registration Modal State
  const [googleModal, setGoogleModal] = useState<{
    isOpen: boolean;
    token: string;
    email: string;
    name: string;
    username: string;
    role: 'parent' | 'student';
    targetBoard?: string;
    classGrade?: string;
    error?: string;
    isSubmitting?: boolean;
  } | null>(null);

  // Google Login Handler (Supported for both Parent & Student)
  const googleLoginHandler = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsGoogleSubmitting(true);
        setErrorMessage(null);

        const currentRoleParam = selectedPersona === 'student' ? 'STUDENT' : 'PARENT';
        const response = await ApiServices.googleLogin({
          token: tokenResponse.access_token,
          role: currentRoleParam,
        });

        const result = response.data?.data || response.data || response;

        // If backend reports new parent user requires a username
        if (selectedPersona === 'parent' && result?.requiresUsername) {
          setGoogleModal({
            isOpen: true,
            token: tokenResponse.access_token,
            email: result.email || '',
            name: result.name || '',
            username: (result.email || '').split('@')[0].replace(/[^a-zA-Z0-9_-]/g, ''),
            role: 'parent',
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

        const payload = accessToken ? decodeTokenPayload(accessToken) : null;
        const userRole =
          payload?.role ||
          result.user?.role ||
          result.user?.roleName ||
          (selectedPersona === 'student' ? 'Student' : 'Parent');

        const normalizedRole = (userRole || '').toString().toUpperCase();

        if (selectedPersona === 'parent' && normalizedRole === 'STUDENT') {
          clearTokens();
          setErrorMessage('This Google account is registered as a Student. Please switch to the "Student" tab to sign in.');
          return;
        }

        if (selectedPersona === 'student' && normalizedRole === 'PARENT') {
          clearTokens();
          setErrorMessage('This Google account is registered as a Parent. Please switch to the "Parent" tab or sign in with your student credentials.');
          return;
        }

        if (accessToken && refreshToken) {
          storeTokens({ accessToken, refreshToken });
        } else if (accessToken) {
          storeTokens(accessToken);
        }

        onAuthenticated(userRole);
      } catch (error: any) {
        console.error('Google Auth Error:', error);
        setErrorMessage(
          error?.message || error?.response?.data?.message || 'Unable to sign in with Google. Please try again.'
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

    if (googleModal.role === 'student') {
      if (!googleModal.targetBoard) {
        setGoogleModal({ ...googleModal, error: 'Please select your board to continue.' });
        return;
      }
      if (!googleModal.classGrade) {
        setGoogleModal({ ...googleModal, error: 'Please select your class / grade to continue.' });
        return;
      }
    }

    setGoogleModal({ ...googleModal, isSubmitting: true, error: undefined });

    try {
      const response = await ApiServices.googleLogin({
        token: googleModal.token,
        username: trimmedUsername,
        role: googleModal.role === 'student' ? 'STUDENT' : 'PARENT',
        targetBoard: googleModal.targetBoard,
        classGrade: googleModal.classGrade,
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
        (googleModal.role === 'student' ? 'Student' : 'Parent');

      setGoogleModal(null);
      onAuthenticated(userRole);
    } catch (err: any) {
      console.error('Google Registration Error:', err);
      setGoogleModal({
        ...googleModal,
        isSubmitting: false,
        error: err?.message || err?.response?.data?.message || 'Failed to complete registration with this username.',
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

  const handlePersonaChange = (persona: 'parent' | 'student') => {
    setSelectedPersona(persona);
    setErrorMessage(null);
    setFieldErrors({});
    setTargetBoard('');
    setClassGrade('');
  };

  const handleModeChange = (nextMode: 'login' | 'register') => {
    setMode(nextMode);
    setErrorMessage(null);
    setFieldErrors({});
    setName('');
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setTargetBoard('');
    setClassGrade('');
    setCaptchaAnswer('');
    fetchCaptcha();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    let hasError = false;
    const newFieldErrors: Record<string, string> = {};

    // Validate Username or Email
    if (mode === 'login') {
      const trimmed = username.trim();
      if (!trimmed) {
        newFieldErrors.username = 'Please enter your username or email.';
        hasError = true;
      } else if (trimmed.includes(' ')) {
        newFieldErrors.username = 'Username or email cannot contain spaces.';
        hasError = true;
      } else if (trimmed.includes('@')) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmed)) {
          newFieldErrors.username = 'Please enter a valid email address.';
          hasError = true;
        }
      }
    } else {
      const usernameError = validateUsername(username);
      if (usernameError) {
        newFieldErrors.username = usernameError;
        hasError = true;
      }
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

      if (selectedPersona === 'student') {
        if (!targetBoard) {
          newFieldErrors.targetBoard = 'Please select your board.';
          hasError = true;
        }
        if (!classGrade) {
          newFieldErrors.classGrade = 'Please select your class / grade.';
          hasError = true;
        }
      }
    }

    // Validate Math Captcha
    if (!captchaAnswer.trim()) {
      newFieldErrors.captcha = 'Please enter the answer to the math challenge.';
      hasError = true;
    }

    if (hasError) {
      setFieldErrors(newFieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const roleToSend = selectedPersona === 'student' ? 'STUDENT' : 'PARENT';
      const registerPayload: any = {
        name: name.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
        role: roleToSend,
        captchaId: captchaData?.captchaId,
        captchaAnswer: captchaAnswer.trim(),
      };
      if (selectedPersona === 'student') {
        registerPayload.targetBoard = targetBoard;
        registerPayload.classGrade = classGrade;
      }

      const response =
        mode === 'login'
          ? await ApiServices.login({
            username: username.trim(),
            password,
            captchaId: captchaData?.captchaId,
            captchaAnswer: captchaAnswer.trim(),
          })
          : await ApiServices.register(registerPayload);

      const result = response.data?.data || response.data || response;

      const accessToken =
        result.accessToken || result.tokens?.accessToken;
      const refreshToken =
        result.refreshToken || result.tokens?.refreshToken;

      const payload = accessToken ? decodeTokenPayload(accessToken) : null;
      const userRole =
        payload?.role ||
        result.user?.role ||
        result.user?.roleName ||
        'Parent';

      const normalizedRole = (userRole || '').toString().toUpperCase();

      // Strict Persona / Role Validation
      if (mode === 'login') {
        if (selectedPersona === 'parent' && normalizedRole === 'STUDENT') {
          clearTokens();
          fetchCaptcha();
          setErrorMessage('This account is registered as a Student. Please select the "Student" tab above to sign in.');
          return;
        }

        if (selectedPersona === 'student' && normalizedRole !== 'STUDENT') {
          clearTokens();
          fetchCaptcha();
          setErrorMessage('This account is registered as a Parent. Please select the "Parent" tab above to sign in.');
          return;
        }
      }

      if (accessToken && refreshToken) {
        storeTokens({ accessToken, refreshToken });
      } else {
        console.warn('Login successful but no tokens found in response:', result);
      }

      onAuthenticated(userRole);
    } catch (error: any) {
      fetchCaptcha();
      const serverMsg = error?.response?.data?.error?.message || error?.response?.data?.message || error?.message;
      if (serverMsg) {
        setErrorMessage(serverMsg);
      } else {
        setErrorMessage(
          mode === 'login'
            ? 'Invalid username, password, or captcha answer. Please try again.'
            : 'Unable to create your account. Please check the details and try again.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendOtp = async (isResend = false) => {
    setResetErrorMessage(null);
    setResetFieldErrors({});

    const trimmed = resetIdentifier.trim();
    if (!trimmed) {
      setResetFieldErrors({ identifier: 'Please enter your account username or email.' });
      return;
    }

    setIsSendingOtp(true);
    try {
      const response = await ApiServices.sendResetOtp({ identifier: trimmed });
      const data = response.data?.data || response.data || {};
      setResetMaskedEmail(data.maskedEmail || 'your registered email');
      setResetStep('VERIFY_OTP');
      setResendCountdown(60);
      if (isResend) {
        setResetOtp('');
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to send OTP. Please verify your username and try again.';
      setResetErrorMessage(msg);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResetErrorMessage(null);
    setResetFieldErrors({});

    const errs: Record<string, string> = {};
    if (!resetOtp.trim()) {
      errs.otp = 'Please enter the 6-digit OTP code.';
    } else if (resetOtp.trim().length !== 6 || !/^\d{6}$/.test(resetOtp.trim())) {
      errs.otp = 'OTP must be a 6-digit number.';
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
        otp: resetOtp.trim(),
        newPassword: resetNewPassword,
      });
      setResetSuccess(true);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to update password. Please verify the OTP and try again.';
      setResetErrorMessage(msg);
    } finally {
      setResetSubmitting(false);
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-white overflow-y-auto relative shadow-2xl">
      <div className="w-full max-w-lg mx-auto px-6 py-6 sm:px-8 sm:py-8 flex-1 flex flex-col justify-start relative">

        {/* Header with Logo, Persona Switcher on right, and Close Button */}
        <div className="flex items-center justify-between mb-4 sm:mb-5 pb-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-yellow-400 text-stone-900 flex items-center justify-center shadow-xs shadow-yellow-400/30">
              <GraduationCap size={18} />
            </div>
            <div>
              <div className="text-xl font-black tracking-tight">
                <span className="text-stone-900">Edu</span><span className="text-yellow-500">Junction</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Minimal Bullet/Pill Persona Switcher in Header */}
            {mode !== 'forgot-password' && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handlePersonaChange('parent')}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${selectedPersona === 'parent'
                    ? 'bg-yellow-400 text-stone-950 shadow-xs font-black ring-1 ring-yellow-500/40'
                    : 'bg-stone-100 text-stone-600 hover:text-stone-900 border border-stone-200 hover:bg-stone-200/60'
                    }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full transition-colors ${selectedPersona === 'parent' ? 'bg-stone-950' : 'bg-stone-300'}`} />
                  <Users size={12} className={selectedPersona === 'parent' ? 'text-stone-950' : 'text-stone-400'} />
                  <span>Parent</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePersonaChange('student')}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${selectedPersona === 'student'
                    ? 'bg-yellow-400 text-stone-950 shadow-xs font-black ring-1 ring-yellow-500/40'
                    : 'bg-stone-100 text-stone-600 hover:text-stone-900 border border-stone-200 hover:bg-stone-200/60'
                    }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full transition-colors ${selectedPersona === 'student' ? 'bg-stone-950' : 'bg-stone-300'}`} />
                  <GraduationCap size={12} className={selectedPersona === 'student' ? 'text-stone-950' : 'text-stone-400'} />
                  <span>Student</span>
                </button>
              </div>
            )}

            <button
              onClick={handleBack}
              className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors -mr-1 cursor-pointer"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="mb-4 sm:mb-5">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-stone-900 mb-1.5">
            {mode === 'forgot-password'
              ? resetStep === 'VERIFY_OTP'
                ? 'Verify OTP'
                : 'Reset Password'
              : selectedPersona === 'student'
                ? mode === 'login'
                  ? 'Student Login'
                  : 'Create Student Account'
                : mode === 'login'
                  ? 'Parent Login'
                  : 'Create Parent Account'}
          </h2>
          <p className="text-stone-600 font-medium text-xs sm:text-sm leading-relaxed">
            {mode === 'forgot-password'
              ? resetStep === 'VERIFY_OTP'
                ? 'Enter the 6-digit verification code and your new password.'
                : 'Enter your account username to receive a verification OTP.'
              : selectedPersona === 'student'
                ? mode === 'login'
                  ? 'Sign in with your student credentials to practice tests & chat with Study Buddy.'
                  : 'Register as an independent student to practice tests and build your mastery.'
                : mode === 'login'
                  ? 'Sign in to track your child\'s learning, diagnostic dossiers & tests.'
                  : 'Register as a Parent to track assessments and empower your kids.'}
          </p>
        </div>

        {/* Mode Switcher (Login / Sign Up for both Parent & Student) */}
        {mode !== 'forgot-password' && (
          <div className="flex p-1 bg-stone-200/60 rounded-xl mb-3 sm:mb-3.5">
            <button
              type="button"
              onClick={() => handleModeChange('login')}
              className={`flex-1 py-1.5 text-xs sm:text-[13px] font-bold rounded-lg transition-all duration-200 cursor-pointer ${mode === 'login' ? 'bg-white text-yellow-700 shadow-sm font-extrabold' : 'text-stone-500 hover:text-stone-700'
                }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('register')}
              className={`flex-1 py-1.5 text-xs sm:text-[13px] font-bold rounded-lg transition-all duration-200 cursor-pointer ${mode === 'register' ? 'bg-white text-yellow-700 shadow-sm font-extrabold' : 'text-stone-500 hover:text-stone-700'
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
                    Your password has been changed successfully. You can now sign in using your new password.
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
            ) : resetStep === 'ENTER_IDENTIFIER' ? (
              /* Step 1: Enter Username & Send OTP */
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendOtp();
                }}
                className="space-y-4"
                noValidate
              >
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1 ml-1">
                    Username or Email <span className="text-red-500">*</span>
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
                      placeholder="e.g. rahul2026 or parent@example.com"
                      autoFocus
                      className={`w-full h-11 pl-11 pr-4 bg-white border-2 rounded-xl text-sm font-medium text-stone-900 outline-none transition-all placeholder:text-stone-400 ${resetFieldErrors.identifier
                        ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/20'
                        : 'border-stone-200 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-600/10'
                        }`}
                    />
                  </div>
                  {resetFieldErrors.identifier && (
                    <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{resetFieldErrors.identifier}</p>
                  )}
                  <p className="text-[11px] text-stone-500 mt-1.5 ml-1">
                    An OTP will be dispatched to the verified email linked to this account.
                  </p>
                </div>

                {/* Error Banner */}
                {resetErrorMessage && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-600 flex items-start gap-2">
                    <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                    <span>{resetErrorMessage}</span>
                  </div>
                )}

                {/* Send OTP Button */}
                <button
                  type="submit"
                  disabled={isSendingOtp}
                  className="w-full h-11 flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 active:scale-[0.98] text-stone-900 text-sm font-bold rounded-xl transition-all shadow-lg shadow-yellow-400/25 disabled:opacity-70 disabled:pointer-events-none cursor-pointer"
                >
                  {isSendingOtp ? (
                    <Loader2 size={18} className="animate-spin text-stone-900" />
                  ) : (
                    <>
                      <span>Send OTP</span>
                      <Send size={16} />
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
                  className="w-full h-10 flex items-center justify-center gap-1.5 text-stone-600 hover:text-stone-900 text-xs font-bold transition-colors cursor-pointer"
                >
                  <ArrowLeft size={16} />
                  <span>Back to Login</span>
                </button>
              </form>
            ) : (
              /* Step 2: Verify OTP & Enter New Password */
              <form onSubmit={handleResetSubmit} className="space-y-3" noValidate>
                {/* Email Destination Banner */}
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-between text-xs text-amber-900">
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-amber-600 flex-shrink-0" />
                    <div>
                      <span className="text-stone-600">OTP sent to: </span>
                      <span className="font-bold text-stone-900">{resetMaskedEmail}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setResetStep('ENTER_IDENTIFIER');
                      setResetErrorMessage(null);
                      setResetFieldErrors({});
                    }}
                    className="text-[11px] font-bold text-amber-700 hover:text-amber-900 underline ml-2 cursor-pointer"
                  >
                    Change
                  </button>
                </div>

                {/* OTP Code Field */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1 ml-1">
                    6-Digit Verification Code (OTP) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <KeyRound
                      size={18}
                      className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${resetFieldErrors.otp ? 'text-red-400' : 'text-stone-400 group-focus-within:text-yellow-600'}`}
                    />
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={resetOtp}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setResetOtp(val);
                        setResetFieldErrors((prev) => ({ ...prev, otp: undefined }));
                      }}
                      placeholder="• • • • • •"
                      autoFocus
                      className={`w-full h-11 pl-11 pr-4 bg-white border-2 rounded-xl text-center font-mono text-base font-bold tracking-widest text-stone-900 outline-none transition-all placeholder:text-stone-300 ${resetFieldErrors.otp
                        ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/20'
                        : 'border-stone-200 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-600/10'
                        }`}
                    />
                  </div>
                  {resetFieldErrors.otp && (
                    <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{resetFieldErrors.otp}</p>
                  )}
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
                  <div className="p-3 mt-2 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-600 flex items-start gap-2">
                    <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                    <span>{resetErrorMessage}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={resetSubmitting}
                  className="w-full h-11 mt-2 flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 active:scale-[0.98] text-stone-900 text-sm font-bold rounded-xl transition-all shadow-lg shadow-yellow-400/25 disabled:opacity-70 disabled:pointer-events-none cursor-pointer"
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

                {/* Resend Code Action */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-stone-500">Didn't receive the code?</span>
                  {resendCountdown > 0 ? (
                    <span className="text-xs font-semibold text-stone-400">
                      Resend in {resendCountdown}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={isSendingOtp}
                      onClick={() => handleSendOtp(true)}
                      className="text-xs font-bold text-yellow-600 hover:text-yellow-700 flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw size={12} className={isSendingOtp ? 'animate-spin' : ''} />
                      <span>Resend OTP</span>
                    </button>
                  )}
                </div>

                {/* Back to Login Button */}
                <button
                  type="button"
                  onClick={() => {
                    setResetErrorMessage(null);
                    setResetFieldErrors({});
                    setMode('login');
                  }}
                  className="w-full h-9 mt-1 flex items-center justify-center gap-1.5 text-stone-600 hover:text-stone-900 text-xs font-bold transition-colors cursor-pointer"
                >
                  <ArrowLeft size={16} />
                  <span>Back to Login</span>
                </button>
              </form>
            )}
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className={`flex-1 flex flex-col justify-start ${mode === 'login' ? 'space-y-4 sm:space-y-5' : 'space-y-3'}`} noValidate>

            {/* Google Button available for both Parent and Student */}
            <button
              type="button"
              onClick={handleGoogleClick}
              disabled={isSubmitting || isGoogleSubmitting}
              className="w-full h-9.5 sm:h-10 flex items-center justify-center gap-2.5 bg-white border-2 border-stone-200 hover:border-yellow-300 hover:bg-stone-50 text-stone-700 text-xs sm:text-[13px] font-bold rounded-xl transition-all shadow-xs active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
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

            <div className="relative flex items-center justify-center py-0.5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200"></div>
              </div>
              <div className="relative bg-white px-3 text-[10px] sm:text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                {mode === 'register' ? 'Or register with details' : 'Or login with password'}
              </div>
            </div>

            {/* Full Name & Username Row (Sign Up Only) */}
            {mode === 'register' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Full Name */}
                <div>
                  <label className="block text-xs sm:text-[13px] font-bold text-stone-800 mb-1 ml-1">
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
                      className={`w-full h-11 pl-11 pr-4 bg-white border-2 rounded-xl text-xs sm:text-sm font-medium text-stone-900 outline-none transition-all placeholder:text-stone-400 ${fieldErrors.name
                        ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/20'
                        : 'border-stone-200 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-600/10'
                        }`}
                    />
                  </div>
                  {fieldErrors.name && (
                    <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{fieldErrors.name}</p>
                  )}
                </div>

                {/* Username */}
                <div>
                  <label className="block text-xs sm:text-[13px] font-bold text-stone-800 mb-1 ml-1">
                    {selectedPersona === 'student' ? 'Student Username' : 'Parent Username'} <span className="text-red-500">*</span>
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
                      placeholder={selectedPersona === 'student' ? 'e.g. rahul_student' : 'e.g. rahul_parent'}
                      className={`w-full h-11 pl-11 pr-4 bg-white border-2 rounded-xl text-xs sm:text-sm font-medium text-stone-900 outline-none transition-all placeholder:text-stone-400 ${fieldErrors.username
                        ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/20'
                        : 'border-stone-200 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-600/10'
                        }`}
                    />
                  </div>
                  {fieldErrors.username && (
                    <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{fieldErrors.username}</p>
                  )}
                </div>
              </div>
            )}

            {/* Student Board & Class Grade Selection (Dynamic from Database) */}
            {mode === 'register' && selectedPersona === 'student' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Board Selection */}
                <div>
                  <label className="block text-xs sm:text-[13px] font-bold text-stone-800 mb-1 ml-1">
                    Board <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <BookOpen
                      size={18}
                      className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none ${fieldErrors.targetBoard ? 'text-red-400' : 'text-stone-400 group-focus-within:text-yellow-600'}`}
                    />
                    <select
                      value={targetBoard}
                      onChange={(e) => {
                        setTargetBoard(e.target.value);
                        clearFieldError('targetBoard');
                      }}
                      disabled={isLoadingMasters && dbBoards.length === 0}
                      className={`w-full h-11 pl-11 pr-4 bg-white border-2 rounded-xl text-xs sm:text-sm font-semibold outline-none transition-all focus:border-yellow-400 focus:ring-4 focus:ring-yellow-600/10 cursor-pointer disabled:bg-stone-50 disabled:text-stone-400 ${!targetBoard ? 'text-stone-400' : 'text-stone-900'} ${fieldErrors.targetBoard
                        ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/20'
                        : 'border-stone-200 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-600/10'
                        }`}
                    >
                      <option value="">Select your board</option>
                      {dbBoards.map((b) => (
                        <option key={b.id || b.name} value={b.name} className="text-stone-900">
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {fieldErrors.targetBoard && (
                    <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 leading-tight">{fieldErrors.targetBoard}</p>
                  )}
                </div>

                {/* Class Grade Selection */}
                <div>
                  <label className="block text-xs sm:text-[13px] font-bold text-stone-800 mb-1 ml-1">
                    Class / Grade <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <GraduationCap
                      size={18}
                      className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none ${fieldErrors.classGrade ? 'text-red-400' : 'text-stone-400 group-focus-within:text-yellow-600'}`}
                    />
                    <select
                      value={classGrade}
                      onChange={(e) => {
                        setClassGrade(e.target.value);
                        clearFieldError('classGrade');
                      }}
                      disabled={!targetBoard || (isLoadingMasters && availableClasses.length === 0)}
                      className={`w-full h-11 pl-11 pr-4 bg-white border-2 rounded-xl text-xs sm:text-sm font-semibold outline-none transition-all focus:border-yellow-400 focus:ring-4 focus:ring-yellow-600/10 cursor-pointer disabled:bg-stone-50 disabled:text-stone-400 ${!classGrade ? 'text-stone-400' : 'text-stone-900'} ${fieldErrors.classGrade
                        ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/20'
                        : 'border-stone-200 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-600/10'
                        }`}
                    >
                      <option value="">{targetBoard ? "Select your class" : "Select board first"}</option>
                      {availableClasses.map((c) => (
                        <option key={c.id || c.name} value={c.name} className="text-stone-900">
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {fieldErrors.classGrade && (
                    <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 leading-tight">{fieldErrors.classGrade}</p>
                  )}
                </div>
              </div>
            )}

            {/* Email Address (Full width in Sign Up) or Username/Email in Login */}
            {mode === 'register' ? (
              <div>
                <label className="block text-xs sm:text-[13px] font-bold text-stone-800 mb-1 ml-1">
                  {selectedPersona === 'student' ? 'Student Email Address' : 'Parent Email Address'} <span className="text-red-500">*</span>
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
                    placeholder={selectedPersona === 'student' ? 'student@example.com' : 'parent@example.com'}
                    className={`w-full h-11 pl-11 pr-4 bg-white border-2 rounded-xl text-xs sm:text-sm font-medium text-stone-900 outline-none transition-all placeholder:text-stone-400 ${fieldErrors.email
                      ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/20'
                      : 'border-stone-200 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-600/10'
                      }`}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{fieldErrors.email}</p>
                )}
              </div>
            ) : (
              /* Username or Email Field (Login) */
              <div>
                <label className="block text-xs sm:text-sm font-bold text-stone-800 mb-1.5 ml-1">
                  {selectedPersona === 'student'
                    ? 'Student Username or ID'
                    : 'Parent Username or Email'} <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <User
                    size={19}
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
                    placeholder={
                      selectedPersona === 'student'
                        ? 'e.g. rahul001 or student ID'
                        : 'e.g. rahul_parent or parent@example.com'
                    }
                    className={`w-full h-11 sm:h-12 pl-11 pr-4 bg-white border-2 rounded-xl text-xs sm:text-sm font-medium text-stone-900 outline-none transition-all placeholder:text-stone-400 ${fieldErrors.username
                      ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/20'
                      : 'border-stone-200 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-600/10'
                      }`}
                  />
                </div>
                {fieldErrors.username && (
                  <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{fieldErrors.username}</p>
                )}
              </div>
            )}

            {/* Password & Confirm Password Row: Side-by-side in Sign Up, Single row in Login */}
            {mode === 'register' ? (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Create Password */}
                  <div>
                    <label className="block text-xs sm:text-[13px] font-bold text-stone-800 mb-1 ml-1">
                      Create Password <span className="text-red-500">*</span>
                    </label>
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
                        className={`w-full h-11 pl-11 pr-11 bg-white border-2 rounded-xl text-xs sm:text-sm font-medium text-stone-900 outline-none transition-all placeholder:text-stone-400 ${fieldErrors.password
                          ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/20'
                          : 'border-stone-200 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-600/10'
                          }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {fieldErrors.password && (
                      <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 leading-tight">{fieldErrors.password}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs sm:text-[13px] font-bold text-stone-800 mb-1 ml-1">
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
                        className={`w-full h-11 pl-11 pr-11 bg-white border-2 rounded-xl text-xs sm:text-sm font-medium text-stone-900 outline-none transition-all placeholder:text-stone-400 ${fieldErrors.confirmPassword
                          ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/20'
                          : 'border-stone-200 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-600/10'
                          }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {fieldErrors.confirmPassword && (
                      <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 leading-tight">{fieldErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                {password.length > 0 && (
                  <div className="mt-1.5 flex gap-1.5">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-1 flex-1 rounded-full transition-colors ${step <= passwordStrength
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
            ) : (
              /* Password Field (Login) */
              <div>
                <div className="flex items-center justify-between mb-1.5 ml-1 mr-1">
                  <label className="text-xs sm:text-sm font-bold text-stone-800">
                    Password <span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="relative group">
                  <Lock
                    size={19}
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
                    className={`w-full h-11 sm:h-12 pl-11 pr-12 bg-white border-2 rounded-xl text-xs sm:text-sm font-medium text-stone-900 outline-none transition-all placeholder:text-stone-400 ${fieldErrors.password
                      ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/20'
                      : 'border-stone-200 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-600/10'
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 leading-tight">{fieldErrors.password}</p>
                )}

                {/* Forgot Password Link */}
                <div className="flex justify-end pt-1 pb-0">
                  <button
                    type="button"
                    onClick={() => {
                      setResetIdentifier(username);
                      setResetStep('ENTER_IDENTIFIER');
                      setResetOtp('');
                      setResetMaskedEmail(null);
                      setResetSuccess(false);
                      setResetErrorMessage(null);
                      setResetFieldErrors({});
                      setResetNewPassword('');
                      setResetConfirmPassword('');
                      setMode('forgot-password');
                    }}
                    className="text-xs sm:text-sm font-bold text-yellow-600 hover:text-yellow-700 hover:underline transition-all cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>
            )}

            {/* Math Security Captcha */}
            <div className="pt-0 -mt-1.5 sm:-mt-2">
              <div className="flex items-center justify-between mb-1 ml-1 mr-1">
                <label className="text-xs sm:text-sm font-bold text-stone-800 flex items-center gap-1.5">
                  <Calculator size={15} className="text-yellow-600" />
                  <span>Security Captcha</span> <span className="text-red-500">*</span>
                </label>
                <span className="text-[10px] sm:text-xs text-stone-400 font-medium">Solve the math challenge</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Math Question Box */}
                <div className="h-11 sm:h-12 px-4 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-yellow-200/80 rounded-xl flex items-center justify-center gap-2 text-sm sm:text-base font-black text-stone-900 tracking-wider select-none shadow-xs min-w-[110px] sm:min-w-[120px]">
                  {isCaptchaLoading ? (
                    <Loader2 size={16} className="animate-spin text-yellow-600" />
                  ) : (
                    <span>{captchaData?.question || '...'}</span>
                  )}
                </div>

                {/* Refresh Captcha Button */}
                <button
                  type="button"
                  onClick={fetchCaptcha}
                  disabled={isCaptchaLoading}
                  title="Generate new question"
                  className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl bg-stone-100 hover:bg-yellow-100 text-stone-600 hover:text-yellow-800 transition-colors border border-stone-200 active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
                >
                  <RefreshCw size={16} className={isCaptchaLoading ? 'animate-spin' : ''} />
                </button>

                {/* Answer Input */}
                <div className="flex-1 relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={captchaAnswer}
                    onChange={(e) => {
                      setCaptchaAnswer(e.target.value);
                      clearFieldError('captcha');
                    }}
                    placeholder="Enter result"
                    className={`w-full h-11 sm:h-12 px-4 bg-white border-2 rounded-xl text-xs sm:text-sm font-semibold text-stone-900 outline-none transition-all placeholder:text-stone-400 ${fieldErrors.captcha
                      ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/20'
                      : 'border-stone-200 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-600/10'
                      }`}
                  />
                </div>
              </div>
              {fieldErrors.captcha && (
                <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{fieldErrors.captcha}</p>
              )}
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3 mt-2 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-600 flex items-start gap-2">
                <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 sm:h-12 mt-1 sm:mt-1.5 flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 active:scale-[0.98] text-stone-900 text-xs sm:text-sm font-black rounded-xl transition-all shadow-lg shadow-yellow-400/25 disabled:opacity-70 disabled:pointer-events-none cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 size={18} className="animate-spin text-stone-900" />
              ) : (
                <>
                  {selectedPersona === 'student'
                    ? mode === 'login'
                      ? 'Log In as Student'
                      : 'Create Student Account'
                    : mode === 'login'
                      ? 'Log In as Parent'
                      : 'Create Parent Account'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            {/* Student Account Notice */}
            {selectedPersona === 'student' && mode === 'login' && (
              <div className="mt-4 p-3 rounded-xl bg-amber-50/80 border border-amber-200/70 text-xs text-amber-900 leading-relaxed flex items-start gap-2.5">
                <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Student Notice:</span> Independent students can sign in directly or click "Sign Up" above to create an account. If added by a parent, use your parent-provided credentials.
                </div>
              </div>
            )}
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
                  <h3 className="text-base font-bold text-stone-900">
                    {googleModal.role === 'student' ? 'Complete Student Setup' : 'Choose your Username'}
                  </h3>
                  <p className="text-[11px] text-stone-500">Google Account: {googleModal.email}</p>
                </div>
              </div>
              <button
                onClick={() => setGoogleModal(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-stone-600 mb-4">
              {googleModal.role === 'student'
                ? 'To personalize your learning path and enable easy login, please choose your username, target board, and class grade:'
                : 'To log in easily from any device using username & password, please choose a unique username for your EduJunction account:'}
            </p>

            <div className="space-y-3 mb-5">
              {/* Username Field */}
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
                    placeholder={googleModal.role === 'student' ? 'e.g. rahul_student' : 'e.g. Rahul_2026'}
                    className="w-full h-10 pl-10 pr-3 bg-white border-2 border-stone-200 focus:border-yellow-400 rounded-xl text-sm font-medium outline-hidden"
                  />
                </div>
                <p className="text-[10px] text-stone-400 mt-1">3-30 characters, no dots (.), no spaces.</p>
              </div>

              {/* Student Board & Class Selectors */}
              {googleModal.role === 'student' && (
                <div className="space-y-3">
                  {/* Board Selector */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Board <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <BookOpen size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                      <select
                        value={googleModal.targetBoard || ''}
                        onChange={(e) =>
                          setGoogleModal({ ...googleModal, targetBoard: e.target.value, classGrade: '', error: undefined })
                        }
                        className={`w-full h-10 pl-10 pr-3 bg-white border-2 border-stone-200 focus:border-yellow-400 rounded-xl text-xs sm:text-sm font-medium outline-hidden cursor-pointer ${!googleModal.targetBoard ? 'text-stone-400' : 'text-stone-900'}`}
                      >
                        <option value="">Select your board</option>
                        {dbBoards.map((b) => (
                          <option key={b.id || b.name} value={b.name} className="text-stone-900">
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Class Selector */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Class / Grade <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <GraduationCap size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                      <select
                        value={googleModal.classGrade || ''}
                        onChange={(e) =>
                          setGoogleModal({ ...googleModal, classGrade: e.target.value, error: undefined })
                        }
                        disabled={!googleModal.targetBoard}
                        className={`w-full h-10 pl-10 pr-3 bg-white border-2 border-stone-200 focus:border-yellow-400 rounded-xl text-xs sm:text-sm font-medium outline-hidden cursor-pointer disabled:bg-stone-50 disabled:text-stone-400 ${!googleModal.classGrade ? 'text-stone-400' : 'text-stone-900'}`}
                      >
                        <option value="">
                          {googleModal.targetBoard ? 'Select your class' : 'Select board first'}
                        </option>
                        {(googleModal.targetBoard && boardClassesMap[googleModal.targetBoard] && boardClassesMap[googleModal.targetBoard].length > 0
                          ? dbClasses.filter((c) => boardClassesMap[googleModal.targetBoard!].includes(c.name))
                          : dbClasses
                        ).map((c) => (
                          <option key={c.id || c.name} value={c.name} className="text-stone-900">
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

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
                className="flex-1 h-10 rounded-xl border border-stone-200 text-xs font-bold text-stone-600 hover:bg-stone-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCompleteGoogleRegistration}
                disabled={googleModal.isSubmitting}
                className="flex-1 h-10 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-stone-900 text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-yellow-400/20 cursor-pointer disabled:opacity-60"
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