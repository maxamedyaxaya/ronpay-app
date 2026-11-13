import type { ReactNode } from 'react';
import { View } from 'react-native';

import { cn } from '@/lib/cn';

export type CardProps = {
  children: ReactNode;
  /** `selected` draws the blue highlight used for a chosen package or method. */
  variant?: 'default' | 'selected';
  className?: string;
};

export function Card({ children, variant = 'default', className }: CardProps) {
  return (
    <View
      className={cn(
        'rounded-2xl border p-4',
        variant === 'selected' ? 'border-primary bg-primary/10' : 'border-border bg-surface',
        className,
      )}
    >
      {children}
    </View>
  );
}
