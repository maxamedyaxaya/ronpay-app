import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Upload, X } from 'lucide-react-native';

import { BackHeader, Button, CopyRow, Input, NoticeBox, QueryState, Select } from '@/components/ui';
import { isApiError, type DepositAccounts } from '@/lib/api';
import { useConfig, useIdempotencyKey, useSubmitDeposit } from '@/lib/api/hooks';
import { format, useStrings } from '@/lib/i18n';
import { formatUsd, parseUsd } from '@/lib/money';
import { colors } from '@/lib/theme';

/** One list for every method: `mobile:zaad`, `bank:salaam`, … */
type MethodKey = `mobile:${string}` | `bank:${string}`;

// Design reference: docs/RoonPay-UI-Design-v1.1.pdf, page 13 (middle). Rules: CLAUDE.md §4.3.
// The deposit stays pending until an admin approves it.
export default function DepositScreen() {
  const config = useConfig();
  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top', 'bottom']}>
      <QueryState query={config}>{(c) => <DepositBody accounts={c.depositAccounts} />}</QueryState>
    </SafeAreaView>
  );
}

function DepositBody({ accounts }: { accounts: DepositAccounts }) {
  const s = useStrings();
  const router = useRouter();
  const submitDeposit = useSubmitDeposit();
  const key = useIdempotencyKey();

  const [method, setMethod] = useState<MethodKey>(`mobile:${accounts.mobile[0].key}`);
  const [amount, setAmount] = useState('');
  const [payer, setPayer] = useState('');
  const [reference, setReference] = useState('');
  const [receipt, setReceipt] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ amount?: string; payer?: string; reference?: string }>({});
  const [sent, setSent] = useState<{ amount: bigint; method: string } | null>(null);

  const [kindPart, keyPart] = method.split(':');
  const kind = kindPart === 'bank' ? 'bank' : 'mobile';
  const m = accounts.mobile.find((x) => x.key === keyPart) ?? accounts.mobile[0];
  const b = accounts.banks.find((x) => x.key === keyPart) ?? accounts.banks[0];
  const bankName = (key: string, name: string) => (key === 'other' ? s.deposit.otherBank : name);
  const methodName = kind === 'mobile' ? m.name : bankName(b.key, b.name);

  async function pickReceipt() {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (!res.canceled && res.assets[0]) setReceipt(res.assets[0].uri);
  }

  function submit() {
    const units = parseUsd(amount);
    const next = {
      amount: units ? undefined : s.deposit.errAmount,
      payer: payer.trim() ? undefined : s.deposit.errPayer,
      reference: reference.trim() ? undefined : s.deposit.errReference,
    };
    setErrors(next);
    if (!units || next.payer || next.reference) return;
    submitDeposit.mutate(
      { req: { method, amount: units, payer, reference, receiptUri: receipt ?? undefined }, key: key.get() },
      {
        onSuccess: () => {
          key.renew();
          setSent({ amount: units, method: methodName });
        },
        onError: (e) => {
          key.renew();
          if (isApiError(e) && e.code === 'DUPLICATE_REFERENCE') setErrors({ reference: s.deposit.errDuplicate });
        },
      },
    );
  }

  if (sent) {
    return (
      <>
        <View className="flex-1 gap-4 px-4 pt-3">
          <BackHeader title={s.deposit.title} />
          <NoticeBox
            tone="success"
            title={s.deposit.successTitle}
            body={format(s.deposit.successBody, { amount: formatUsd(sent.amount), method: sent.method })}
          />
        </View>
        <View className="border-t border-border px-4 py-3">
          <Button label={s.common.backHome} fullWidth onPress={() => router.replace('/')} />
        </View>
      </>
    );
  }

  return (
    <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerClassName="gap-4 px-4 pb-6 pt-3" keyboardShouldPersistTaps="handled">
          <BackHeader title={s.deposit.title} />

          <Select<MethodKey>
            label={s.deposit.method}
            value={method}
            onChange={setMethod}
            options={[
              ...accounts.mobile.map((x) => ({ key: `mobile:${x.key}` as MethodKey, label: x.name, badge: x.name.slice(0, 1), group: s.deposit.mobileMoney })),
              ...accounts.banks.map((x) => ({ key: `bank:${x.key}` as MethodKey, label: bankName(x.key, x.name), badge: x.short, group: s.deposit.bank })),
            ]}
          />

          <View className="rounded-2xl border border-border bg-surface px-4 pb-1 pt-3">
            <Text className="font-sans-bold text-[11px] uppercase tracking-widest text-blue">
              {kind === 'mobile' ? s.deposit.sendTo : s.deposit.transferTo}
            </Text>
            {kind === 'mobile' ? (
              <>
                <CopyRow label={s.deposit.merchantNumber} value={m.merchant} mono />
                <CopyRow label={s.deposit.merchantName} value={m.merchantName} divider={false} />
              </>
            ) : (
              <>
                <View className="border-b border-border py-2.5">
                  <Text className="font-sans text-[11px] text-muted">{s.deposit.bankName}</Text>
                  <Text className="font-sans-bold text-[15px] text-ink">{bankName(b.key, b.name)}</Text>
                </View>
                <CopyRow label={s.deposit.accountName} value={b.accountName} />
                <CopyRow label={s.deposit.accountNumber} value={b.accountNumber} mono />
                <View className="py-2.5">
                  <Text className="font-sans text-[11px] text-muted">{s.deposit.branch}</Text>
                  <Text className="font-sans-bold text-[15px] text-ink">{b.branch}</Text>
                </View>
              </>
            )}
          </View>

          <View className="flex-row gap-3">
            <Input
              className="flex-1"
              label={s.deposit.amount}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="25.00"
              error={errors.amount}
            />
            <Input
              className="flex-1"
              label={kind === 'mobile' ? s.deposit.yourPhone : s.deposit.yourName}
              value={payer}
              onChangeText={setPayer}
              keyboardType={kind === 'mobile' ? 'phone-pad' : 'default'}
              placeholder={kind === 'mobile' ? '063 000 0000' : s.deposit.namePlaceholder}
              error={errors.payer}
            />
          </View>
          <Input
            label={s.deposit.reference}
            value={reference}
            onChangeText={setReference}
            mono
            autoCapitalize="characters"
            placeholder={kind === 'mobile' ? s.deposit.referencePlaceholder : s.deposit.referenceBankPlaceholder}
            error={errors.reference}
          />

          {receipt ? (
            <View className="flex-row items-center gap-3 rounded-2xl border border-border bg-surface p-2.5">
              <Image source={{ uri: receipt }} className="h-12 w-12 rounded-xl" accessibilityIgnoresInvertColors />
              <Pressable onPress={pickReceipt} accessibilityRole="button" className="min-h-touch flex-1 justify-center">
                <Text className="font-sans-semibold text-[13px] text-ink">{s.deposit.receiptAttached}</Text>
              </Pressable>
              <Pressable
                onPress={() => setReceipt(null)}
                accessibilityRole="button"
                accessibilityLabel={s.deposit.removeReceipt}
                className="min-h-touch min-w-touch items-center justify-center"
              >
                <X size={18} color={colors.muted} />
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={pickReceipt}
              accessibilityRole="button"
              className="min-h-touch flex-row items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-3.5 active:opacity-80"
            >
              <Upload size={16} color={colors.muted} />
              <Text className="font-sans-semibold text-[13px] text-muted">{s.deposit.receipt}</Text>
            </Pressable>
          )}

          {/* Admin-editable setting in the real app (CLAUDE.md §4.3). */}
          <NoticeBox tone="warning" title={s.deposit.timeNote} />
          {submitDeposit.isError && !(isApiError(submitDeposit.error) && submitDeposit.error.code === 'DUPLICATE_REFERENCE') ? (
            <NoticeBox tone="danger" title={s.common.errorGeneric} />
          ) : null}
        </ScrollView>

        <View className="border-t border-border px-4 py-3">
          <Button label={s.deposit.submit} fullWidth loading={submitDeposit.isPending} onPress={submit} />
        </View>
    </KeyboardAvoidingView>
  );
}
