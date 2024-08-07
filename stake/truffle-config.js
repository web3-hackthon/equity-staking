const HDWalletProvider = require('@truffle/hdwallet-provider');
require('dotenv').config(); // 用于管理环境变量

const MNEMONIC = process.env.MNEMONIC;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const INFURA_API_KEY = process.env.INFURA_API_KEY;
const ALCHEMY_SEPOLIA_API_KEY = process.env.ALCHEMY_SEPOLIA_API_KEY;

module.exports = {
    networks: {
        // ... 其他网络配置 ...
        dev: {
            host: "127.0.0.1",
            port: 8545,
            network_id: "*", // Match any network id
        },
        linea_mainnet: {
            provider: () => new HDWalletProvider({
                privateKeys: [PRIVATE_KEY],
                providerOrUrl: `https://linea-mainnet.infura.io/v3/${INFURA_API_KEY}`
            }),
            network_id: 59144, // Linea 主网 ID
            gas: 5500000,
            confirmations: 2,
            timeoutBlocks: 200,
            skipDryRun: true
        },
        eth_sepolia_testnet: {
            provider: () => new HDWalletProvider({
                privateKeys: [PRIVATE_KEY],
                // providerOrUrl: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`
                providerOrUrl: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_SEPOLIA_API_KEY}`
            }),
            network_id: 11155111, // Linea 测试网 ID
            gas: 29000000,
            gasPrice: 10000000000, // 10 Gwei
            confirmations: 2,
            timeoutBlocks: 200,
            skipDryRun: true
        }
    },

    // 配置编译器
    compilers: {
        solc: {
            version: "0.8.20",
        }
    },
};