'use client';

import { useQueryState, parseAsString, parseAsStringLiteral } from 'nuqs';

/**
 * URL-synced search query.
 * Stores `?q=` in the URL. Returns '' when absent.
 */
export function useSearchParam(key = 'q') {
  const [value, setValue] = useQueryState(key, parseAsString.withDefault(''));
  return [value, setValue] as const;
}

/**
 * URL-synced string filter with a fixed set of allowed values.
 * Returns `defaultValue` when the URL param is absent or invalid.
 *
 * Example: useFilterParam('status', ['all', 'open', 'closed'] as const, 'all')
 */
export function useFilterParam<T extends string>(
  key: string,
  literals: readonly T[],
  defaultValue: T,
) {
  const [value, setValue] = useQueryState(
    key,
    parseAsStringLiteral(literals).withDefault(defaultValue),
  );
  return [value, setValue] as const;
}

/**
 * URL-synced nullable string (for folder selection, etc.).
 * Absent param = null.
 */
export function useNullableParam(key: string) {
  const [value, setValue] = useQueryState(key, parseAsString);
  return [value, setValue] as const;
}
