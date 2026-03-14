import { useQuery } from '@tanstack/react-query';
import type { RoofDataResponse } from '@/lib/roof/types';

async function fetchRoofData(quoteId: string): Promise<RoofDataResponse> {
  const res = await fetch(`/api/portal/roof-data?quoteId=${quoteId}`);
  if (!res.ok) throw new Error('Failed to fetch roof data');
  return res.json();
}

export function useRoofData(quoteId: string | null | undefined) {
  return useQuery<RoofDataResponse>({
    queryKey: ['roof-data', quoteId],
    queryFn: () => fetchRoofData(quoteId!),
    enabled: !!quoteId,
    staleTime: 5 * 60 * 1000,
    // Poll every 30s when GAF data is pending, stop when complete
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.gafStatus === 'pending') return 30_000;
      return false;
    },
  });
}
