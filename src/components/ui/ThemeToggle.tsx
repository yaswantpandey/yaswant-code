import React from 'react';
import { useTheme, ThemeMode } from '../../context/ThemeContext';
import { Sun, Moon, Monitor, Check } from 'lucide-react';

interface ThemeToggleProps {
  variant?: 'segmented' | 'dropdown' | 'cards';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showLabels?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'segmented',
  size = 'md',
  className = '',
  showLabels = false,
}) => {
  const { theme, resolvedTheme, setTheme, isDark } = useTheme();

  const options: { id: ThemeMode; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'System', icon: Monitor },
  ];

  // 1. Segmented 3-button pill (ideal for Navbar and Mobile Drawer)
  if (variant === 'segmented') {
    const sizeClasses = {
      sm: 'p-0.5 gap-0.5 text-xs',
      md: 'p-1 gap-1 text-xs',
      lg: 'p-1.5 gap-1.5 text-sm',
    }[size];

    const buttonSizeClasses = {
      sm: 'px-2 py-1',
      md: 'px-2.5 py-1.5',
      lg: 'px-3.5 py-2',
    }[size];

    return (
      <div
        role="group"
        aria-label="Theme preference selector"
        className={`inline-flex items-center rounded-xl bg-neutral-100/90 dark:bg-neutral-900/90 border border-neutral-200/80 dark:border-neutral-800/80 backdrop-blur-md transition-colors ${sizeClasses} ${className}`}
      >
        {options.map((opt) => {
          const Icon = opt.icon;
          const isActive = theme === opt.id;

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setTheme(opt.id)}
              aria-pressed={isActive}
              title={`Switch to ${opt.label} mode${opt.id === 'system' ? ` (Currently ${resolvedTheme})` : ''}`}
              className={`flex items-center gap-1.5 rounded-lg font-medium transition-all duration-150 ${buttonSizeClasses} ${
                isActive
                  ? 'bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-xs font-semibold'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              {(showLabels || size === 'lg') && <span>{opt.label}</span>}
              {opt.id === 'system' && !showLabels && size !== 'lg' && (
                <span className="sr-only">System</span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // 2. Rich 3-card layout (ideal for Settings Page)
  if (variant === 'cards') {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3.5 ${className}`}>
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = theme === opt.id;

          return (
            <div
              key={opt.id}
              onClick={() => setTheme(opt.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setTheme(opt.id);
                }
              }}
              className={`relative cursor-pointer rounded-2xl p-4 border transition-all duration-200 text-left flex flex-col justify-between overflow-hidden ${
                isSelected
                  ? 'border-neutral-900 dark:border-white bg-neutral-900/[0.03] dark:bg-white/[0.04] ring-2 ring-neutral-900/10 dark:ring-white/15 shadow-sm'
                  : 'border-neutral-200/90 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/40 hover:border-neutral-400 dark:hover:border-neutral-700 hover:bg-white/90 dark:hover:bg-neutral-900/70'
              }`}
            >
              {/* Preview Canvas Illustration */}
              <div className="mb-4 rounded-xl overflow-hidden border border-neutral-200/80 dark:border-neutral-800 p-2.5 transition-colors">
                {opt.id === 'light' && (
                  <div className="rounded-lg bg-neutral-50 p-2.5 space-y-2 border border-neutral-200/80 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-2 rounded bg-neutral-300" />
                      <div className="w-3 h-3 rounded-full bg-amber-400" />
                    </div>
                    <div className="p-2 rounded-md bg-white/90 backdrop-blur-sm border border-neutral-200/90 shadow-xs space-y-1">
                      <div className="w-16 h-1.5 rounded bg-neutral-800" />
                      <div className="w-24 h-1 rounded bg-neutral-300" />
                    </div>
                  </div>
                )}

                {opt.id === 'dark' && (
                  <div className="rounded-lg bg-neutral-950 p-2.5 space-y-2 border border-neutral-800 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-2 rounded bg-neutral-700" />
                      <div className="w-3 h-3 rounded-full bg-indigo-400" />
                    </div>
                    <div className="p-2 rounded-md bg-neutral-900/90 backdrop-blur-sm border border-neutral-750 shadow-xs space-y-1">
                      <div className="w-16 h-1.5 rounded bg-neutral-200" />
                      <div className="w-24 h-1 rounded bg-neutral-600" />
                    </div>
                  </div>
                )}

                {opt.id === 'system' && (
                  <div className="rounded-lg bg-gradient-to-r from-neutral-100 to-neutral-950 p-2.5 space-y-2 border border-neutral-200 dark:border-neutral-750 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-2 rounded bg-neutral-400 dark:bg-neutral-600" />
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-amber-400" />
                        <div className="w-2 h-2 rounded-full bg-indigo-400" />
                      </div>
                    </div>
                    <div className="p-2 rounded-md bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm border border-neutral-200/90 dark:border-neutral-750 shadow-xs space-y-1">
                      <div className="w-16 h-1.5 rounded bg-neutral-800 dark:bg-neutral-200" />
                      <div className="w-24 h-1 rounded bg-neutral-400 dark:bg-neutral-600" />
                    </div>
                  </div>
                )}
              </div>

              {/* Card Meta & Radio Status */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-neutral-800 dark:text-neutral-200" />
                    <span className="text-xs font-bold text-neutral-900 dark:text-white">
                      {opt.label}
                    </span>
                  </div>

                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-neutral-950 dark:bg-white text-white dark:text-neutral-950'
                        : 'border border-neutral-300 dark:border-neutral-700'
                    }`}
                  >
                    {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                </div>

                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  {opt.id === 'light' && 'Crisp daylight contrast with frosted translucent glass surfaces.'}
                  {opt.id === 'dark' && 'Deep obsidian slate with luminous borders for focused study.'}
                  {opt.id === 'system' && (
                    <>
                      Sync with OS theme. (Currently{' '}
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                        {resolvedTheme === 'dark' ? 'Dark' : 'Light'}
                      </span>
                      )
                    </>
                  )}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return null;
};
