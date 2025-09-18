import { Chain } from '@rainbow-me/rainbowkit';
import { mainnet, base, bsc, arbitrum, optimism, polygon, avalanche } from 'viem/chains';

export const SUPPORTED_CHAINS: [Chain, ...Chain[]] = [mainnet, base, bsc, arbitrum, optimism, polygon, avalanche];
