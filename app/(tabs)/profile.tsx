import { ComingSoon } from '@/components/ComingSoon';
import { useStrings } from '@/lib/i18n';

export default function ProfileScreen() {
  const s = useStrings();
  return <ComingSoon title={s.tabs.profile} />;
}
