import React, { useState } from 'react';
import { useLms } from '../../context/LmsContext';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  KeyRound,
  Sparkles 
} from 'lucide-react';
import { Button } from './Button';
import { BrandLogo } from './BrandLogo';

export const AuthModal: React.FC = () => {
  const { 
    authModalOpen, 
    closeAuthModal, 
    authModalMode, 
    openAuthModal, 
    addToast,
    brandName,
    setCurrentView
  } = useLms();

  const [email, setEmail] = useState('alex.mercer@engineer.io');
  const [password, setPassword] = useState('••••••••••••');
  const [name, setName] = useState('Alex Mercer');
  const [roleSelection, setRoleSelection] = useState<'student' | 'instructor'>('student');
  const [otpCode, setOtpCode] = useState(['4', '8', '2', '9', '1', '6']);

  if (!authModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authModalMode === 'login') {
      addToast("Signed In Successfully", `Welcome back, ${email.split('@')[0]}!`, "success");
      closeAuthModal();
      setCurrentView('student-dashboard');
    } else if (authModalMode === 'signup') {
      openAuthModal('verify');
    } else if (authModalMode === 'verify') {
      addToast("Account Verified", "Your developer profile has been initialized.", "success");
      closeAuthModal();
      setCurrentView('student-dashboard');
    } else if (authModalMode === 'forgot') {
      addToast("Password Reset Link Dispatched", "Check your inbox for the secure token.", "info");
      openAuthModal('login');
    }
  };

  const handleGoogleAuth = () => {
    addToast("Google Workspace Auth Initialized", "Connecting via Single Sign-On...", "info");
    setTimeout(() => {
      addToast("Authentication Succeeded", "Signed in with Google Account.", "success");
      closeAuthModal();
      setCurrentView('student-dashboard');
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-neutral-100 dark:border-neutral-800/80">
          <BrandLogo size="sm" brandName={brandName} />
          <button 
            onClick={closeAuthModal}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content Based on Mode */}
        <div className="p-6">
          {/* Header text */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">
              {authModalMode === 'login' && 'Sign in to continue learning'}
              {authModalMode === 'signup' && 'Create your engineer profile'}
              {authModalMode === 'forgot' && 'Reset your password'}
              {authModalMode === 'verify' && 'Verify your security code'}
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              {authModalMode === 'login' && 'Access interactive courses, projects, and certifications.'}
              {authModalMode === 'signup' && 'Join 140,000+ engineers mastering production architectures.'}
              {authModalMode === 'forgot' && "Enter your email address and we'll send a recovery link."}
              {authModalMode === 'verify' && `We sent a 6-digit verification code to ${email}.`}
            </p>
          </div>

          {/* Social Sign-in Button */}
          {(authModalMode === 'login' || authModalMode === 'signup') && (
            <div className="mb-5 space-y-3">
              <button
                onClick={handleGoogleAuth}
                type="button"
                className="w-full py-2.5 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-850 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs font-semibold flex items-center justify-center gap-3 transition-colors shadow-xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Continue with Google
              </button>

              <div className="relative flex items-center justify-center">
                <div className="w-full border-t border-neutral-200 dark:border-neutral-800" />
                <span className="bg-white dark:bg-neutral-900 px-3 text-[11px] text-neutral-400 uppercase tracking-wider">
                  or with email
                </span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role picker for Sign Up */}
            {authModalMode === 'signup' && (
              <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setRoleSelection('student')}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    roleSelection === 'student'
                      ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  Learner / Student
                </button>
                <button
                  type="button"
                  onClick={() => setRoleSelection('instructor')}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    roleSelection === 'instructor'
                      ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  Instructor
                </button>
              </div>
            )}

            {/* Name field for Sign Up */}
            {authModalMode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Mercer"
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white"
                  />
                </div>
              </div>
            )}

            {/* Email input for login, signup, forgot */}
            {authModalMode !== 'verify' && (
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white"
                  />
                </div>
              </div>
            )}

            {/* Password input for login and signup */}
            {(authModalMode === 'login' || authModalMode === 'signup') && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    Password
                  </label>
                  {authModalMode === 'login' && (
                    <button
                      type="button"
                      onClick={() => openAuthModal('forgot')}
                      className="text-[11px] text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white"
                  />
                </div>
              </div>
            )}

            {/* OTP Verification code inputs */}
            {authModalMode === 'verify' && (
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Enter 6-digit Code
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {otpCode.map((digit, idx) => (
                    <input
                      key={idx}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => {
                        const val = e.target.value;
                        setOtpCode(prev => {
                          const next = [...prev];
                          next[idx] = val;
                          return next;
                        });
                      }}
                      className="w-full py-2.5 text-center text-sm font-mono font-bold rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:border-neutral-900 dark:focus:border-white focus:outline-none"
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between text-[11px] text-neutral-500 mt-3">
                  <span>Didn't receive code?</span>
                  <button 
                    type="button" 
                    onClick={() => addToast("Code Resent", "A new 6-digit OTP has been sent.", "info")}
                    className="text-neutral-800 dark:text-neutral-200 font-semibold hover:underline"
                  >
                    Resend Code
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-2"
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              {authModalMode === 'login' && 'Sign In'}
              {authModalMode === 'signup' && 'Continue to Verification'}
              {authModalMode === 'forgot' && 'Send Reset Instructions'}
              {authModalMode === 'verify' && 'Complete Account Setup'}
            </Button>
          </form>

          {/* Switcher Footer */}
          <div className="mt-5 pt-4 border-t border-neutral-100 dark:border-neutral-800 text-center text-xs text-neutral-500">
            {authModalMode === 'login' && (
              <span>
                Don't have an account?{' '}
                <button
                  onClick={() => openAuthModal('signup')}
                  className="text-neutral-900 dark:text-white font-semibold hover:underline"
                >
                  Create one now
                </button>
              </span>
            )}
            {authModalMode === 'signup' && (
              <span>
                Already have an account?{' '}
                <button
                  onClick={() => openAuthModal('login')}
                  className="text-neutral-900 dark:text-white font-semibold hover:underline"
                >
                  Sign in
                </button>
              </span>
            )}
            {(authModalMode === 'forgot' || authModalMode === 'verify') && (
              <button
                onClick={() => openAuthModal('login')}
                className="text-neutral-900 dark:text-white font-semibold hover:underline"
              >
                Back to Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
