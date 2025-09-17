import { SignatureTransfer, PermitTransferFrom, PERMIT2_ADDRESS } from '@uniswap/permit2-sdk';
import { Address } from 'viem';

export const getPermitData = (token: Address, spender: Address, amount: bigint, nonce: number, chainId: number) => {
  const permit: PermitTransferFrom = {
    permitted: { token, amount },
    spender,
    nonce,
    deadline: BigInt(Math.floor(Date.now() / 1000) + 60 * 60),
  };

  return SignatureTransfer.getPermitData(permit, PERMIT2_ADDRESS, chainId);
};
