# EtherBundleBot

EtherBundleBot is a Node.js script designed to automate the process of launching and bundling tokens on the Ethereum blockchain.

## Requirements

- Node.js v14 or higher
- npm (Node Package Manager)
- TypeScript
- ethers.js
- dotenv

## Installation

1. Clone the repository or create a new project:

    ```bash
    git clone https://github.com/your-username/ether_bundle_bot.git
    cd ether_bundle_bot
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Create a `.env` file in the root directory of the project and fill it with the following values:

    ```plaintext
    RPC_URL=https://your_rpc_url
    DEPLOYER_PRIVATE_KEY=your_deployer_private_key
    BUNDLE_PRIVATE_KEYS=your_bundle_private_keys_comma_separated
    PERCENT_TOKENS=desired_percent_tokens
    CONTRACT_ADDRESS=your_contract_address
    ```

    Example:

    ```plaintext
    RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID
    DEPLOYER_PRIVATE_KEY=0xYOUR_DEPLOYER_PRIVATE_KEY
    BUNDLE_PRIVATE_KEYS=0xPRIVATE_KEY1,0xPRIVATE_KEY2,0xPRIVATE_KEY3
    PERCENT_TOKENS=10
    CONTRACT_ADDRESS=0xYOUR_CONTRACT_ADDRESS
    ```

## Usage

1. Ensure that all dependencies are installed and the environment variables are correctly configured.

2. Run the script:

    ```bash
    npm start
    ```

3. The script will perform the following actions:
   - Connect to the Ethereum node using the RPC URL from the `.env` file.
   - Create deployer and bundle wallets based on the provided private keys.
   - Ask the user for the percentage of tokens to bundle.
   - Calculate the required amount of Ether for each wallet.
   - Execute transactions to open trade and bundle tokens in one block.

## Project Structure

```
EtherBundleBot/
├── src/
│   ├── contracts/
│   │   └── YourContract.json
│   ├── utils/
│   │   ├── calculateRequiredEth.ts
│   │   └── getUserConfirmation.ts
│   ├── config/
│   │   └── config.ts
│   ├── main.ts
│   └── types/
│       └── index.d.ts
├── .env
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Key Files

- `src/main.ts`: The main script file that executes the core logic.
- `src/utils/calculateRequiredEth.ts`: Function to calculate the required amount of Ether.
- `src/utils/getUserConfirmation.ts`: Function to get user confirmation.
- `src/config/config.ts`: Configuration file that loads environment variables from `.env`.

## Notes

- Ensure that private keys and RPC URL are stored securely and do not get committed to the repository.
- It is recommended to test the script on a testnet before using it on the mainnet.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
