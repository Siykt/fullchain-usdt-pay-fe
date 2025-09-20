import { Hash, WaitForTransactionReceiptParameters } from 'viem';
import { usePublicClient } from 'wagmi';
import { Chain } from 'wagmi/chains';

type Params = {
  chainId?: Chain['id'];
  refetchInterval?: number;
} & Omit<WaitForTransactionReceiptParameters, 'hash'>;

export function useWaitForTransactionSuccess(params: Params = {}) {
  const publicClient = usePublicClient({ chainId: params.chainId });

  async function waitForTransactionReceipt(hash: Hash) {
    const receipt = await publicClient?.waitForTransactionReceipt({ hash, retryCount: Infinity, ...params });
    if (receipt?.status === 'reverted') {
      throw new Error('Transaction reverted');
    } else if (receipt?.status === 'success') {
      return receipt;
    } else {
      await new Promise((resolve) => setTimeout(resolve, params.refetchInterval || 3000));
      return waitForTransactionReceipt(hash);
    }
  }

  return waitForTransactionReceipt;
}
