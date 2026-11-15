import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Globe, LogOut, MessageCircle } from 'lucide-react-native';

import { ListGroup, ListRow, Segmented, ToggleRow } from '@/components/ui';
import { format, setLang, useLang, useStrings, type Lang } from '@/lib/i18n';
import { sampleProfile } from '@/lib/sample-tabs';
import { colors } from '@/lib/theme';

// Design reference: docs/RoonPay-UI-Design-v1.1.pdf, page 14 (right). Data is temporary (lib/sample-tabs.ts).
// Rows without a screen yet have no onPress; they get wired up as those screens are built.
export default function ProfileScreen() {
  const s = useStrings();
  const lang = useLang();
  const p = sampleProfile;
  const [push, setPush] = useState(true);
  const [nickname, setNickname] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <ScrollView contentContainerClassName="gap-5 px-4 pb-8 pt-3" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center gap-3.5" accessible accessibilityRole="header">
          <View className="h-14 w-14 items-center justify-center rounded-2xl border-2 border-gold bg-border">
            <Text className="font-sans-extrabold text-lg text-ink">{p.initials}</Text>
          </View>
          <View className="flex-1 gap-0.5">
            <Text className="font-sans-extrabold text-xl text-ink">{p.name}</Text>
            <Text className="font-mono text-xs text-muted">{p.phone}</Text>
            <View className="flex-row items-center gap-1.5">
              <View className="h-2 w-2 rounded-full bg-gold" />
              <Text className="font-sans-semibold text-xs text-gold">
                {format(s.profile.memberSince, { tier: s.tiers[p.tier], date: p.since })}
              </Text>
            </View>
          </View>
        </View>

        <ListGroup>
          <ListRow
            title={s.profile.language}
            icon={Globe}
            divider={false}
            right={
              <Segmented<Lang>
                size="sm"
                value={lang}
                onChange={setLang}
                options={[
                  { key: 'en', label: 'EN', accessibilityLabel: s.profile.english },
                  { key: 'so', label: 'SO', accessibilityLabel: s.profile.somali },
                ]}
              />
            }
          />
        </ListGroup>

        <ListGroup title={s.profile.accountSecurity}>
          <ListRow title={s.profile.personalDetails} onPress={() => undefined} />
          <ListRow title={s.profile.withdrawalNumber} subtitle={p.withdrawalNumber} onPress={() => undefined} />
          <ListRow title={s.profile.pin} subtitle={s.profile.pinSub} onPress={() => undefined} />
          <ListRow title={s.profile.logoutAll} onPress={() => undefined} divider={false} />
        </ListGroup>

        <ListGroup title={s.profile.preferences}>
          <ToggleRow title={s.profile.push} subtitle={s.profile.pushSub} value={push} onValueChange={setPush} />
          <ToggleRow
            title={s.profile.nickname}
            subtitle={s.profile.nicknameSub}
            value={nickname}
            onValueChange={setNickname}
            divider={false}
          />
        </ListGroup>

        <ListGroup title={s.profile.help}>
          <ListRow title={s.profile.supportChat} onPress={() => undefined} />
          <ListRow title={s.profile.whatsappSupport} onPress={() => undefined} />
          <ListRow title={s.profile.reportProblem} onPress={() => undefined} />
          <ListRow title={s.profile.legal} onPress={() => undefined} divider={false} />
        </ListGroup>

        {/* TODO: swap the generic chat icon for the official WhatsApp logo asset (CLAUDE.md §7). */}
        <View className="flex-row items-center gap-3 rounded-3xl border border-success/30 bg-success/10 p-4">
          <View className="h-11 w-11 items-center justify-center rounded-2xl bg-success/20">
            <MessageCircle size={20} color={colors.success} />
          </View>
          <View className="flex-1">
            <Text className="font-sans-bold text-[15px] text-ink">{s.profile.groupTitle}</Text>
            <Text className="font-sans text-xs text-muted">{s.profile.groupBody}</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel={s.profile.groupTitle} className="min-h-touch justify-center">
            <View className="rounded-xl bg-success px-4 py-2">
              <Text className="font-sans-bold text-[13px] text-bg">{s.profile.join}</Text>
            </View>
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          className="min-h-touch flex-row items-center justify-center gap-2 rounded-2xl border border-danger/30 bg-danger/10 py-3.5 active:opacity-80"
        >
          <LogOut size={17} color={colors.danger} />
          <Text className="font-sans-bold text-[15px] text-danger">{s.profile.logout}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
