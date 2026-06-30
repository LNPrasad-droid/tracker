import React, { ReactNode } from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  id?: string;
  key?: React.Key;
  className?: string;
  hoverGlow?: boolean;
  borderAccent?: boolean;
  onClick?: () => void;
}

export default function GlassCard({
  children,
  id,
  className = '',
  hoverGlow = false,
  borderAccent = false,
  onClick,
}: GlassCardProps) {
  return (
    <div
      id={id}
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-3xl
        bg-white/[0.02] backdrop-blur-xl
        border ${borderAccent ? 'border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.1)]' : 'border-white/10'}
        shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]
        transition-all duration-300 ease-out
        ${hoverGlow ? 'hover:border-blue-500/20 hover:shadow-[0_0_25px_rgba(59,130,246,0.15)] hover:bg-white/[0.04]' : ''}
        ${onClick ? 'cursor-pointer active:scale-[0.99]' : ''}
        ${className}
      `}
    >
      {/* Background radial gradient to give a luxury look */}
      <div className="absolute inset-0 bg-radial-gradient from-white/[0.02] to-transparent pointer-events-none" />
      
      {/* Glossy top-highlight border */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

      {/* Content wrapper */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}
