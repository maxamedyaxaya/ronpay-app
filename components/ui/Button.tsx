import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

import { cn } from '@/lib/cn';
import { colors } from '@/lib/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'light' | 'glass' | 'gold' | 'ghost' | 'danger';
export type ButtonSize = 'md' | 'sm';

const container: Record<ButtonVariant, string> = {
  primary: 'bg-primary',
  secondary: 'border border-border bg-surface',
  outline: 'border border-border bg-transparent',
  light: 'bg-white',
  glass: 'bg-white/15',
  gold: 'bg-gold',
  ghost: 'bg-transparent',
  danger: 'border border-danger/40 bg-danger/15',
};

const label: Record<ButtonVariant, string> = {
  primary: 'text-white',
  secondary: 'text-ink',
  outline: 'text-ink',
  light: 'text-bg',
  glass: 'text-white',
  gold: 'text-bg',
  ghost: 'text-blue',
  danger: 'text-danger',
};

const iconColor: Record<ButtonVariant, string> = {
  primary: colors.white,
  secondary: colors.ink,
  outline: colors.ink,
  light: colors.bg,
  glass: colors.white,
  gold: colors.bg,
  ghost: colors.blue,
  danger: colors.danger,
};

const sizes: Record<ButtonSize, { box: string; text: string; icon: number }> = {
  md: { box: 'h-12 px-5', text: 'text-[15px]', icon: 18 },
  sm: { box: 'min-h-touch px-4', text: 'text-sm', icon: 16 },
};

export type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  accessibilityHint?: string;
};

export function Button({
  label: text,
  onPress,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading = false,
  disabled = false,
  fullWidth = false,
  className,
  accessibilityHint,
}: ButtonProps) {
  const s = sizes[size];
  const inactive = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={text}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy: loading }}
      className={cn(
        'flex-row items-center justify-center rounded-2xl active:opacity-80',
        container[variant],
        s.box,
        fullWidth && 'w-full',
        inactive && 'opacity-50',
        className,
      )}
    >
      <View className="flex-row items-center gap-2">
        {loading ? (
          <ActivityIndicator size="small" color={iconColor[variant]} />
        ) : (
          Icon && <Icon size={s.icon} color={iconColor[variant]} strokeWidth={2.2} />
        )}
        <Text className={cn('font-sans-bold', s.text, label[variant])}>{text}</Text>
      </View>
    </Pressable>
  );
}
