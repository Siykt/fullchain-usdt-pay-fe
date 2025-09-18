import { SUPPORTED_CHAINS } from '@/lib/chain';
import { darkTheme, getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import {
  argentWallet,
  coinbaseWallet,
  ledgerWallet,
  metaMaskWallet,
  okxWallet,
  phantomWallet,
  rainbowWallet,
  trustWallet,
  uniswapWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FC, PropsWithChildren } from 'react';
import { WagmiProvider } from 'wagmi';

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } },
});

const config = getDefaultConfig({
  projectId: '-',
  appName: 'Fullchain USDT pay',
  chains: SUPPORTED_CHAINS,
  wallets: [
    {
      groupName: 'Popular',
      wallets: [okxWallet, metaMaskWallet, phantomWallet, walletConnectWallet, rainbowWallet, coinbaseWallet],
    },
    {
      groupName: 'More',
      wallets: [uniswapWallet, argentWallet, trustWallet, ledgerWallet],
    },
  ],
});

export const WagmiContextProvider: FC<PropsWithChildren> = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider showRecentTransactions modalSize="wide" theme={darkTheme()}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
