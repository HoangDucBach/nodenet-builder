import { Link } from "@heroui/link";
import { Snippet } from "@heroui/snippet";
import { Code } from "@heroui/code";
import { button as buttonStyles } from "@heroui/theme";

import { siteConfig } from "@/config/site";
import { GithubIcon } from "@/components/icons";
import { ConnectButton } from "@/components/ConnectButton";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-16">
        <div className="mt-8">
          <Snippet hideCopyButton hideSymbol variant="bordered" className="border-primary">
            <span className="text-primary">
              Play on Core Chain
            </span>
          </Snippet>
        </div>
        <div className="inline-block max-w-[75%] text-center justify-center">
          <p className={"text-5xl font-bold"}>
            🧩 Build the Network – Conquer the Blockchain Puzzle
          </p>
        </div>
        <p className="text-lg text-secondary text-center font-medium max-w-[50%]">
          Connect nodes, solve intelligent <b>puzzles</b>, build your <span className="text-primary">blockchain network</span>, and earn exciting rewards!
        </p>
        <div className="flex gap-3">
          <ConnectButton />
        </div>
      </section>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10 h-screen">
        <Image src="/image-hero.png" alt="Hero" width={1080} height={600} />
      </section>
    </div>
  );
}
