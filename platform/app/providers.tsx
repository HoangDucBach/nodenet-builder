"use client";

import type { ThemeProviderProps } from "next-themes";

import * as React from "react";
import { HeroUIProvider } from "@heroui/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { WagmiProvider, cookieToInitialState, type Config } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createAppKit } from "@reown/appkit/react";
import { coreDao } from "@reown/appkit/networks";

import constants from "@/utils/constants";
import wagmi from "@/utils/wagmi";
import { coreTestnet } from "@/utils/wagmi";
import { siteConfig } from "@/config/site";

export interface ProvidersProps {
  cookies: string | null;
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NonNullable<
      Parameters<ReturnType<typeof useRouter>["push"]>[1]
    >;
  }
}

const queryClient = new QueryClient();

createAppKit({
  networks: [coreDao, coreTestnet],
  defaultNetwork: coreTestnet,
  adapters: [wagmi],
  metadata: {
    name: siteConfig.name,
    description: siteConfig.description,
    url: "nodenet-builder.vercel.app",
    icons: ["/favicon.ico"],
  },
  themeMode: "light",
  projectId: constants.walletconnet.PROJECT_ID,
});

export function Providers({ children, themeProps, cookies }: ProvidersProps) {
  const router = useRouter();
  const initialState = cookieToInitialState(
    wagmi.wagmiConfig as Config,
    cookies,
  );

  return (
    <WagmiProvider
      config={wagmi.wagmiConfig as Config}
      initialState={initialState}
    >
      <QueryClientProvider client={queryClient}>
        <HeroUIProvider navigate={router.push}>
          <NextThemesProvider forcedTheme="light" {...themeProps}>
            {children}
          </NextThemesProvider>
        </HeroUIProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
