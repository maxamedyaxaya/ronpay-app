import type { ReactNode } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { useStrings } from '@/lib/i18n';
import { colors } from '@/lib/theme';

import { Button } from './Button';

type Query<T> = { data: T | undefined; isPending: boolean; isError: boolean; refetch: () => unknown };

export type QueryStateProps<T> = {
  query: Query<T>;
  children: (data: T) => ReactNode;
};

/** Shows a spinner while loading, an error with "Try again" on failure, and the content once data is here. */
export function QueryState<T>({ query, children }: QueryStateProps<T>) {
  const s = useStrings();
  if (query.data !== undefined) return <>{children(query.data)}</>;
  if (query.isError) {
    return (
      <View className="flex-1 items-center justify-center gap-4 px-6 py-16">
        <Text className="text-center font-sans text-[15px] text-muted">{s.common.loadError}</Text>
        <Button label={s.common.retry} variant="secondary" onPress={() => void query.refetch()} />
      </View>
    );
  }
  return (
    <View className="flex-1 items-center justify-center py-16" accessibilityLabel={s.common.loading}>
      <ActivityIndicator color={colors.blue} />
    </View>
  );
}
