# EtherBundleBot

EtherBundleBot is a Node.js script designed to automate the process of launching and bundling tokens on the Ethereum blockchain.

Требуется скрипт (script), который будет делать bundle свой запуск монеты на Ethereum.

Процесс работы:

1. Контракт я сам развертываю через Remix;

2. Отправляю pk кошелька от deployer на скрипт;

3. Отправляю pk кошельков для bundle на скрипт;

4. Скрипт спрашивает какой % монет я хочу получить с bundle, далее показывает сколько мне нужно эфира добавить на кошельки для bundle согласно LP, нажимаю open trade + bundle.

5. Скрипт делает open trade + bundle. На выходе я получаю монеты на все кошельки добавленные в bundle и даже первее тех, кто сделал bribe tip for validator 0.5 eth.

Запуск скрипта командой по типу ts-node script.ts на Node.js

Вот пример монеты, в которой есть скрипт bundle.

1. Кошелек Deployer https://etherscan.io/address/0xca7b48935bde0acc96feb61676d814cecbe734d4

2. Bundle кошельки https://etherscan.io/address/0xbb11507d4e504e1ace91969ca51f9017cec40f0f

По ссылке «2 days ago» вы можете увидеть все кошельки, составившие bundle.

3. Доказательство того, что "bundle" и "open trade" происходят в одном блоке - на примере блока  20134787. https://etherscan.io/tx/0x63ab4b6e34ac4420c6d462f98984d59a6d18ed70cd184ffe8b94189a5e2e8fc6
https://etherscan.io/tx/0xa90b806d583661cdae1da37bb14fe4ec9cbe32f41e3cb318514389cdd543bbf0

Вот мне нужно тоже самое.


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
