import { ComingSoon } from '@/components/ComingSoon';
import { useStrings } from '@/lib/i18n';

export default function PackagesScreen() {
  const s = useStrings();
  return <ComingSoon title={s.tabs.packages} />;
}
