import React, { useState } from 'react';
import { useLms } from '../../context/LmsContext';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';
import { Button } from './Button';
import { BrandLogo } from './BrandLogo';
import { 
  signInWithEmail, 
  signUpWithEmail, 
  signInWithGoogle, 
  resetPassword 
} from '../../services/firebaseAuth';

export const AuthModal: React.FC = () => {
  const { 
    authModalOpen, 
    closeAuthModal, 
    authModalMode, 
    openAuthModal, 
    addToast,
    brandName,
    setCurrentView,
    setRole
  } = useLms();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!authModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      addToast("Email Required", "Please enter your email address.", "warning");
      return;
    }

    if (authModalMode !== 'forgot' && !password) {
      addToast("Password Required", "Please enter your account password.", "warning");
      return;
    }

    setIsLoading(true);

    try {
      if (authModalMode === 'login') {
        const { profile } = await signInWithEmail(email.trim(), password);
        setRole(profile.role || 'student');
        addToast("Signed In Successfully", `Welcome back, ${profile.displayName}!`, "success");
        closeAuthModal();
        setCurrentView('student-dashboard');
      } else if (authModalMode === 'signup') {
        if (!name.trim()) {
          addToast("Name Required", "Please provide your full name.", "warning");
          setIsLoading(false);
          return;
        }
        const { profile } = await signUpWithEmail(email.trim(), password, name.trim());
        setRole('student');
        addToast("Account Created", `Welcome to Yaswant Code, ${profile.displayName}!`, "success");
        closeAuthModal();
        setCurrentView('student-dashboard');
      } else if (authModalMode === 'forgot') {
        await resetPassword(email.trim());
        addToast("Reset Email Dispatched", "Check your inbox for password reset instructions.", "info");
        openAuthModal('login');
      }
    } catch (err: any) {
      let message = err?.message || "Authentication failed. Please verify your credentials.";
      const code = err?.code;
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        message = "Invalid email or password. Please verify your credentials.";
      } else if (code === 'auth/email-already-in-use') {
        message = "An account with this email address already exists. Please sign in.";
      } else if (code === 'auth/weak-password') {
        message = "Password must be at least 6 characters long.";
      } else if (code === 'auth/invalid-email') {
        message = "Please enter a valid email address.";
      } else if (code === 'auth/too-many-requests') {
        message = "Too many failed attempts. Please wait a few moments before trying again.";
      }
      addToast("Authentication Error", message, "warning");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      const { profile } = await signInWithGoogle();
      setRole(profile.role || 'student');
      addToast("Google Sign-In Succeeded", `Welcome, ${profile.displayName}!`, "success");
      closeAuthModal();
      setCurrentView('student-dashboard');
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        addToast("Google Sign-In Error", err?.message || "Could not sign in with Google.", "warning");
      }
    } finally {
      setIsLoading(false);
    }
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
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              {authModalMode === 'login' && 'Access interactive courses, projects, and certifications.'}
              {authModalMode === 'signup' && 'Join 140,000+ engineers mastering production architectures.'}
              {authModalMode === 'forgot' && "Enter your email address and we'll send a recovery link."}
            </p>
          </div>

          {/* Social Sign-in Button */}
          {(authModalMode === 'login' || authModalMode === 'signup') && (
            <div className="mb-5 space-y-3">
              <button
                onClick={handleGoogleAuth}
                type="button"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-850 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs font-semibold flex items-center justify-center gap-3 transition-colors shadow-xs cursor-pointer disabled:opacity-60"
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
            {/* Name field for Sign Up */}
            {authModalMode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Mercer"
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white"
                  />
                </div>
              </div>
            )}

            {/* Email input */}
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white"
                />
              </div>
            </div>

            {/* Password input for login and signup */}
            {(authModalMode === 'login' || authModalMode === 'signup') && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    Password *
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
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-750 text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              className="w-full mt-2"
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              {authModalMode === 'login' && 'Sign In with Email'}
              {authModalMode === 'signup' && 'Create Engineer Account'}
              {authModalMode === 'forgot' && 'Send Password Reset Email'}
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
            {authModalMode === 'forgot' && (
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
