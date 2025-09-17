import { Address } from 'viem';

const USDT_MAINNET = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
const USDT_BASE = '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2';
const USDT_POLYGON = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F';
const USDT_BSC = '0x55d398326f99059ff775485246999027b3197955';
const USDT_ARBITRUM = '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9';
const USDT_AVALANCHE = '0xc7198437980c041c805a1edcba50c1ce5db95118';

export function getUSDTAddress(chainId = 1): Address {
  switch (chainId) {
    case 1:
      return USDT_MAINNET;
    case 137:
      return USDT_POLYGON;
    case 56:
      return USDT_BSC;
    case 42161:
      return USDT_ARBITRUM;
    case 43114:
      return USDT_AVALANCHE;
    case 8453:
      return USDT_BASE;
  }
  return USDT_MAINNET;
}
