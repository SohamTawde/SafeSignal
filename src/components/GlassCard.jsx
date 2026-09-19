import React from 'react';
import { cn } from '../utilities/utils';

export const GlassCard = ({ className, children, ...props }) => {
  return (
    <div
      className={cn('glass-card p-6 relative overflow-hidden', className)}
      {...props}
    >
      {/* Subtle ambient glow in the top right corner of every card */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-violet-500/10 blur-[50px] rounded-full pointer-events-none" />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
