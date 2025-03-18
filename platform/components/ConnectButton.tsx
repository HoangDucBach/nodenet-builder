"use client";

import { useAccount } from "wagmi";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { Button } from "@heroui/button";
import { useRouter } from "next/navigation";

export const ConnectButton = () => {
  const wagmiAccount = useAccount();
  const account = useAppKitAccount();
  const { open } = useAppKit();
  const router = useRouter();

  return (
    <div className="column">
      <Button
        color="primary"
        className="mt-4"
        isLoading={wagmiAccount.isConnecting}
        onPress={() => {
          if (!account) {
            open();
          } else {
            router.push("/dashboard");
          }
        }}
      >
        Play now!
      </Button>
    </div>
  );
};
