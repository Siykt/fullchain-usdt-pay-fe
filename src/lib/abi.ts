import { parseAbi } from 'viem';

const ERC20_ABI = parseAbi([
  'function transfer(address recipient, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function approve(address spender, uint256 value) external returns (bool)',
]);

const PERMIT2_ABI = parseAbi([
  'struct TokenPermissions { address token; uint256 amount; }',
  'struct PermitTransferFrom { TokenPermissions permitted; uint256 nonce; uint256 deadline; }',
  'struct SignatureTransferDetails {  address to; uint256 requestedAmount; }',
  'function permitTransferFrom(PermitTransferFrom permit, SignatureTransferDetails calldata transferDetail, address owner, bytes calldata signature) external',
]);

export const ABI = {
  ERC20_ABI,
  PERMIT2_ABI,
};
