"use client";

import { useAccount } from "wagmi";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { Button } from "@heroui/button";

export const ConnectButton = () => {
  const wagmiAccount = useAccount();
  const account = useAppKitAccount();
  const { open } = useAppKit();

  return (
    <div className="column">
      <Button
        color="primary"
        className="mt-4"
        isLoading={wagmiAccount.isConnecting}
        onPress={() => open()}
      >
        Play now!
      </Button>
    </div>
  );
};
