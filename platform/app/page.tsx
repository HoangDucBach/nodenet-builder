import { Link } from "@heroui/link";
import { Snippet } from "@heroui/snippet";
import { Code } from "@heroui/code";
import { button as buttonStyles } from "@heroui/theme";

import { siteConfig } from "@/config/site";
import { GithubIcon } from "@/components/icons";

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
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
        <Link
          isExternal
          className={buttonStyles({
            color: "primary",
            radius: "full",
            variant: "shadow",
          })}
          href={siteConfig.links.docs}
        >
          Documentation
        </Link>
        <Link
          isExternal
          className={buttonStyles({ variant: "bordered", radius: "full" })}
          href={siteConfig.links.github}
        >
          <GithubIcon size={20} />
          GitHub
        </Link>
      </div>
    </section>
  );
}
