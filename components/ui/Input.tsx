import { useState } from 'react';
import { Pressable, Text, TextInput, View, type TextInputProps } from 'react-native';
import { Eye, EyeOff, type LucideIcon } from 'lucide-react-native';

import { cn } from '@/lib/cn';
import { useStrings } from '@/lib/i18n';
import { colors } from '@/lib/theme';

export type InputProps = Omit<TextInputProps, 'className' | 'style' | 'placeholderTextColor'> & {
  label: string;
  error?: string;
  hint?: string;
  icon?: LucideIcon;
  /** JetBrains Mono, for transaction references and codes. */
  mono?: boolean;
  /** Shows a show/hide button for passwords and PINs. */
  password?: boolean;
  className?: string;
};

export function Input({
  label,
  error,
  hint,
  icon: Icon,
  mono = false,
  password = false,
  className,
  onFocus,
  onBlur,
  ...rest
}: InputProps) {
  const s = useStrings();
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);

  return (
    <View className={cn('gap-1.5', className)}>
      <Text className="font-sans-semibold text-xs text-muted">{label}</Text>
      <View
        className={cn(
          'h-12 flex-row items-center gap-3 rounded-xl border bg-bg px-4',
          error ? 'border-danger' : focused ? 'border-primary' : 'border-border',
        )}
      >
        {Icon && <Icon size={18} color={colors.muted} />}
        <TextInput
          {...rest}
          accessibilityLabel={label}
          secureTextEntry={password && hidden}
          placeholderTextColor={colors.muted}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          className={cn('h-full flex-1 text-[15px] text-ink', mono ? 'font-mono' : 'font-sans')}
        />
        {password && (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            accessibilityRole="button"
            accessibilityLabel={hidden ? s.common.showPassword : s.common.hidePassword}
            hitSlop={8}
            className="-mr-3 min-h-touch min-w-touch items-center justify-center"
          >
            {hidden ? <Eye size={18} color={colors.muted} /> : <EyeOff size={18} color={colors.muted} />}
          </Pressable>
        )}
      </View>
      {error ? (
        <Text className="font-sans-medium text-xs text-danger" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : hint ? (
        <Text className="font-sans text-xs text-muted">{hint}</Text>
      ) : null}
    </View>
  );
}
