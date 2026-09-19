import React, { useState } from 'react';
import { Shield, Lock, ArrowLeft, KeyRound, AlertTriangle, CheckCircle2, Terminal } from 'lucide-react';
import { tokenStorage } from '../services/api';
import { Button } from '../components/ui/Button';

interface AdminAuthGateProps {
  onAuthenticated: () => void;
  onExit: () => void;
}

export const AdminAuthGate: React.FC<AdminAuthGateProps> = ({ onAuthenticated, onExit }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth.php?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim()
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Authentication failed. Invalid administrator credentials.');
      }

      const user = data.data?.user;
      const token = data.data?.token;

      if (!user || user.role !== 'admin') {
        // Clear any stored session
        tokenStorage.remove();
        throw new Error('ACCESS RESTRICTED: The provided account does not possess Administrator clearance.');
      }

      // Valid admin verified
      tokenStorage.set(token);
      tokenStorage.setUser(user);
      setSuccessMsg('Clearance granted. Decrypting administrator dashboard...');

      setTimeout(() => {
        onAuthenticated();
      }, 500);

    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden font-sans selection:bg-amber-500 selection:text-neutral-950">
      {/* Ambient background glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

      {/* Top Header Bar */}
      <header className="relative z-10 max-w-5xl mx-auto w-full flex items-center justify-between py-4 border-b border-neutral-900">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-amber-400 shadow-inner">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold tracking-wider text-neutral-400 uppercase block">
              Yaswant Code LMS
            </span>
            <span className="text-sm font-bold text-white flex items-center gap-2">
              Security Operations Console
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                PORTAL-ISOLATED
              </span>
            </span>
          </div>
        </div>

        <button
          onClick={onExit}
          className="inline-flex items-center gap-2 text-xs font-medium text-neutral-400 hover:text-white px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Return to Student Platform
        </button>
      </header>

      {/* Center Authentication Card */}
      <div className="relative z-10 max-w-md mx-auto w-full my-12">
        <div className="bg-neutral-900/90 backdrop-blur-2xl border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 space-y-6">
          {/* Security Shield Icon */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-400 shadow-lg shadow-amber-500/5">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white">
                Admin Authentication
              </h1>
              <p className="text-xs text-neutral-400 mt-1">
                Restricted access gate. Enter verified administrator credentials to proceed.
              </p>
            </div>
          </div>

          {/* Feedback messages */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="leading-relaxed font-medium">{error}</div>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              <div className="leading-relaxed font-medium">{successMsg}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-neutral-300 font-semibold mb-1.5">
                Administrator Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@yaswantcode.edu"
                  className="w-full pl-3.5 pr-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-amber-400 focus:border-amber-400 font-mono transition-all"
                  autoComplete="username"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-neutral-300 font-semibold mb-1.5 flex items-center justify-between">
                <span>Security Key / Password</span>
                <span className="text-[10px] text-neutral-500 font-mono">Bcrypt Encrypted</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-3.5 pr-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-amber-400 focus:border-amber-400 font-mono transition-all"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                    Validating Security Clearance...
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    Authorize & Unlock Console
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Security Guarantee Footer */}
          <div className="pt-4 border-t border-neutral-850 flex items-center justify-between text-[11px] text-neutral-500 font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              TLS 1.3 Active
            </span>
            <span>Role: System Administrator</span>
          </div>
        </div>
      </div>

      {/* Footer System Notice */}
      <footer className="relative z-10 max-w-5xl mx-auto w-full text-center py-4 border-t border-neutral-900">
        <p className="text-[11px] text-neutral-600 font-mono">
          Unauthorized attempts to access administrative endpoints are logged with origin IP and timestamp.
        </p>
      </footer>
    </div>
  );
};
