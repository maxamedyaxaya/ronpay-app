import {
  ScrollView,
  Share,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import QRCode from "react-native-qrcode-svg";
import { Share2 } from "lucide-react-native";

import {
  BackHeader,
  Button,
  CopyRow,
  NoticeBox,
  PackageCard,
  QueryState,
} from "@/components/ui";
import { isApiError, type Config, type OwnedPackage } from "@/lib/api";
import { both, useConfig, usePackage } from "@/lib/api/hooks";
import { shortDate } from "@/lib/dates";
import { cn } from "@/lib/cn";
import { format, useStrings } from "@/lib/i18n";
import { formatUsd, percentOf } from "@/lib/money";
import { colors } from "@/lib/theme";

function SectionTitle({ children }: { children: string }) {
  return (
    <Text
      className="mt-2 font-sans-bold text-[17px] text-ink"
      accessibilityRole="header"
    >
      {children}
    </Text>
  );
}

// One owned package with its package link (CLAUDE.md §4.5.2). Opened from the Home slider and
// Team → My package links. This screen only shows money; it never moves it.
export default function PackageDetailScreen() {
  const s = useStrings();
  const { id } = useLocalSearchParams<{ id: string }>();
  const pkg = usePackage(id);
  const config = useConfig();

  if (isApiError(pkg.error) && pkg.error.code === "NOT_FOUND") {
    return (
      <SafeAreaView className="flex-1 bg-bg" edges={["top", "bottom"]}>
        <View className="gap-4 px-4 pt-3">
          <BackHeader title={s.packageDetail.title} />
          <NoticeBox tone="warning" title={s.packageDetail.notFound} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top", "bottom"]}>
      <QueryState query={both(pkg, config)}>
        {([p, c]) => <PackageBody p={p} config={c} />}
      </QueryState>
    </SafeAreaView>
  );
}

function PackageBody({ p, config }: { p: OwnedPackage; config: Config }) {
  const s = useStrings();
  const t = s.packageDetail;
  const router = useRouter();
  const { width: screen } = useWindowDimensions();
  const { packageLinkRewardPercent: percent, packageLinkSlots: total } =
    config.settings;
  const tier = s.tiers[p.tier];
  const used = Math.min(p.buyers.length, total);
  const full = used >= total;
  const perSale = percentOf(p.price, percent);
  const earned = perSale * BigInt(used);
  const max = perSale * BigInt(total);
  const price = formatUsd(p.price, { whole: true });

  const share = () =>
    Share.share({
      message: format(s.team.shareMessage, { name: tier, url: p.url }),
    }).catch(() => undefined);

  const stats = [
    { label: t.perSale, value: formatUsd(perSale), tone: "text-ink" },
    { label: t.earned, value: formatUsd(earned), tone: "text-success" },
    { label: t.remaining, value: formatUsd(max - earned), tone: "text-ink" },
    { label: t.maxTotal, value: formatUsd(max), tone: "text-gold" },
  ];

  return (
    <ScrollView
      contentContainerClassName="gap-4 px-4 pb-6 pt-3"
      showsVerticalScrollIndicator={false}
    >
      <BackHeader
        title={t.title}
        subtitle={format(t.boughtOn, { date: shortDate(p.boughtAt) })}
      />

      <PackageCard
        variant="owned"
        width={screen - 32}
        tier={p.tier}
        name={tier}
        price={price}
        priceLabel={s.home.priceLabel}
        reward={{ label: s.home.perReferralLabel, value: formatUsd(perSale) }}
        maxTotal={{ label: s.home.maxTotalLabel, value: formatUsd(max) }}
        activeLabel={s.status.active}
        slots={{
          used,
          total,
          label: s.home.slotsLabel,
          status: full
            ? s.home.slotsFull
            : format(s.home.slotsLeft, { count: total - used }),
        }}
      />

      {/* Package link: share, copy and QR while slots are left. */}
      {full ? (
        <>
          <NoticeBox
            tone="warning"
            title={t.fullTitle}
            body={format(t.fullBody, { total, tier })}
          />
          <Button
            label={format(t.buyAgain, { tier, price })}
            fullWidth
            onPress={() =>
              router.push({ pathname: "/checkout", params: { tier: p.tier } })
            }
          />
        </>
      ) : (
        <View className="gap-3 rounded-3xl border border-border bg-surface p-4">
          <View className="gap-1">
            <Text className="font-sans-bold text-[15px] text-ink">
              {t.linkTitle}
            </Text>
            <Text className="font-sans text-[13px] text-muted">
              {format(t.linkBody, { tier, amount: formatUsd(perSale) })}
            </Text>
          </View>
          <CopyRow
            label={t.linkLabel}
            value={p.url.replace("https://", "")}
            mono
            numberOfLines={1}
            divider={false}
          />
          <View className="items-center gap-2 py-1">
            <View
              className="rounded-2xl bg-white p-3"
              accessible
              accessibilityRole="image"
              accessibilityLabel={format(t.qrA11y, { tier })}
            >
              <QRCode
                value={p.url}
                size={168}
                color={colors.bg}
                backgroundColor={colors.white}
              />
            </View>
            <Text className="font-sans text-xs text-muted">{t.qrTitle}</Text>
          </View>
          <Button label={t.share} icon={Share2} fullWidth onPress={share} />
        </View>
      )}

      <SectionTitle>{t.earningsTitle}</SectionTitle>
      <View className="flex-row flex-wrap gap-2.5">
        {stats.map((st) => (
          <View
            key={st.label}
            className="min-w-[45%] flex-1 rounded-2xl border border-border bg-surface px-3.5 py-3"
            accessible
          >
            <Text className="font-sans text-[11px] text-muted">{st.label}</Text>
            <Text className={cn("mt-0.5 font-sans-extrabold text-lg", st.tone)}>
              {st.value}
            </Text>
          </View>
        ))}
      </View>

      <View className="mt-2 flex-row items-baseline justify-between">
        <Text
          className="font-sans-bold text-[17px] text-ink"
          accessibilityRole="header"
        >
          {t.slotsTitle}
        </Text>
        <Text className="font-sans text-xs text-muted">
          {format(t.slotsNote, { used, total })}
        </Text>
      </View>
      <View className="rounded-3xl border border-border bg-surface px-4">
        {Array.from({ length: total }, (_, i) => {
          const b = p.buyers[i];
          return (
            <View
              key={i}
              className={cn(
                "flex-row items-center gap-3 py-3",
                i < total - 1 && "border-b border-border",
              )}
              accessible
              accessibilityLabel={[
                format(t.slotN, { n: i + 1 }),
                b
                  ? `${b.name}, ${shortDate(b.at)}, +${formatUsd(perSale)}`
                  : t.slotOpen,
              ].join(", ")}
            >
              <View
                className={cn(
                  "h-10 w-10 items-center justify-center rounded-xl",
                  b ? "bg-border" : "border border-dashed border-border",
                )}
              >
                <Text
                  className={cn(
                    "font-sans-bold text-[13px]",
                    b ? "text-ink" : "text-muted",
                  )}
                >
                  {b ? b.initials : i + 1}
                </Text>
              </View>
              <View className="flex-1 gap-0.5">
                <Text
                  className={cn(
                    "font-sans-semibold text-[15px]",
                    b ? "text-ink" : "text-muted",
                  )}
                  numberOfLines={1}
                >
                  {b ? b.name : t.slotOpen}
                </Text>
                <Text className="font-sans text-xs text-muted">
                  {b
                    ? `${format(t.slotN, { n: i + 1 })} · ${shortDate(b.at)}`
                    : t.slotOpenBody}
                </Text>
              </View>
              {b && (
                <Text className="font-sans-bold text-[15px] text-success">
                  {formatUsd(perSale, { sign: true })}
                </Text>
              )}
            </View>
          );
        })}
      </View>

      <SectionTitle>{t.howTitle}</SectionTitle>
      <View className="gap-2.5 rounded-3xl border border-border bg-surface p-4">
        {[
          format(t.how1, { tier }),
          format(t.how2, { percent, amount: formatUsd(perSale) }),
          format(t.how3, { total }),
          t.how4,
        ].map((line, i) => (
          <View key={i} className="flex-row gap-3">
            <View className="h-6 w-6 items-center justify-center rounded-full bg-primary/20">
              <Text className="font-sans-bold text-[11px] text-blue">
                {i + 1}
              </Text>
            </View>
            <Text className="flex-1 font-sans text-[13px] leading-[19px] text-ink">
              {line}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
