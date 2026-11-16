import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut } from 'lucide-react-native';

import { ListGroup, ListRow, ToggleRow } from '@/components/ui';
import { useStrings } from '@/lib/i18n';
import { useProfile } from '@/lib/api/hooks';
import { colors } from '@/lib/theme';
import whatsappLogo from '@/assets/whatsapp.png';

// Design reference: docs/RoonPay-UI-Design-v1.1.pdf, page 14 (right).
// Rows without a screen yet have no onPress; they get wired up as those screens are built.
export default function ProfileScreen() {
  const s = useStrings();
  const p = useProfile().data;
  const [push, setPush] = useState(true);
  const [nickname, setNickname] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <ScrollView contentContainerClassName="gap-5 px-4 pb-8 pt-3" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center gap-3.5" accessible accessibilityRole="header">
          <View className="h-14 w-14 items-center justify-center rounded-2xl bg-border">
            <Text className="font-sans-extrabold text-lg text-ink">{p?.initials ?? ''}</Text>
          </View>
          <View className="flex-1 gap-0.5">
            <Text className="font-sans-extrabold text-xl text-ink">{p?.name ?? ''}</Text>
            <Text className="font-sans text-[13px] text-muted">{p?.email ?? ''}</Text>
          </View>
        </View>

        <ListGroup title={s.profile.accountSecurity}>
          <ListRow title={s.profile.personalDetails} onPress={() => undefined} />
          <ListRow title={s.profile.withdrawalNumber} subtitle={p ? `${p.withdrawMethod} · ${p.withdrawNumber}` : undefined} onPress={() => undefined} />
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

        {/* WhatsApp logo from the asset the owner supplied (CLAUDE.md §7: never redraw it). */}
        <View className="flex-row items-center gap-3 rounded-3xl border border-success/30 bg-success/10 p-4">
          <View className="h-11 w-11 items-center justify-center rounded-2xl bg-success/20">
            <Image source={whatsappLogo} className="h-6 w-6" resizeMode="contain" accessibilityIgnoresInvertColors />
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
