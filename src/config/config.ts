import dotenv from 'dotenv';
dotenv.config();

export const config = {
  rpcUrl: process.env.RPC_URL!,
  deployerPrivateKey: process.env.DEPLOYER_PRIVATE_KEY!,
  bundlePrivateKeys: process.env.BUNDLE_PRIVATE_KEYS!.split(','),
  percentTokens: parseFloat(process.env.PERCENT_TOKENS!),
  contractAddress: process.env.CONTRACT_ADDRESS!,
};
