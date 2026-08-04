import type { Metadata } from "next";
import { ArrowRight, MapPin } from "lucide-react";
import Link from "next/link";
import HeroImage from "@/components/home/HeroImage";
import ScrollCue from "@/components/home/ScrollCue";
import CarCard from "@/components/ui/CarCard";
import LeadTrigger from "@/components/ui/LeadTrigger";
import MagneticButton from "@/components/ui/MagneticButton";
import Reveal from "@/components/ui/Reveal";
import { carImageExists } from "@/lib/car-images";
import { DEALER } from "@/lib/dealer";
import { getFeaturedCars } from "@/lib/inventory";
import { CANVAS, GUTTER } from "@/lib/layout";

const TITLE = "Drive Right Motors — Pre-Owned Vehicles in Miami";
const DESCRIPTION =
  "Hand-picked, inspected, and honestly priced used cars in Miami. No pressure, no games — just cars worth driving home.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
  },
};

const EYEBROW = "text-xs uppercase tracking-[0.2em] text-muted";
const DISPLAY_HEADLINE =
  "font-display text-display-hero font-semibold text-text";
const TEXT_LINK =
  "group inline-flex items-center gap-2 text-sm text-muted transition-colors duration-300 hover:text-text";

const STATS = [
  { value: "40+", label: "Vehicles in stock" },
  { value: "100%", label: "Inspected before sale" },
  { value: "0", label: "Pressure, ever" },
];

const OFFSETS = ["", "sm:mt-10", "sm:mt-4"];

export default function Home() {
  const featuredCars = getFeaturedCars();
  const heroCar = featuredCars[0];
  const heroHasImage = heroCar
    ? carImageExists(heroCar.images[0] ?? "")
    : false;

  return (
    <>
      {/* HERO */}
      <section
        className={`relative flex min-h-screen flex-col justify-center overflow-hidden pb-32 pt-40 md:pt-48 ${GUTTER}`}
      >
        <Reveal stagger={0.12} className="relative z-10 w-full lg:w-7/12">
          <p className={EYEBROW}>Drive Right Motors — Pre-owned</p>
          <h1 className={`mt-8 ${DISPLAY_HEADLINE}`}>
            Find the one
            <br />
            you&apos;ll actually
            <br />
            keep.
          </h1>
          <p className="mt-8 max-w-sm text-base text-muted">
            Hand-picked, inspected, and priced honestly — no games.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-10">
            <MagneticButton href="/inventory" variant="accent">
              Browse inventory
              <ArrowRight size={16} />
            </MagneticButton>
            <LeadTrigger mode="test-drive" className={TEXT_LINK}>
              Book a test drive
              <ArrowRight
                size={14}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </LeadTrigger>
          </div>
        </Reveal>

        <div className="mt-16 flex w-full justify-center lg:absolute lg:inset-y-0 lg:right-[-6vw] lg:mt-0 lg:w-[46vw] lg:max-w-2xl lg:items-center lg:justify-end">
          <Reveal delay={0.25} className="w-full max-w-sm lg:max-w-none">
            <HeroImage car={heroCar} hasImage={heroHasImage} />
          </Reveal>
        </div>

        <div className="hidden lg:absolute lg:inset-y-24 lg:left-[60%] lg:block lg:w-px lg:bg-hairline" />

        <div className="relative z-10 mt-20 lg:absolute lg:bottom-12 lg:left-16 lg:mt-0">
          <ScrollCue />
        </div>
      </section>

      {/* FEATURED */}
      {featuredCars.length > 0 && (
        <section className={`pb-20 pt-32 md:pb-24 md:pt-48`}>
          <div className={`${CANVAS} ${GUTTER}`}>
            <div className="grid grid-cols-12 gap-6">
              <Reveal className="col-span-12 lg:sticky lg:top-32 lg:col-span-3 lg:self-start">
                <p className={EYEBROW}>Featured</p>
                <h2 className="mt-6 font-display text-display-lg font-semibold text-text">
                  Ready to drive this week.
                </h2>
                <Link href="/inventory" className={`mt-8 ${TEXT_LINK}`}>
                  View all inventory
                  <ArrowRight
                    size={14}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>
              </Reveal>

              <Reveal
                stagger={0.12}
                className="col-span-12 mt-16 flex flex-col gap-16 sm:flex-row sm:flex-wrap sm:justify-between sm:gap-12 lg:col-span-9 lg:col-start-4 lg:mt-0"
              >
                {featuredCars.map((car, index) => (
                  <div key={car.id} className={OFFSETS[index % OFFSETS.length]}>
                    <CarCard
                      car={car}
                      hasImage={carImageExists(car.images[0] ?? "")}
                    />
                  </div>
                ))}
              </Reveal>
            </div>
          </div>
        </section>
      )}

      {/* STAT / PROOF BAND */}
      <section className="border-y border-hairline pb-32 pt-20 md:pb-48 md:pt-24">
        <div className={`grid ${CANVAS} grid-cols-12 gap-y-16 ${GUTTER}`}>
          <Reveal className="col-span-12 sm:col-span-6 lg:col-span-4">
            <p className={DISPLAY_HEADLINE}>{STATS[0].value}</p>
            <p className={`mt-4 ${EYEBROW}`}>{STATS[0].label}</p>
          </Reveal>
          <Reveal
            delay={0.15}
            className="col-span-12 sm:col-span-6 lg:col-span-4 lg:col-start-6 lg:border-l lg:border-hairline lg:pl-12"
          >
            <p className={DISPLAY_HEADLINE}>{STATS[1].value}</p>
            <p className={`mt-4 ${EYEBROW}`}>{STATS[1].label}</p>
          </Reveal>
          <Reveal
            delay={0.3}
            className="col-span-12 sm:col-span-6 lg:col-span-3 lg:col-start-10 lg:border-l lg:border-hairline lg:pl-12"
          >
            <p className={DISPLAY_HEADLINE}>{STATS[2].value}</p>
            <p className={`mt-4 ${EYEBROW}`}>{STATS[2].label}</p>
          </Reveal>
        </div>
      </section>

      {/* FINANCING */}
      <section className="py-32 md:py-48">
        <div className={`grid ${CANVAS} grid-cols-12 gap-6 ${GUTTER}`}>
          <Reveal className="col-span-12 lg:col-span-8">
            <h2 className={DISPLAY_HEADLINE}>
              Financing that
              <br />
              doesn&apos;t waste
              <br />
              your afternoon.
            </h2>
          </Reveal>

          <Reveal
            delay={0.15}
            className="col-span-12 mt-12 lg:col-span-4 lg:col-start-9 lg:mt-0 lg:self-end"
          >
            <p className="text-base text-muted">
              Get pre-qualified online in a couple of minutes, with zero
              impact on your credit score. Walk in already knowing your rate.
            </p>
            <LeadTrigger mode="financing" variant="accent" className="mt-8">
              Get pre-qualified
              <ArrowRight size={16} />
            </LeadTrigger>
          </Reveal>
        </div>
      </section>

      {/* LOCATION / CTA */}
      <section className="border-t border-hairline py-32 md:py-48">
        <div className={`grid ${CANVAS} grid-cols-12 gap-6 ${GUTTER}`}>
          <Reveal className="col-span-12 lg:col-span-3">
            <p className={EYEBROW}>Visit the lot</p>
            <address className="mt-6 flex items-start gap-2 text-sm not-italic text-muted">
              <MapPin className="mt-0.5 shrink-0 text-muted" size={16} />
              <span>
                {DEALER.addressLines[0]}
                <br />
                {DEALER.addressLines[1]}
              </span>
            </address>
            <ul className="mt-6 space-y-1 text-sm text-muted">
              {DEALER.hours.map((row) => (
                <li key={row.day}>
                  <span className="text-text">{row.day}</span> — {row.time}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal
            delay={0.15}
            className="col-span-12 mt-16 lg:col-span-8 lg:col-start-5 lg:mt-0"
          >
            <h2 className={DISPLAY_HEADLINE}>
              Come see it
              <br />
              in person.
            </h2>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <MagneticButton
                href={DEALER.directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="accent"
              >
                Get directions
              </MagneticButton>
              <LeadTrigger mode="contact" variant="ghost">
                Contact us
              </LeadTrigger>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
