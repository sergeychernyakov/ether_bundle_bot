import { ethers } from "ethers";
import { config } from "./config/config";
import { calculateRequiredEth } from "./utils/calculateRequiredEth";
import { getUserConfirmation } from "./utils/getUserConfirmation";

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
  const deployerWallet = new ethers.Wallet(config.deployerPrivateKey, provider);
  const bundleWallets = config.bundlePrivateKeys.map(pk => new ethers.Wallet(pk, provider));

  const percentTokens = config.percentTokens;

  const requiredEth = calculateRequiredEth(percentTokens);

  console.log(`Required ETH per wallet: ${requiredEth}`);
  const userConfirmation = await getUserConfirmation();

  if (!userConfirmation) {
    console.log("Operation aborted by user.");
    return;
  }

  await executeOpenTradeAndBundle(deployerWallet, bundleWallets, requiredEth, provider);
}

async function executeOpenTradeAndBundle(deployerWallet: ethers.Wallet, bundleWallets: ethers.Wallet[], requiredEth: number, provider: ethers.providers.JsonRpcProvider) {
  const nonce = await deployerWallet.getTransactionCount();

  const transactions = bundleWallets.map((wallet, index) => {
    return {
      nonce: nonce + index,
      gasLimit: ethers.utils.hexlify(1000000),
      gasPrice: ethers.utils.parseUnits("10", "gwei"),
      to: config.contractAddress,
      value: ethers.utils.parseEther(requiredEth.toString()),
      data: "0x",
    };
  });

  const signedTransactions = await Promise.all(transactions.map(tx => deployerWallet.signTransaction(tx)));
  const txResponses = await Promise.all(signedTransactions.map(stx => provider.sendTransaction(stx)));

  await Promise.all(txResponses.map((txResponse: ethers.providers.TransactionResponse) => txResponse.wait()));

  console.log("Open trade and bundle executed successfully.");
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
