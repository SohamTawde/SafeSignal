import React from 'react';
import { cn } from '../utilities/utils';

export const Button = React.forwardRef(({ className, variant = 'primary', size = 'default', children, ...props }, ref) => {
  const variants = {
    primary: 'bg-violet-600 hover:bg-violet-700 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)] border border-violet-500/50',
    secondary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-[0_0_15px_rgba(14,165,233,0.3)] border border-blue-500/50',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)] border border-red-500/50',
    outline: 'bg-transparent border border-white/20 text-white hover:bg-white/10 hover:border-white/30',
    ghost: 'bg-transparent text-slate-300 hover:text-white hover:bg-white/5',
  };

  const sizes = {
    default: 'px-6 py-3 text-sm font-semibold',
    sm: 'px-4 py-2 text-xs font-semibold',
    lg: 'px-8 py-4 text-base font-bold',
  };

  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-xl transition-all duration-200 uppercase tracking-widest active:scale-[0.98]',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';
