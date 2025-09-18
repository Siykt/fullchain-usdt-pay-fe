export function buildEIP681URI(
  tokenAddress: string,
  recipientAddress: string,
  amount: bigint,
  chainId?: number,
  gas?: bigint
) {
  const chainSuffix = chainId ? `@${chainId}` : '';
  const params = new URLSearchParams();
  params.set('address', recipientAddress);
  params.set('uint256', amount.toString());
  if (gas) params.set('gas', gas.toString());
  return `ethereum:${tokenAddress}${chainSuffix}/transfer?${params.toString()}`;
}
