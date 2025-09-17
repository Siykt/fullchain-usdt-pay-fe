import { createContext, useContext } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyData = any;

interface RequestArguments {
  method: string;
  params?: unknown[] | object;
}

interface MetaMaskEthereumProvider {
  isMetaMask?: boolean;
  once(eventName: string | symbol, listener: (...args: AnyData[]) => void): this;
  on(eventName: string | symbol, listener: (...args: AnyData[]) => void): this;
  off(eventName: string | symbol, listener: (...args: AnyData[]) => void): this;
  addListener(eventName: string | symbol, listener: (...args: AnyData[]) => void): this;
  removeListener(eventName: string | symbol, listener: (...args: AnyData[]) => void): this;
  removeAllListeners(event?: string | symbol): this;
  request: (args: RequestArguments) => Promise<AnyData>;
}

interface WalletContextProps {
  wallet: MetaMaskEthereumProvider | null;
}

export const WalletContext = createContext<WalletContextProps>({
  wallet: null,
});

export const WalletContextProvider = WalletContext.Provider;

export function useWallet() {
  return useContext(WalletContext);
}
