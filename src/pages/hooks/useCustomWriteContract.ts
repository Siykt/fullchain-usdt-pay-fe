import { useAddRecentTransaction } from '@rainbow-me/rainbowkit';
import { useCallback } from 'react';
import { ContractFunctionArgs, ContractFunctionName, Hash, Abi as VAbi } from 'viem';
import { UseWriteContractParameters, UseWriteContractReturnType, useWriteContract } from 'wagmi';

type SafeMutationType = NonNullable<UseWriteContractParameters['mutation']>;
type MutationType<Args> = Omit<SafeMutationType, 'onMutate'> & {
  onMutate?: (args: Args) => boolean | void | Promise<boolean | void>;
};

type WriteContractReturnType<FN extends string, Args> = UseWriteContractReturnType & {
  [K in FN as `${K}`]: (args: Args, value?: bigint) => void;
} & {
  [K in FN as `${K}Async`]: (args: Args, value?: bigint) => Promise<Hash>;
};

export function useCustomWriteContract<
  Abi extends VAbi,
  FN extends ContractFunctionName<Abi, 'nonpayable' | 'payable'>,
  Args extends ContractFunctionArgs<Abi, 'nonpayable' | 'payable', FN>
>(abi: Abi, functionName: FN, address: Hash, mutation?: MutationType<Args>) {
  const addRecentTransaction = useAddRecentTransaction();
  const { writeContract, writeContractAsync, ...other } = useWriteContract({
    mutation: {
      ...mutation,
      onSuccess: async (hash, ...args) => {
        addRecentTransaction({ hash, description: `Call ${functionName} method` });
        mutation?.onSuccess?.(hash, ...args);
      },
      onError: (error, ...args) => {
        mutation?.onError?.(error, ...args);
      },
      onMutate: ({ args }) => mutation?.onMutate?.(args as Args),
    },
  });

  type WriteContractParameter = Parameters<typeof writeContract>[0];

  return {
    writeContract,
    writeContractAsync,
    ...other,
    [functionName]: useCallback(
      (args: Args, value?: string) =>
        writeContract({ abi, address, functionName, args, value } as WriteContractParameter),
      [abi, address, functionName, writeContract]
    ),
    [`${functionName}Async`]: useCallback(
      (args: Args, value?: string) =>
        writeContractAsync({ abi, address, functionName, args, value } as WriteContractParameter),
      [abi, address, functionName, writeContractAsync]
    ),
  } as WriteContractReturnType<FN, Args>;
}
