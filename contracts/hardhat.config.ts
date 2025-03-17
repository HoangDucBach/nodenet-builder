import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  solidity: {
    compilers: [
      {
        version: "0.8.20",
        settings: {
          evmVersion: 'paris',
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },

  networks: {
    hardhat: {},
    testnet: {
      url: 'https://rpc.test.btcs.network',
      accounts: [process.env.PRIVATE_KEY || ''],
      chainId: 1115,
    },

    mainnet: {
      url: 'https://rpc.coredao.org',
      accounts: [process.env.PRIVATE_KEY || ''],
      chainId: 1116,
    },
  },

  mocha: {
    timeout: 20000,
  },

  etherscan: {
    apiKey: {
      testnet: process.env.CORESCAN_API_KEY || "",
      mainnet: process.env.CORESCAN_API_KEY || "",
    },

    customChains: [
      {
        network: "testnet2",
        chainId: 1114,
        urls: {
          apiURL: "https://api.test2.btcs.network/api",
          browserURL: "https://scan.test2.btcs.network/"
        }
      },
      {
        network: "mainnet",
        chainId: 1116,
        urls: {
          apiURL: "https://openapi.coredao.org/api",
          browserURL: "https://scan.coredao.org/"
        }
      }
    ]
  },
  typechain: {
    outDir: "typechain",
  },
  sourcify: {
    enabled: true,
  }
};

export default config;
