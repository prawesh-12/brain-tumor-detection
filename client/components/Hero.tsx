import Image from "next/image";
import StatsCard from "./StatsCard";

export default function Hero() {
  return (
    <section id="home" className="mx-auto flex min-h-0 w-full max-w-[1360px] flex-1 px-4 pb-6 pt-6 sm:px-6 lg:px-8">
      <div className="relative h-full min-h-0 w-full overflow-hidden rounded-[2rem] border border-black/10 bg-[#f7f7f2] px-4 pb-6 pt-6 sm:px-8">
        <div className="pointer-events-none absolute inset-x-0 top-10 z-20 text-center">
          <h1 className="font-headline text-[clamp(80px,12vw,140px)] font-[350] leading-[0.86] tracking-tight text-white [text-shadow:0_2px_18px_rgba(0,0,0,0.45)]">
            BrainShield AI
          </h1>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 top-[84px] z-10 flex items-end justify-center sm:top-[90px] lg:top-[72px]">
          <Image
            src="/brain-image-bg.png"
            alt="Brain illustration"
            width={1000}
            height={900}
            priority
            className="h-[108%] w-auto max-w-none object-contain"
          />
        </div>

        <div className="relative z-30 grid h-full content-end gap-6 lg:grid-cols-2 lg:items-end">
          <div className="space-y-2 pb-2">
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-white">
              AI-POWERED TUMOR DETECTION
            </p>
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-white">
              FOR CLINICAL RESEARCH
            </p>
            <a
              href="#about-model"
              className="inline-block pt-1 text-sm font-medium text-white underline underline-offset-4"
            >
              Learn more -&gt;
            </a>
          </div>

          <div className="justify-self-start lg:justify-self-end">
            <StatsCard />
          </div>
        </div>
      </div>
    </section>
  );
}
