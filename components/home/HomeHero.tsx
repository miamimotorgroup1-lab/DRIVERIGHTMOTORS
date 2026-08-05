"use client";

import { useState } from "react";
import type { Car } from "@/lib/inventory";
import HeroHeadline from "./HeroHeadline";
import HeroShowcase from "./HeroShowcase";
import ScrollCue from "./ScrollCue";
import ShowroomIntro from "./ShowroomIntro";

type HomeHeroProps = {
  featuredCars: Car[];
  hasImageBySlug: Record<string, boolean>;
};

// Owns the one piece of cross-component state the intro needs: whether the
// hero's entrance is allowed to play yet. ShowroomIntro calls onDone
// either immediately (already seen this session — nothing ever rendered)
// or once its exit wipe finishes, and only then do the headline/showcase
// entrances fire.
export default function HomeHero({ featuredCars, hasImageBySlug }: HomeHeroProps) {
  const [introDone, setIntroDone] = useState(false);

  return (
    <>
      <ShowroomIntro onDone={() => setIntroDone(true)} />

      <HeroHeadline animate={introDone} />

      <div className="mt-16 flex w-full justify-center lg:absolute lg:inset-y-0 lg:right-[-6vw] lg:mt-0 lg:w-[46vw] lg:max-w-2xl lg:items-center lg:justify-end">
        <div className="w-full max-w-sm lg:max-w-none">
          <HeroShowcase
            cars={featuredCars}
            hasImageBySlug={hasImageBySlug}
            animate={introDone}
          />
        </div>
      </div>

      <div className="hidden lg:absolute lg:inset-y-24 lg:left-[60%] lg:block lg:w-px lg:bg-hairline" />

      <div className="relative z-10 mt-20 lg:absolute lg:bottom-12 lg:left-16 lg:mt-0">
        <ScrollCue />
      </div>
    </>
  );
}
