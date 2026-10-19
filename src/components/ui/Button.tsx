import React, { useState } from 'react';
import {
  X, Trash2, Save, Send, Download, Upload, Pencil, Plus, Search, RotateCcw, RefreshCw,
  LogIn, LogOut, Rocket, GraduationCap, ArrowRight, ArrowLeft, Eye, Award, Share2, Copy,
  HelpCircle, Compass, Route, Settings, CheckCircle2, XCircle, Link2, Play, ClipboardCheck,
  ExternalLink, Sparkles, EyeOff, Mail, Image as ImageIcon, type LucideIcon,
} from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  /** Omit to auto-pick an icon from the label; pass `null` for no icon. */
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
}

// Label keyword → icon. First match wins, so more specific phrases come first.
const AUTO_ICONS: [RegExp, LucideIcon, ('left' | 'right')?][] = [
  [/\b(cancel|close|dismiss)\b/i, X],
  [/\b(delete|remove|trash)\b/i, Trash2],
  [/\b(log ?out|sign ?out)\b/i, LogOut],
  [/\b(log ?in|sign ?in)\b/i, LogIn],
  [/\b(sign ?up|register|join|get started|start)\b/i, Rocket],
  [/\b(save|update)\b/i, Save],
  [/\b(submit|send|post|publish)\b/i, Send],
  [/\b(download|export)\b/i, Download],
  [/\b(upload|import|select (file|video))\b/i, Upload],
  [/\b(edit|modify|rename)\b/i, Pencil],
  [/\b(add|create|new)\b/i, Plus],
  [/\b(reset|clear)\b/i, RotateCcw],
  [/\b(retry|refresh|reload|sync|retake)\b/i, RefreshCw],
  [/\b(search|find)\b/i, Search],
  [/\benroll/i, GraduationCap],
  [/\b(back|previous|prev)\b/i, ArrowLeft],
  [/\b(continue|next|proceed)\b/i, ArrowRight, 'right'],
  [/\b(approve|confirm|accept|verify|grade|complete|mark)\b/i, CheckCircle2],
  [/\b(reject|deny|decline)\b/i, XCircle],
  [/\b(certificate|credential)s?\b/i, Award],
  [/\bshare\b/i, Share2],
  [/\bcopy\b/i, Copy],
  [/\b(ask|question|help)\b/i, HelpCircle],
  [/\b(play|watch|resume|lesson)\b/i, Play],
  [/\b(quiz|test|assignment)\b/i, ClipboardCheck],
  [/\b(visit|launch|demo|live)\b/i, ExternalLink],
  [/\b(roadmap|path)s?\b/i, Route],
  [/\bhide\b/i, EyeOff],
  [/\b(view|preview|open|details|show)\b/i, Eye],
  [/\b(subscribe|newsletter)\b/i, Mail],
  [/\b(avatar|photo|image)\b/i, ImageIcon],
  [/\b(browse|explore|catalog|discover)\b/i, Compass],
  [/\b(settings|configure|preferences)\b/i, Settings],
  [/\b(link|connect)\b/i, Link2],
  [/\b(generate|ai)\b/i, Sparkles],
];

const textOf = (node: React.ReactNode): string => {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join(' ');
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) return textOf(node.props.children);
  return '';
};

// True when the label already renders its own icon (a component or raw <svg>)
const hasInlineIcon = (node: React.ReactNode): boolean =>
  React.Children.toArray(node).some(
    (c) => React.isValidElement(c) && (typeof c.type !== 'string' || c.type === 'svg')
  );

const isDirectional = (Icon: LucideIcon) => Icon === ArrowRight || Icon === ArrowLeft;

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  isLoading = false,
  className = '',
  disabled,
  onPointerDown,
  ...props
}) => {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  const variantMap = {
    primary: 'bg-[#FD1843] text-[#FFF9FA] hover:bg-[#E5102F] shadow-md hover:shadow-lg hover:shadow-[#FD1843]/25 font-semibold',
    secondary: 'bg-[#FFF0F3] text-[#FD1843] hover:bg-[#FFE0E8] border border-[#FD1843]/20 hover:border-[#FD1843]/40',
    outline: 'border border-[#FD1843]/30 text-[#FD1843] hover:bg-[#FD1843]/10 hover:border-[#FD1843]/50',
    ghost: 'text-[#110508]/70 hover:bg-[#FD1843]/10 hover:text-[#FD1843]',
    danger: 'bg-rose-500/15 border border-rose-500/25 text-rose-600 hover:bg-rose-500/25'
  };

  const sizeMap = {
    sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5 font-medium',
    md: 'text-sm px-4 py-2 rounded-xl gap-2 font-medium',
    lg: 'text-base px-5 py-2.5 rounded-xl gap-2.5 font-semibold'
  };

  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  // Resolve the icon: explicit prop wins; otherwise infer one from the label text
  let resolvedIcon: React.ReactNode = icon;
  let resolvedPosition = iconPosition;
  let slide: 'left' | 'right' | null = null;
  if (icon === undefined && !hasInlineIcon(children)) {
    const label = textOf(children);
    const match = AUTO_ICONS.find(([re]) => re.test(label));
    if (match) {
      const [, Auto, pos] = match;
      resolvedIcon = <Auto className={iconSize} />;
      resolvedPosition = pos ?? 'left';
      if (isDirectional(Auto)) slide = Auto === ArrowLeft ? 'left' : 'right';
    }
  }

  // Leading icons tilt + pop; trailing / directional icons slide
  const iconMotion =
    slide === 'left'
      ? 'group-enabled:group-hover:-translate-x-1'
      : slide === 'right' || resolvedPosition === 'right'
        ? 'group-enabled:group-hover:translate-x-1'
        : 'group-enabled:group-hover:scale-[1.18] group-enabled:group-hover:-rotate-[10deg]';

  const iconWrap = `btn-icon inline-flex shrink-0 transition-transform duration-300 ease-out ${iconMotion} ${variant === 'primary' ? 'text-[#FFF9FA]' : ''}`;
  const lift = variant === 'ghost' ? '' : 'enabled:hover:-translate-y-0.5';

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    onPointerDown?.(e);
    const r = e.currentTarget.getBoundingClientRect();
    const id = Date.now() + Math.random();
    setRipples((rs) => [...rs, { id, x: e.clientX - r.left, y: e.clientY - r.top }]);
  };

  return (
    <button
      disabled={disabled || isLoading}
      onPointerDown={handlePointerDown}
      className={`btn-anim group relative overflow-hidden isolate inline-flex items-center justify-center cursor-pointer transition-all duration-200 enabled:active:translate-y-0 enabled:active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed select-none ${lift} ${variantMap[variant]} ${sizeMap[size]} ${className}`}
      {...props}
    >
      {ripples.map((rp) => (
        <span
          key={rp.id}
          aria-hidden
          className="btn-ripple"
          style={{ left: rp.x, top: rp.y }}
          onAnimationEnd={() => setRipples((rs) => rs.filter((x) => x.id !== rp.id))}
        />
      ))}
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {resolvedIcon && resolvedPosition === 'left' && <span aria-hidden className={iconWrap}>{resolvedIcon}</span>}
          <span className={`[&>svg]:transition-transform [&>svg]:duration-300 group-enabled:group-hover:[&>svg]:scale-110 ${variant === 'primary' ? 'text-[#FFF9FA] font-bold' : ''}`}>{children}</span>
          {resolvedIcon && resolvedPosition === 'right' && <span aria-hidden className={iconWrap}>{resolvedIcon}</span>}
        </>
      )}
    </button>
  );
};
