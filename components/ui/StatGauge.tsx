'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn, formatNumber } from '@/lib/utils/formatters';

export interface StatGaugeProps {
  value: number;
  maxValue?: number;
  label: string;
  icon: React.ReactNode;
  suffix?: string;
  variant?: 'ets2' | 'ats';
  size?: 'sm' | 'md' | 'lg';
}

export function StatGauge({
  value,
  maxValue = 100,
  label,
  icon,
  suffix = '',
  variant = 'ets2',
  size = 'md',
}: StatGaugeProps) {
  const [displayValue, setDisplayValue] = useState(0);
  
  const percentage = Math.min((value / maxValue) * 100, 100);
  
  const colors = {
    ets2: {
      stroke: 'var(--ets2-primary)',
      glow: 'var(--ets2-glow)',
    },
    ats: {
      stroke: 'var(--ats-primary)',
      glow: 'var(--ats-glow)',
    },
  };

  const sizes = {
    sm: { size: 80, stroke: 6, textSize: 'text-lg' },
    md: { size: 100, stroke: 8, textSize: 'text-2xl' },
    lg: { size: 120, stroke: 10, textSize: 'text-3xl' },
  };

  const config = sizes[size];
  const radius = (config.size - config.stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: config.size, height: config.size }}>
        {/* Background circle */}
        <svg
          width={config.size}
          height={config.size}
          className="transform -rotate-90"
        >
          <circle
            cx={config.size / 2}
            cy={config.size / 2}
            r={radius}
            fill="none"
            stroke="var(--border)"
            strokeWidth={config.stroke}
          />
          {/* Progress circle */}
          <motion.circle
            cx={config.size / 2}
            cy={config.size / 2}
            r={radius}
            fill="none"
            stroke={colors[variant].stroke}
            strokeWidth={config.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{
              filter: `drop-shadow(0 0 6px ${colors[variant].glow})`,
            }}
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-foreground-muted mb-1">{icon}</div>
          <span className={cn('font-bold text-foreground', config.textSize)}>
            {formatNumber(displayValue)}
          </span>
          {suffix && (
            <span className="text-xs text-foreground-muted">{suffix}</span>
          )}
        </div>
      </div>
      
      <span className="text-sm font-medium text-foreground-muted">{label}</span>
    </div>
  );
}
