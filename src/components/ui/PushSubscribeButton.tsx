import React, { useState, useEffect } from 'react';
import { BellRing, BellOff, Bell, Loader2 } from 'lucide-react';
import {
  isNotificationSupported,
  getNotificationPermission,
  isSubscribed,
  subscribeToNotifications,
  unsubscribeFromNotifications,
} from '../../services/notifications';

interface Props {
  /** Compact icon-only mode (for Navbar) vs full button with label */
  compact?: boolean;
}

export const PushSubscribeButton: React.FC<Props> = ({ compact = false }) => {
  const [subscribed, setSubscribed]   = useState(false);
  const [permission, setPermission]   = useState<string>('default');
  const [loading, setLoading]         = useState(false);
  const [message, setMessage]         = useState('');
  const [supported, setSupported]     = useState(true);

  useEffect(() => {
    setSupported(isNotificationSupported());
    setPermission(getNotificationPermission());
    setSubscribed(isSubscribed());
  }, []);

  if (!supported) return null;

  const handleToggle = async () => {
    setLoading(true);
    setMessage('');
    try {
      const result = subscribed
        ? await unsubscribeFromNotifications()
        : await subscribeToNotifications();

      setSubscribed(result.success ? !subscribed : subscribed);
      setPermission(getNotificationPermission());
      setMessage(result.message);
      setTimeout(() => setMessage(''), 3500);
    } finally {
      setLoading(false);
    }
  };

  const isDenied = permission === 'denied';

  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={isDenied ? undefined : handleToggle}
          disabled={loading || isDenied}
          title={
            isDenied      ? 'Notifications blocked in browser settings'
            : subscribed  ? 'Unsubscribe from push notifications'
                          : 'Subscribe to push notifications'
          }
          className={`p-2 rounded-xl transition-colors relative ${
            isDenied
              ? 'opacity-40 cursor-not-allowed text-neutral-400'
              : subscribed
              ? 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
          aria-label="Push notifications"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : subscribed ? (
            <BellRing className="w-4 h-4" />
          ) : (
            <Bell className="w-4 h-4" />
          )}
          {subscribed && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-neutral-950" />
          )}
        </button>
        {message && (
          <div className="absolute right-0 top-full mt-2 w-56 text-[11px] bg-neutral-900 text-white rounded-xl px-3 py-2 z-50 shadow-xl">
            {message}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={isDenied ? undefined : handleToggle}
        disabled={loading || isDenied}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
          isDenied
            ? 'border-neutral-200 dark:border-neutral-700 text-neutral-400 cursor-not-allowed'
            : subscribed
            ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
            : 'border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
        }`}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : subscribed ? (
          <BellRing className="w-4 h-4 shrink-0 text-emerald-500" />
        ) : (
          <BellOff className="w-4 h-4 shrink-0" />
        )}
        <div className="text-left">
          <div>
            {loading   ? 'Processing…'
            : isDenied ? 'Notifications blocked'
            : subscribed ? 'Subscribed to updates'
                         : 'Subscribe to notifications'}
          </div>
          {!isDenied && (
            <div className="text-[11px] font-normal opacity-70 mt-0.5">
              {subscribed
                ? 'Click to unsubscribe'
                : 'Get notified about new posts & updates'}
            </div>
          )}
        </div>
      </button>

      {isDenied && (
        <p className="text-[11px] text-neutral-400 px-1">
          Notifications are blocked. Enable them in your browser's site settings.
        </p>
      )}
      {message && !isDenied && (
        <p className={`text-[11px] px-1 font-medium ${
          message.includes('Subscribed') ? 'text-emerald-600' : 'text-neutral-500'
        }`}>
          {message}
        </p>
      )}
    </div>
  );
};
