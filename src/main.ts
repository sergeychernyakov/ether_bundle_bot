import { ethers } from 'ethers';
import dotenv from 'dotenv';
import { calculateRequiredEth } from './utils/calculateRequiredEth';
import { getUserConfirmation } from './utils/getUserConfirmation';

dotenv.config();

const {
  INFURA_RPC_URL,
  DEPLOYER_PRIVATE_KEY,
  BUNDLE_PRIVATE_KEYS,
  PERCENT_TOKENS,
  TOKEN_CONTRACT_ADDRESS,
  UNISWAP_FACTORY_ADDRESS,
  UNISWAP_ROUTER_ADDRESS,
  WETH_CONTRACT_ADDRESS,
} = process.env;

if (!INFURA_RPC_URL) throw new Error("INFURA_RPC_URL is not set.");
if (!DEPLOYER_PRIVATE_KEY) throw new Error("DEPLOYER_PRIVATE_KEY is not set.");
if (!BUNDLE_PRIVATE_KEYS) throw new Error("BUNDLE_PRIVATE_KEYS is not set.");
if (!PERCENT_TOKENS) throw new Error("PERCENT_TOKENS is not set.");
if (!TOKEN_CONTRACT_ADDRESS) throw new Error("TOKEN_CONTRACT_ADDRESS is not set.");
if (!UNISWAP_FACTORY_ADDRESS) throw new Error("UNISWAP_FACTORY_ADDRESS is not set.");
if (!UNISWAP_ROUTER_ADDRESS) throw new Error("UNISWAP_ROUTER_ADDRESS is not set.");
if (!WETH_CONTRACT_ADDRESS) throw new Error("WETH_CONTRACT_ADDRESS is not set.");

const infuraRpcUrl = INFURA_RPC_URL as string;
const deployerPrivateKey = DEPLOYER_PRIVATE_KEY as string;
const bundlePrivateKeys = BUNDLE_PRIVATE_KEYS.split(',');
const percentTokens = PERCENT_TOKENS as string;
const tokenContractAddress = TOKEN_CONTRACT_ADDRESS as string;
const uniswapFactoryAddress = UNISWAP_FACTORY_ADDRESS as string;
const uniswapRouterAddress = UNISWAP_ROUTER_ADDRESS as string;
const wethContractAddress = WETH_CONTRACT_ADDRESS as string;

const network = "sepolia";

async function main() {
  console.log('Starting the script...');

  try {
    // Initialize provider
    console.log('Initializing provider...');
    const provider = new ethers.providers.JsonRpcProvider(infuraRpcUrl);

    // Create deployer wallet
    console.log('Creating deployer wallet...');
    const deployerWallet = new ethers.Wallet(deployerPrivateKey, provider);
    console.log(`Deployer wallet address: ${deployerWallet.address}`);

    // Check deployer wallet balance
    console.log('Checking deployer wallet balance...');
    const deployerBalance = await deployerWallet.getBalance();
    console.log(`Deployer wallet balance: ${ethers.utils.formatEther(deployerBalance)} ETH`);

    // Calculate required ETH
    console.log('Calculating required ETH...');
    const requiredEth = await calculateRequiredEth(Number(percentTokens), tokenContractAddress, provider);
    console.log(`Required ETH per wallet: ${requiredEth}`);

    // Ensure there are sufficient funds
    console.log('Calculating total required ETH...');
    const totalRequiredEth = ethers.utils.parseEther(requiredEth.toString()).mul(bundlePrivateKeys.length).add(ethers.utils.parseEther("0.1")); // Adding some buffer for gas fees
    console.log(`Total Required ETH: ${ethers.utils.formatEther(totalRequiredEth)} ETH`);

    if (deployerBalance.lt(totalRequiredEth)) {
      console.error(`Insufficient funds for the transaction. Required: ${ethers.utils.formatEther(totalRequiredEth)} ETH, Available: ${ethers.utils.formatEther(deployerBalance)} ETH`);
      return;
    }

    // Create bundle wallets
    console.log('Creating bundle wallets...');
    const bundleWallets = bundlePrivateKeys.map(pk => new ethers.Wallet(pk, provider));
    console.log('Bundle wallets created.');

    // Get user confirmation
    console.log('Getting user confirmation...');
    const userConfirmation = await getUserConfirmation();

    if (!userConfirmation) {
      console.log("Operation aborted by user.");
      return;
    }

    // Execute open trade and bundle
    console.log('Executing open trade and bundle...');
    await executeOpenTradeAndBundle(deployerWallet, bundleWallets, requiredEth, provider);
    console.log('Open trade and bundle executed successfully.');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

async function executeOpenTradeAndBundle(deployerWallet: ethers.Wallet, bundleWallets: ethers.Wallet[], requiredEth: number, provider: ethers.providers.JsonRpcProvider) {
  try {
    let nonce = await deployerWallet.getTransactionCount();
    console.log('Nonce obtained:', nonce);

    const tokenAddress = tokenContractAddress;

    console.log('Checking if Uniswap V2 pool exists...');
    const poolExists = await checkUniswapPoolExists(tokenAddress, wethContractAddress, provider);

    if (!poolExists) {
      console.log('Creating Uniswap V2 pool...');
      await createUniswapPool(tokenAddress, deployerWallet);
    } else {
      console.log('Uniswap V2 pool already exists.');
    }

    console.log('Approving tokens for Uniswap router...');
    await approveTokens(tokenAddress, uniswapRouterAddress, deployerWallet);

    console.log('Adding liquidity...');
    await addLiquidity(tokenAddress, requiredEth, deployerWallet);

    console.log('Swapping tokens for bundle wallets...');
    for (const wallet of bundleWallets) {
      console.log(`Swapping tokens for wallet: ${wallet.address}`);
      await swapTokensForEth(tokenAddress, requiredEth, wallet);
    }
  } catch (error) {
    console.error('Error in executeOpenTradeAndBundle:', error);
    if (isTransactionError(error)) {
      console.log(`Transaction hash: ${error.transactionHash}`);
      console.log(`Transaction link: https://${network}.etherscan.io/tx/${error.transactionHash}`);
    }
    throw error;
  }
}

function isTransactionError(error: unknown): error is { transactionHash: string } {
  return typeof error === 'object' && error !== null && 'transactionHash' in error;
}

async function checkUniswapPoolExists(token: string, weth: string, provider: ethers.providers.JsonRpcProvider): Promise<boolean> {
  const uniswapFactory = new ethers.Contract(
    uniswapFactoryAddress,
    [
      "function getPair(address tokenA, address tokenB) external view returns (address pair)"
    ],
    provider
  );

  const pairAddress = await uniswapFactory.getPair(token, weth);
  return pairAddress !== ethers.constants.AddressZero;
}

async function createUniswapPool(token: string, wallet: ethers.Wallet) {
  try {
    const uniswapFactory = new ethers.Contract(
      uniswapFactoryAddress,
      [
        "function createPair(address tokenA, address tokenB) external returns (address pair)"
      ],
      wallet
    );

    const tx = await uniswapFactory.createPair(token, wethContractAddress, {
      gasLimit: 1000000 // Adjust gas limit as necessary
    });

    console.log('Waiting for transaction receipt...');
    const receipt = await tx.wait();
    const txHash = receipt.transactionHash;
    console.log(`Uniswap V2 pool created: ${txHash}`);
    console.log(`Transaction link: https://${network}.etherscan.io/tx/${txHash}`);
  } catch (error) {
    console.error('Error in createUniswapPool:', error);
    if (isTransactionError(error)) {
      console.log(`Transaction hash: ${error.transactionHash}`);
      console.log(`Transaction link: https://${network}.etherscan.io/tx/${error.transactionHash}`);
    }
    throw error;
  }
}

async function approveTokens(token: string, spender: string, wallet: ethers.Wallet) {
  try {
    const tokenContract = new ethers.Contract(
      token,
      [
        "function approve(address spender, uint256 amount) external returns (bool)"
      ],
      wallet
    );

    const amount = ethers.constants.MaxUint256; // Approve max amount
    const tx = await tokenContract.approve(spender, amount, {
      gasLimit: 100000 // Adjust gas limit as necessary
    });

    console.log('Waiting for approval transaction receipt...');
    const receipt = await tx.wait();
    const txHash = receipt.transactionHash;
    console.log(`Tokens approved: ${txHash}`);
    console.log(`Transaction link: https://${network}.etherscan.io/tx/${txHash}`);
  } catch (error) {
    console.error('Error in approveTokens:', error);
    if (isTransactionError(error)) {
      console.log(`Transaction hash: ${error.transactionHash}`);
      console.log(`Transaction link: https://${network}.etherscan.io/tx/${error.transactionHash}`);
    }
    throw error;
  }
}

async function addLiquidity(token: string, amountETH: number, wallet: ethers.Wallet) {
  try {
    const uniswapRouter = new ethers.Contract(
      uniswapRouterAddress,
      [
        "function addLiquidityETH(address token, uint amountTokenDesired, uint amountTokenMin, uint amountETHMin, address to, uint deadline) external payable returns (uint amountToken, uint amountETH, uint liquidity)"
      ],
      wallet
    );

    const amountTokenDesired = ethers.utils.parseUnits((amountETH * 1000).toString(), 18); // Adjust token amount as necessary
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from now

    console.log('Parameters for addLiquidityETH:');
    console.log(`amountTokenDesired: ${amountTokenDesired}`);
    console.log(`amountETH: ${amountETH}`);
    console.log(`deadline: ${deadline}`);

    const tx = await uniswapRouter.addLiquidityETH(
      token,
      amountTokenDesired,
      0,
      0,
      wallet.address,
      deadline,
      { value: ethers.utils.parseEther(amountETH.toString()), gasLimit: 1000000 } // Manual gas limit
    );

    console.log('Waiting for transaction receipt...');
    const receipt = await tx.wait();
    const txHash = receipt.transactionHash;
    console.log('Liquidity added:', txHash);
    console.log(`Transaction link: https://${network}.etherscan.io/tx/${txHash}`);
  } catch (error) {
    console.error('Error in addLiquidity:', error);
    if (isTransactionError(error)) {
      console.log(`Transaction hash: ${error.transactionHash}`);
      console.log(`Transaction link: https://${network}.etherscan.io/tx/${error.transactionHash}`);
    }
    throw error;
  }
}

async function swapTokensForEth(token: string, amountIn: number, wallet: ethers.Wallet) {
  try {
    const uniswapRouter = new ethers.Contract(
      uniswapRouterAddress,
      [
        "function swapExactTokensForETHSupportingFeeOnTransferTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external"
      ],
      wallet
    );

    const tx = await uniswapRouter.swapExactTokensForETHSupportingFeeOnTransferTokens(
      ethers.utils.parseUnits(amountIn.toString(), 18),
      0,
      [token, wethContractAddress], // WETH address
      wallet.address,
      Math.floor(Date.now() / 1000) + 60 * 20 // deadline: 20 minutes from now
    );

    console.log('Waiting for transaction receipt...');
    const receipt = await tx.wait();
    const txHash = receipt.transactionHash;
    console.log(`Tokens swapped for ETH: ${txHash}`);
    console.log(`Transaction link: https://${network}.etherscan.io/tx/${txHash}`);
  } catch (error) {
    console.error('Error in swapTokensForEth:', error);
    if (isTransactionError(error)) {
      console.log(`Transaction hash: ${error.transactionHash}`);
      console.log(`Transaction link: https://${network}.etherscan.io/tx/${error.transactionHash}`);
    }
    throw error;
  }
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
