import React, { useEffect, useRef, useState } from 'react';
import {
  motion,
  animate,
  useInView,
  useMotionValue,
  useMotionTemplate,
  useSpring,
  useTransform,
  type Variants,
} from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT } },
};

export const stagger = (gap = 0.08, delay = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: gap, delayChildren: delay } },
});

/** Fades + lifts children into view once they scroll on screen. */
export const Reveal: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: 'div' | 'section' | 'li';
}> = ({ children, className, delay = 0, as = 'div' }) => {
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-80px' }}
      variants={{
        hidden: { opacity: 0, y: 32 },
        show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE_OUT, delay } },
      }}
    >
      {children}
    </Comp>
  );
};

/** Card that tilts toward the cursor in 3D with a sand spotlight following the pointer. */
export const TiltCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  max?: number;
  onClick?: () => void;
  variants?: Variants;
}> = ({ children, className = '', max = 8, onClick, variants }) => {
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rx = useSpring(useTransform(py, [0, 1], [max, -max]), { stiffness: 200, damping: 20 });
  const ry = useSpring(useTransform(px, [0, 1], [-max, max]), { stiffness: 200, damping: 20 });
  const sx = useTransform(px, (v) => `${v * 100}%`);
  const sy = useTransform(py, (v) => `${v * 100}%`);
  const spotlight = useMotionTemplate`radial-gradient(420px circle at ${sx} ${sy}, rgba(253,24,67,0.10), transparent 60%)`;

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const onLeave = () => { px.set(0.5); py.set(0.5); };

  return (
    <motion.div
      ref={ref}
      variants={variants}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      onClick={onClick}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      className={`group relative rounded-2xl border border-[#FD1843]/12 bg-white/70 backdrop-blur-xl transition-colors duration-300 hover:border-[#FD1843]/30 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: spotlight }}
      />
      {children}
    </motion.div>
  );
};

/** Wrapper that pulls its child slightly toward the cursor. */
export const Magnetic: React.FC<{ children: React.ReactNode; strength?: number; className?: string }> = ({
  children,
  strength = 0.25,
  className,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(0, { stiffness: 250, damping: 18 });
  const y = useSpring(0, { stiffness: 250, damping: 18 });
  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x, y }}
      onPointerMove={(e) => {
        if (e.pointerType !== 'mouse' || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onPointerLeave={() => { x.set(0); y.set(0); }}
    >
      {children}
    </motion.div>
  );
};

export type IconMotion = 'wiggle' | 'spin' | 'bounce' | 'pop' | 'launch';

// Hover animation for the leading icon, triggered by the parent's "hover" variant
const iconMotions: Record<IconMotion, Variants> = {
  wiggle: { rest: { rotate: 0 }, hover: { rotate: [0, -16, 12, -8, 0], transition: { duration: 0.6 } } },
  spin: { rest: { rotate: 0 }, hover: { rotate: 180, transition: { duration: 0.6, ease: EASE_OUT } } },
  bounce: { rest: { y: 0 }, hover: { y: [0, -4, 0], transition: { duration: 0.5, repeat: Infinity, repeatDelay: 0.15 } } },
  pop: { rest: { scale: 1 }, hover: { scale: [1, 1.4, 1.15], transition: { duration: 0.4, ease: EASE_OUT } } },
  launch: { rest: { x: 0, y: 0, rotate: 0 }, hover: { x: [0, 2, -1, 0], y: [0, -3, 1, 0], rotate: [0, -10, 0], transition: { duration: 0.7, repeat: Infinity } } },
};

const trailingMotion: Variants = {
  rest: { x: 0 },
  hover: { x: 4, transition: { type: 'spring', stiffness: 400, damping: 15 } },
};

const ctaStyles = {
  primary:
    'bg-[#FD1843] text-[#FFF9FA] font-bold shadow-[0_0_0_1px_rgba(253,24,67,0.4),0_12px_40px_-8px_rgba(253,24,67,0.45)] hover:shadow-[0_0_0_1px_rgba(253,24,67,0.6),0_16px_50px_-6px_rgba(253,24,67,0.65)] hover:bg-[#E5102F]',
  ghost:
    'border border-[#FD1843]/25 bg-[#FD1843]/5 backdrop-blur-md font-semibold text-[#110508] hover:bg-[#FD1843]/10 hover:border-[#FD1843]/45',
  link: 'font-semibold text-[#110508]/85 hover:text-[#FD1843]',
};

const ctaSizes = { md: 'h-12 px-7 text-sm', sm: 'h-10 px-5 text-sm', link: 'h-auto px-0 text-sm' };

/**
 * Button face with icon + motion: lifts on hover, animates its leading icon,
 * slides the trailing icon, presses on tap and ripples from the click point.
 * Render it inside an <a> or <button> so semantics stay with the real control.
 */
export const AnimatedCta: React.FC<{
  children: React.ReactNode;
  variant?: keyof typeof ctaStyles;
  size?: keyof typeof ctaSizes;
  icon?: LucideIcon;
  iconMotion?: IconMotion;
  trailing?: LucideIcon;
  className?: string;
}> = ({ children, variant = 'primary', size = 'md', icon: Icon, iconMotion = 'pop', trailing: Trailing, className = '' }) => {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const isPrimary = variant === 'primary';
  const iconColor = isPrimary ? 'text-[#FFF9FA]' : variant === 'link' ? 'text-[#FD1843]' : 'text-[#110508]';

  const addRipple = (e: React.PointerEvent<HTMLSpanElement>) => {
    if (variant === 'link') return;
    const r = e.currentTarget.getBoundingClientRect();
    const id = Date.now() + Math.random();
    setRipples((rs) => [...rs, { id, x: e.clientX - r.left, y: e.clientY - r.top }]);
  };

  return (
    <motion.span
      initial="rest"
      animate="rest"
      whileHover="hover"
      whileTap={{ scale: 0.96 }}
      variants={{ rest: { y: 0 }, hover: { y: variant === 'link' ? 0 : -2 } }}
      onPointerDown={addRipple}
      className={`relative inline-flex items-center justify-center gap-2 rounded-full overflow-hidden transition-[background-color,border-color,box-shadow,color] duration-300 ${ctaStyles[variant]} ${ctaSizes[size === 'md' && variant === 'link' ? 'link' : size]} ${className}`}
    >
      {isPrimary && (
        <span aria-hidden className="shine-sweep absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/70 to-transparent" />
      )}
      {ripples.map((rp) => (
        <motion.span
          key={rp.id}
          aria-hidden
          className={`pointer-events-none absolute h-10 w-10 -ml-5 -mt-5 rounded-full ${isPrimary ? 'bg-white/30' : 'bg-[#FD1843]/20'}`}
          style={{ left: rp.x, top: rp.y }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 8, opacity: 0 }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
          onAnimationComplete={() => setRipples((rs) => rs.filter((x) => x.id !== rp.id))}
        />
      ))}
      {Icon && (
        <motion.span aria-hidden variants={iconMotions[iconMotion]} className={`relative inline-flex shrink-0 ${iconColor}`}>
          <Icon className="w-4 h-4" />
        </motion.span>
      )}
      <span className={`relative ${isPrimary ? 'text-[#FFF9FA]' : ''}`}>{children}</span>
      {Trailing && (
        <motion.span aria-hidden variants={trailingMotion} className={`relative inline-flex shrink-0 ${iconColor}`}>
          <Trailing className="w-4 h-4" />
        </motion.span>
      )}
    </motion.span>
  );
};

/** Counts from 0 to `to` when scrolled into view. */
export const CountUp: React.FC<{ to: number; decimals?: number; suffix?: string; className?: string }> = ({
  to,
  decimals = 0,
  suffix = '',
  className,
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [reduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [value, setValue] = useState(reduced ? to : 0);

  useEffect(() => {
    if (!inView || reduced) return;
    const controls = animate(0, to, { duration: 1.8, ease: EASE_OUT, onUpdate: setValue });
    return () => controls.stop();
  }, [inView, to, reduced]);

  return (
    <span ref={ref} className={className}>
      {value.toFixed(decimals)}
      {suffix}
    </span>
  );
};

/** Infinite horizontal marquee; content is duplicated for a seamless loop. */
export const Marquee: React.FC<{ children: React.ReactNode; duration?: number; reverse?: boolean }> = ({
  children,
  duration = 40,
  reverse = false,
}) => (
  <div className="relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
    {[0, 1].map((i) => (
      <div
        key={i}
        aria-hidden={i === 1}
        className="marquee-track flex shrink-0 items-center gap-10 pr-10"
        style={{ animationDuration: `${duration}s`, animationDirection: reverse ? 'reverse' : 'normal' }}
      >
        {children}
      </div>
    ))}
  </div>
);
