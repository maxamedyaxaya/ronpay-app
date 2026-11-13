import { ComingSoon } from '@/components/ComingSoon';
import { useStrings } from '@/lib/i18n';

export default function WalletScreen() {
  const s = useStrings();
  return <ComingSoon title={s.tabs.wallet} />;
}
