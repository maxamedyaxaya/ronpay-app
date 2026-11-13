import { Text, View } from 'react-native';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, type LucideIcon } from 'lucide-react-native';

import { cn } from '@/lib/cn';
import { colors } from '@/lib/theme';

export type NoticeTone = 'info' | 'success' | 'warning' | 'danger';

const tones: Record<NoticeTone, { box: string; title: string; icon: LucideIcon; color: string }> = {
  info: { box: 'border-blue/30 bg-blue/10', title: 'text-blue', icon: Info, color: colors.blue },
  success: { box: 'border-success/30 bg-success/10', title: 'text-success', icon: CheckCircle2, color: colors.success },
  warning: { box: 'border-gold/30 bg-gold/10', title: 'text-gold', icon: AlertTriangle, color: colors.gold },
  danger: { box: 'border-danger/30 bg-danger/10', title: 'text-danger', icon: AlertCircle, color: colors.danger },
};

export type NoticeBoxProps = {
  title: string;
  body?: string;
  tone?: NoticeTone;
  className?: string;
};

export function NoticeBox({ title, body, tone = 'info', className }: NoticeBoxProps) {
  const t = tones[tone];
  const Icon = t.icon;
  return (
    <View
      className={cn('flex-row gap-3 rounded-xl border p-3.5', t.box, className)}
      accessibilityRole={tone === 'danger' ? 'alert' : undefined}
    >
      <Icon size={18} color={t.color} />
      <View className="flex-1 gap-0.5">
        <Text className={cn('font-sans-bold text-[13px]', t.title)}>{title}</Text>
        {body && <Text className="font-sans text-xs leading-[18px] text-ink/80">{body}</Text>}
      </View>
    </View>
  );
}
