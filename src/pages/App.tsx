import { SVG } from '@/assets';
import QRCode from '@/components/QRCode';
import { ConnectButton, useAddRecentTransaction, useConnectModal } from '@rainbow-me/rainbowkit';
import { useMutation } from '@tanstack/react-query';
import classnames from 'classnames';
import { useState } from 'react';
import { BaseError, isAddress, parseAbi, parseUnits } from 'viem';
import { useAccount, useReadContract, useSwitchChain } from 'wagmi';
import { useCustomWriteContract } from './hooks/useCustomWriteContract';
import Button from '@/components/Button';

const USDT_MAINNET = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
const USDT_BASE = '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2';

const ERC20_ABI = parseAbi([
  'function totalSupply() external view returns (uint256)',
  'function transfer(address recipient, uint256 amount) external returns (bool)',
  'function name() external view returns (string)',
  'function decimals() external view returns (uint8)',
  'function symbol() external view returns (string memory)',
  'function balanceOf(address) external view returns (uint256)',
  'function transferFrom(address sender, address recipient, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function approve(address spender, uint256 value) external returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
]);

function buildEIP681ERC20TransferURI(
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

const App = () => {
  const [error, setError] = useState<string | null>(null);
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get('orderId');
  const amount = params.get('amount') || '0';
  const address = params.get('address');
  const paramsChainId = params.get('chainId');
  const { address: accountAddress, isConnected, chainId, chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const usdtAddress = chainId === 1 ? USDT_MAINNET : USDT_BASE;
  const qrcodeLink = buildEIP681ERC20TransferURI(
    usdtAddress,
    address as `0x${string}`,
    parseUnits(amount, 6),
    chainId,
    20000n
  );

  const { openConnectModal } = useConnectModal();
  const { data: allowance, isFetching: isFetchingAllowance } = useReadContract({
    abi: ERC20_ABI, // convert contract is erc404 contract
    address: usdtAddress,
    functionName: 'allowance',
    args: [accountAddress as `0x${string}`, address as `0x${string}`],
    query: { enabled: !!accountAddress && !!address, retry: false },
  });
  const addRecentTransaction = useAddRecentTransaction();
  const { approveAsync, isPending: isApproving } = useCustomWriteContract(ERC20_ABI, 'approve', usdtAddress, {
    onSuccess: (hash) => addRecentTransaction({ hash, description: `Approve $${address} USDT` }),
  });
  const { transferAsync, isPending: isTransferring } = useCustomWriteContract(ERC20_ABI, 'transfer', usdtAddress);
  const { mutate: onPayOrConnection, isPending: isPayPending } = useMutation({
    mutationFn: async () => {
      setError(null);
      if (!isConnected) {
        openConnectModal?.();
        return;
      }
      if (!address || !amount || !isAddress(address)) return;
      if (!allowance || allowance < BigInt(amount)) {
        await approveAsync([address, BigInt(amount)]);
      }
      await transferAsync([address, BigInt(amount)]);
    },
    onError: (error) => {
      console.error(error);
      if (error instanceof BaseError) {
        setError(error.shortMessage);
      } else {
        setError(error.message);
      }
    },
  });
  const isBusy = isFetchingAllowance || isApproving || isTransferring || isPayPending;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen sm:py-8 sm:px-4">
      <div className="w-full sm:w-fit px-6 py-6 bg-#0f1117/60 backdrop-blur-md sm:rounded-2xl flex flex-col items-center justify-center gap-5 shadow-[0_8px_32px_rgba(0,0,0,0.35)] border border-#2a2f3a/60">
        <div className="flex items-center gap-3">
          <img src={SVG.USDT} alt="USDT" className="w-8 h-8" />
          <h1 className="text-#e5e7eb text-2xl font-semibold tracking-wide">USDT 支付</h1>
        </div>
        <div className="text-#9aa4b2 text-sm">订单号: {orderId || '-'}</div>
        <div className="rounded-xl bg-#1A1B1F border border-#293041/70 shadow-inner">
          <QRCode data={qrcodeLink} width={268} height={268} />
        </div>

        <div className="w-full flex items-center justify-right">
          {isConnected && <ConnectButton chainStatus="full" accountStatus="address" />}
        </div>

        <div className="w-full flex flex-col sm:items-center gap-3 text-sm text-#cbd5e1 sm:grid sm:grid-cols-[68px_1fr]">
          <span className="text-#9aa4b2">收款地址</span>
          <span className="truncate font-mono text-#e5e7eb/90" title={address || ''}>
            {address || '-'}
          </span>
          <span className="text-#9aa4b2">支付金额</span>
          <span className="font-medium">{amount ? `${amount} USDT` : '-'}</span>
          <span className="text-#9aa4b2">支付网络</span>
          <div className="flex items-center justify-between">
            <span>{chain ? chain.name : '-'}</span>
          </div>
        </div>

        {error && <div className="text-#ef4444 text-sm">{error}</div>}

        <div className="mt-2 w-full flex items-center justify-center">
          <Button
            onClick={() => onPayOrConnection()}
            disabled={isBusy}
            className={classnames(
              'inline-flex items-center justify-center w-full h-12 rounded-xl btn-primary ',
              isBusy && 'cursor-not-allowed pointer-events-none'
            )}
          >
            <div className="h-8 flex items-center justify-center">
              {isBusy ? '处理中…' : isConnected ? '立即支付' : '连接钱包'}
              {isConnected && !isBusy && amount ? ` ${amount} USDT` : ''}
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default App;
