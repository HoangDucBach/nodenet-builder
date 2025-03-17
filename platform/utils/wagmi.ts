import { cookieStorage, createStorage } from "@wagmi/core";
import { coreDao } from "wagmi/chains";
import { type Chain } from "viem";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";

import constants from "./constants";

export const coreTestnet = {
  id: 1115,
  name: "Core Blockchain Testnet",
  rpcUrls: {
    default: {
      http: ["https://rpc.test.btcs.network"],
    },
  },
  nativeCurrency: {
    name: "Testnet Core ",
    symbol: "tCORE",
    decimals: 18,
  },
  blockExplorers: {
    default: {
      name: "Block Explorer",
      url: "https://scan.test.btcs.network",
    },
  },
} as const satisfies Chain;

const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  networks: [coreDao, coreTestnet],
  projectId: constants.walletconnet.PROJECT_ID,
  ssr: true,
});

export default wagmiAdapter;
