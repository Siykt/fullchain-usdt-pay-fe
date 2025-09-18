import { SVG } from '@/assets';
import Button from '@/components/Button';
import QRCode from '@/components/QRCode';
import { ABI } from '@/lib/abi';
import { getUSDTAddress } from '@/lib/address';
import { buildEIP681URI } from '@/lib/eip681';
import { getPermitData } from '@/lib/permit';
import { ConnectButton, useAddRecentTransaction, useConnectModal } from '@rainbow-me/rainbowkit';
import { useMutation } from '@tanstack/react-query';
import { PERMIT2_ADDRESS } from '@uniswap/permit2-sdk';
import classnames from 'classnames';
import { useEffect, useMemo, useState } from 'react';
import { Address, BaseError, Hash, isAddress, parseUnits } from 'viem';
import { useAccount, useReadContract, useSignTypedData, useSwitchChain, useTransactionCount } from 'wagmi';
import { useCustomWriteContract } from './hooks/useCustomWriteContract';
import { SUPPORTED_CHAINS } from '@/lib/chain';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '@/locales';

const App = () => {
  const [error, setError] = useState<string | null>(null);
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get('orderId');
  const title = params.get('title');
  const amount = params.get('amount') || '0';
  const to = params.get('to') as Address;
  const qrcodeType = params.get('qrcodeType') || 'address';
  const lang = params.get('lang');
  const parsedAmount = parseUnits(amount, 6);
  const paramsChainId = Number(params.get('chain') || '1');
  const paramsChainName = SUPPORTED_CHAINS.find((chain) => chain.id === paramsChainId)?.name || 'Ethereum';
  const { signTypedDataAsync } = useSignTypedData();

  const { t } = useTranslation();

  const { address: accountAddress, isConnected, chainId, chain } = useAccount();
  const { switchChain, switchChainAsync } = useSwitchChain({
    mutation: { onError: (error) => setError(error.message) },
  });
  const usdtAddress = useMemo(() => getUSDTAddress(chainId), [chainId]);
  const qrcodeLink = useMemo(() => {
    if (qrcodeType === 'address') {
      return to;
    }
    return buildEIP681URI(usdtAddress, to as `0x${string}`, parsedAmount, chainId);
  }, [usdtAddress, to, amount, chainId]);
  const { data: nonceData } = useTransactionCount({
    address: accountAddress,
  });

  const { openConnectModal } = useConnectModal();
  const {
    data: allowance,
    isFetching: isFetchingAllowance,
    refetch: refetchAllowance,
  } = useReadContract({
    abi: ABI.ERC20_ABI, // convert contract is erc404 contract
    address: usdtAddress,
    functionName: 'allowance',
    args: [accountAddress as `0x${string}`, PERMIT2_ADDRESS],
    query: { enabled: !!accountAddress, retry: false },
  });
  const { approveAsync, isPending: isApproving } = useCustomWriteContract(ABI.ERC20_ABI, 'approve', usdtAddress, {
    onSuccess: (hash) => addRecentTransaction({ hash, description: `Approve ${to} USDT` }),
  });
  const addRecentTransaction = useAddRecentTransaction();
  const { permitTransferFromAsync, isPending: isTransferring } = useCustomWriteContract(
    ABI.PERMIT2_ABI,
    'permitTransferFrom',
    PERMIT2_ADDRESS
  );
  const { mutate: onPayOrConnection, isPending: isPayPending } = useMutation({
    mutationFn: async () => {
      setError(null);
      if (!isConnected) {
        openConnectModal?.();
        return;
      }

      if (paramsChainId !== chainId) {
        await switchChainAsync({ chainId: paramsChainId });
      }

      if (!to || !amount || !isAddress(to) || !accountAddress) return;
      if (!allowance || allowance < parsedAmount) {
        await approveAsync([PERMIT2_ADDRESS, BigInt('0xffffffffffffffffffffffffffffffffffffffff')]);
      }

      const { data: newAllowance } = await refetchAllowance();
      if (!newAllowance || newAllowance < parsedAmount) {
        setError('Allowance is not enough');
        return;
      }

      // 获取 permit2 签名数据（spender 必须等于 msg.sender，即当前调用者）
      const nonce = nonceData || 1;
      const { domain, types, values } = getPermitData(
        usdtAddress,
        accountAddress as Address,
        parsedAmount,
        nonce,
        paramsChainId
      );

      // 签名
      const signature = await signTypedDataAsync({
        domain: {
          ...domain,
          chainId: paramsChainId,
          salt: domain.salt as Hash,
          verifyingContract: domain.verifyingContract as Hash,
        },
        types,
        message: values as unknown as Record<string, unknown>,
        primaryType: 'PermitTransferFrom',
      });

      // 构造 permitTransferFrom 参数（与 ABI 对齐）
      const permit = {
        nonce: BigInt(nonce),
        permitted: {
          token: usdtAddress,
          amount: parsedAmount,
        },
        deadline: values.deadline as bigint,
      };

      const transferDetails = {
        to,
        requestedAmount: parsedAmount,
      };

      // 调用 permit2 合约执行转账
      const hash = await permitTransferFromAsync([permit, transferDetails, accountAddress, signature as `0x${string}`]);

      addRecentTransaction({
        hash,
        description: `Transfer ${amount} USDT to ${to}`,
      });
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

  useEffect(() => {
    if (isConnected && paramsChainId !== chainId) {
      // 等待插件注入完成
      setTimeout(() => {
        switchChain({ chainId: paramsChainId });
      }, 300);
    }
  }, [paramsChainId, switchChain, chainId, isConnected]);

  useEffect(() => {
    if (lang) {
      changeLanguage(lang as 'zh' | 'en' | 'ru');
    }
  }, [lang]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen sm:py-8 sm:px-4">
      <div className="w-full sm:w-fit px-6 py-6 bg-#0f1117/60 backdrop-blur-md sm:rounded-2xl flex flex-col items-center justify-center gap-5 shadow-[0_8px_32px_rgba(0,0,0,0.35)] border border-#2a2f3a/60">
        <div className="flex items-center gap-2">
          <img src={SVG.USDT} alt="USDT" className="w-8 h-8" />
          <h1 className="text-#e5e7eb text-2xl font-semibold tracking-wide">{t('payment.title')}</h1>
        </div>
        <div className="text-#9aa4b2 text-20px">{title || '-'}</div>
        <div className="text-#9aa4b2 text-sm">
          {t('payment.orderId')}: {orderId || '-'}
        </div>
        <div className="rounded-xl bg-#1A1B1F border border-#293041/70 shadow-inner p-2">
          <QRCode data={qrcodeLink} width={268} height={268} />
        </div>

        {isConnected && (
          <div className="w-full flex-col flex items-end justify-center gap-2">
            <div>
              <ConnectButton chainStatus="full" accountStatus="address" />
            </div>
            <div className="text-#9aa4b2 text-sm">{t('payment.networkTip')}</div>
          </div>
        )}

        <div className="w-full flex flex-col sm:items-center gap-3 text-sm text-#cbd5e1 sm:grid sm:grid-cols-[auto_1fr]">
          <span className="text-#9aa4b2">{t('payment.receiveAddress')}</span>
          <span className="truncate font-mono text-#e5e7eb/90" title={to || ''}>
            {to || '-'}
          </span>
          <span className="text-#9aa4b2">{t('payment.paymentAmount')}</span>
          <span className="font-medium">{amount ? `${amount} USDT` : '-'}</span>
          <span className="text-#9aa4b2">{t('payment.paymentNetwork')}</span>
          <div className="flex items-center justify-between">
            <span>{paramsChainName || '-'}</span>
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
              {isBusy ? t('payment.processing') : isConnected ? t('payment.payNow') : t('payment.connectWallet')}
              {isConnected && !isBusy && amount ? ` ${amount} USDT` : ''}
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default App;
