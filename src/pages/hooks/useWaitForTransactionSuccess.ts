import { useMemo, useState } from 'react';
import { Hash, WaitForTransactionReceiptParameters } from 'viem';
import { usePublicClient } from 'wagmi';
import { Chain } from 'wagmi/chains';
import { useQuery } from 'wagmi/query';

type Params = {
  chainId?: Chain['id'];
  refetchInterval?: number;
} & Omit<WaitForTransactionReceiptParameters, 'hash'>;

export function useWaitForTransactionSuccess(params: Params = {}) {
  const publicClient = usePublicClient({ chainId: params.chainId });
  const [hash, setHash] = useState<Hash>();
  const queryEnabled = useMemo(() => !!publicClient && !!hash, [publicClient, hash]);

  const { promise } = useQuery({
    queryKey: ['waitForTransactionReceiptCallback'],
    enabled: queryEnabled,
    queryFn: async () => {
      if (!hash || !publicClient) return null;

      const receipt = await publicClient.getTransactionReceipt({ hash, retryCount: Infinity, ...params });
      if (receipt.status === 'reverted') {
        throw new Error('Transaction reverted');
      }
      return receipt;
    },
    refetchInterval: params.refetchInterval || 3000,
  });

  return (hash: Hash) => {
    setHash(hash);
    return promise;
  };
}
