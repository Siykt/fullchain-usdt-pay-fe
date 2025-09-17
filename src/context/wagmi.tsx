import { RainbowKitProvider, darkTheme, getDefaultConfig } from '@rainbow-me/rainbowkit';
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
import { FC, PropsWithChildren } from 'react';
import { WagmiProvider } from 'wagmi';
import { base, mainnet } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } },
});

const config = getDefaultConfig({
  projectId: '-',
  appName: 'Fullchain USDT pay',
  chains: [
    mainnet,
    base,
    //sepolia, baseSepolia
  ],
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
