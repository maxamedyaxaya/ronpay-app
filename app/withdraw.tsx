import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronRight, Clock, Lock } from 'lucide-react-native';

import { BackHeader, Button, Input, NoticeBox, QueryState } from '@/components/ui';
import { isApiError, type Config, type Profile } from '@/lib/api';
import { both, useConfig, useIdempotencyKey, useProfile, useRequestWithdrawal, useWallet } from '@/lib/api/hooks';
import { cn } from '@/lib/cn';
import { format, useStrings } from '@/lib/i18n';
import { formatUsd, parseUsd, usd } from '@/lib/money';
import { colors } from '@/lib/theme';

// Design reference: docs/RoonPay-UI-Design-v1.1.pdf, page 13 (right). Rules: CLAUDE.md §4.7
// (minimum, daily limit, no fee, amount locked, PIN required). The checks here only help the
// member; the API checks everything again.
export default function WithdrawScreen() {
  const wallet = useWallet();
  const config = useConfig();
  const profile = useProfile();
  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top', 'bottom']}>
      <QueryState query={both(both(wallet, config), profile)}>
        {([[w, c], p]) => <WithdrawBody available={w.available} config={c} profile={p} />}
      </QueryState>
    </SafeAreaView>
  );
}

function WithdrawBody({ available, config, profile }: { available: bigint; config: Config; profile: Profile }) {
  const s = useStrings();
  const router = useRouter();
  const { minimum, dailyLimit } = config.withdraw;
  const { withdrawMethod: method, withdrawNumber: number } = profile;
  const request = useRequestWithdrawal();
  const key = useIdempotencyKey();

  const [text, setText] = useState(formatUsd(minimum).slice(1));
  const [step, setStep] = useState<'amount' | 'pin' | 'done'>('amount');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [pinError, setPinError] = useState<string | undefined>();

  const amount = parseUsd(text);
  const max = available < dailyLimit ? available : dailyLimit;

  // Quick picks: the minimum, two whole dollars above it (if affordable), and Max.
  const picks = [minimum, minimum + usd(1), minimum + usd(2)].filter((p) => p <= max);

  function check(): string | undefined {
    if (!amount) return s.withdraw.errAmount;
    if (amount < minimum) return format(s.withdraw.errBelowMin, { amount: formatUsd(minimum) });
    if (amount > available) return format(s.withdraw.errBalance, { amount: formatUsd(available) });
    if (amount > dailyLimit) return format(s.withdraw.errLimit, { amount: formatUsd(dailyLimit) });
    return undefined;
  }

  function next() {
    const e = check();
    setError(e);
    if (!e) setStep('pin');
  }

  function send() {
    if (!/^\d{4}$/.test(pin)) {
      setPinError(s.withdraw.errPin);
      return;
    }
    setPinError(undefined);
    if (!amount) return;
    request.mutate(
      { req: { amount, pin }, key: key.get() },
      {
        onSuccess: () => {
          key.renew();
          setStep('done');
        },
        onError: (e) => {
          // A refused request is final for this key; a new try gets a new key.
          key.renew();
          if (!isApiError(e)) return setPinError(s.common.errorGeneric);
          switch (e.code) {
            case 'WRONG_PIN':
              setPin('');
              return setPinError(s.withdraw.errPinWrong);
            case 'EMAIL_NOT_CONFIRMED':
              return setPinError(s.withdraw.emailTitle);
            case 'BELOW_MINIMUM':
              setStep('amount');
              return setError(format(s.withdraw.errBelowMin, { amount: formatUsd(minimum) }));
            case 'ABOVE_DAILY_LIMIT':
              setStep('amount');
              return setError(format(s.withdraw.errLimitLeft, { amount: formatUsd((e.details.left as bigint) ?? 0n) }));
            case 'INSUFFICIENT_BALANCE':
              setStep('amount');
              return setError(format(s.withdraw.errBalance, { amount: formatUsd(available) }));
            default:
              return setPinError(s.common.errorGeneric);
          }
        },
      },
    );
  }

  if (step === 'done' && amount) {
    return (
      <>
        <View className="flex-1 gap-4 px-4 pt-3">
          <BackHeader title={s.withdraw.title} />
          <NoticeBox
            tone="success"
            title={s.withdraw.successTitle}
            body={format(s.withdraw.successBody, { amount: formatUsd(amount), number: `${method} · ${number}` })}
          />
        </View>
        <View className="border-t border-border px-4 py-3">
          <Button label={s.common.backHome} fullWidth onPress={() => router.replace('/')} />
        </View>
      </>
    );
  }

  if (!profile.emailConfirmed) {
    return (
      <View className="flex-1 gap-4 px-4 pt-3">
        <BackHeader title={s.withdraw.title} />
        <NoticeBox tone="warning" title={s.withdraw.emailTitle} body={s.withdraw.emailBody} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerClassName="gap-4 px-4 pb-6 pt-3" keyboardShouldPersistTaps="handled">
          <BackHeader title={s.withdraw.title} />

          <View className={cn('rounded-3xl border bg-surface p-4', error ? 'border-danger' : 'border-border')}>
            <Text className="text-center font-sans text-xs text-muted">{s.withdraw.amountTo}</Text>
            <View className="flex-row items-center justify-center">
              <Text className="font-sans-extrabold text-[40px] text-ink">$</Text>
              <TextInput
                value={text}
                onChangeText={(t) => {
                  setText(t);
                  setError(undefined);
                }}
                keyboardType="decimal-pad"
                accessibilityLabel={s.withdraw.amountLabel}
                editable={step === 'amount'}
                className="min-w-[60px] py-1 font-sans-extrabold text-[40px] text-ink"
                placeholder="0.00"
                placeholderTextColor={colors.muted}
              />
            </View>
            <View className="flex-row justify-between">
              <Text className="font-sans text-[11px] text-muted">{format(s.withdraw.min, { amount: formatUsd(minimum) })}</Text>
              <Text className="font-sans text-[11px] text-muted">{format(s.withdraw.available, { amount: formatUsd(available) })}</Text>
            </View>
            {step === 'amount' && (
              <View className="mt-3 flex-row gap-2 rounded-2xl border border-border bg-bg p-1">
                {[...picks.map((p) => ({ key: String(p), label: formatUsd(p, { whole: true }), value: p })), { key: 'max', label: s.withdraw.max, value: max }].map(
                  (q) => {
                    const active = amount === q.value;
                    return (
                      <Pressable
                        key={q.key}
                        onPress={() => {
                          setText(formatUsd(q.value).slice(1).replace(/,/g, ''));
                          setError(undefined);
                        }}
                        accessibilityRole="button"
                        accessibilityState={{ selected: active }}
                        className={cn('min-h-touch flex-1 items-center justify-center rounded-xl', active && 'border border-primary bg-primary/15')}
                      >
                        <Text className={cn('font-sans-bold text-[13px]', active ? 'text-ink' : 'text-muted')}>{q.label}</Text>
                      </Pressable>
                    );
                  },
                )}
              </View>
            )}
            {error ? (
              <Text className="mt-2 text-center font-sans-medium text-xs text-danger" accessibilityLiveRegion="polite">
                {error}
              </Text>
            ) : null}
          </View>

          <View className="gap-2">
            <Text className="px-1 font-sans-semibold text-xs text-muted">{s.withdraw.sendTo}</Text>
            {/* Changing the number happens in Profile → Withdrawal number. */}
            <Pressable
              onPress={() => router.navigate('/profile')}
              accessibilityRole="button"
              className="min-h-touch flex-row items-center gap-3 rounded-2xl border border-border bg-surface p-3.5"
            >
              <View className="h-9 w-9 items-center justify-center rounded-xl bg-success/20">
                <Text className="font-sans-extrabold text-sm text-success">{method.slice(0, 1)}</Text>
              </View>
              <View className="flex-1">
                <Text className="font-sans-bold text-[15px] text-ink">{`${method} · ${number}`}</Text>
                <Text className="font-sans text-xs text-muted">{s.withdraw.defaultNumber}</Text>
              </View>
              <ChevronRight size={18} color={colors.muted} />
            </Pressable>
          </View>

          <View className="rounded-2xl border border-border bg-surface px-4 py-2">
            <View className="flex-row justify-between py-1.5">
              <Text className="font-sans text-[13px] text-muted">{s.withdraw.amount}</Text>
              <Text className="font-sans-bold text-[13px] text-ink">{amount ? formatUsd(amount) : '—'}</Text>
            </View>
            {/* No withdrawal fee (CLAUDE.md §4.7), so the member receives the full amount. */}
            <View className="flex-row justify-between py-1.5">
              <Text className="font-sans-bold text-[13px] text-ink">{s.withdraw.youReceive}</Text>
              <Text className="font-sans-bold text-base text-success">{amount ? formatUsd(amount) : '—'}</Text>
            </View>
          </View>

          <View className="gap-1.5 px-1">
            <View className="flex-row items-center gap-2">
              <Clock size={13} color={colors.muted} />
              <Text className="font-sans text-xs text-muted">
                {format(s.withdraw.limits, { min: formatUsd(minimum), limit: formatUsd(dailyLimit) })}
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Lock size={13} color={colors.muted} />
              <Text className="font-sans text-xs text-muted">{s.withdraw.lockedNote}</Text>
            </View>
          </View>

          {/* Admin-editable setting in the real app (CLAUDE.md §4.7). */}
          <NoticeBox tone="warning" title={s.withdraw.timeNote} />

          {step === 'pin' && (
            <Input
              label={s.withdraw.pinLabel}
              hint={s.withdraw.pinHint}
              error={pinError}
              value={pin}
              onChangeText={(t) => setPin(t.replace(/\D/g, '').slice(0, 4))}
              keyboardType="number-pad"
              password
              mono
              autoFocus
              maxLength={4}
            />
          )}
        </ScrollView>

        <View className="border-t border-border px-4 py-3">
          {step === 'amount' ? (
            <Button label={s.withdraw.confirm} icon={Lock} fullWidth onPress={next} />
          ) : (
            <Button label={s.withdraw.send} icon={Lock} fullWidth loading={request.isPending} onPress={send} />
          )}
        </View>
    </KeyboardAvoidingView>
  );
}
