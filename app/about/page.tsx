import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import LeadTrigger from "@/components/ui/LeadTrigger";
import Reveal from "@/components/ui/Reveal";
import { DEALER } from "@/lib/dealer";
import { CANVAS, GUTTER } from "@/lib/layout";

const TITLE = "About — Drive Right Motors";
const DESCRIPTION =
  "Drive Right Motors is a used-car dealership in Miami — hand-picked, inspected, and priced honestly.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
  },
};

const EYEBROW = "text-xs uppercase tracking-[0.2em] text-muted";
const TEXT_LINK =
  "group inline-flex items-center gap-2 text-sm text-muted transition-colors duration-300 hover:text-text";

const TRUST_POINTS = [
  {
    title: "Inspected before it's listed",
    body: "Every car goes through a full inspection before it reaches the lot.",
  },
  {
    title: "Honest, upfront pricing",
    body: "The price you see is the price. No surprises at the desk.",
  },
  {
    title: "Zero pressure",
    body: "Take your time. Drive it twice. We're not going anywhere.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* HEADER */}
      <section className={`pb-16 pt-40 md:pb-20 md:pt-48 ${GUTTER}`}>
        <Reveal stagger={0.1}>
          <p className={EYEBROW}>About</p>
          <h1 className="mt-6 font-display text-display-xl font-semibold text-text">
            Cars we&apos;d drive ourselves.
          </h1>
        </Reveal>
      </section>

      {/* STORY */}
      <section className={`pb-24 md:pb-32 ${GUTTER}`}>
        <Reveal stagger={0.15} className="max-w-2xl space-y-6">
          <p className="text-xl leading-relaxed text-muted md:text-2xl">
            Drive Right Motors is a used-car dealership in Miami with a
            simple rule: we only sell cars we&apos;d put our own name behind.
            Every vehicle is hand-picked, inspected top to bottom, and priced
            honestly — no inflated stickers, no back-and-forth, no pressure.
          </p>
          <p className="text-xl leading-relaxed text-muted md:text-2xl">
            Stop by the lot, take something for a drive, and make the call on
            your own time. If it&apos;s right, it&apos;s right. If it&apos;s
            not, no hard feelings.
          </p>
        </Reveal>
      </section>

      {/* TRUST POINTS */}
      <section className="border-y border-hairline py-32 md:py-48">
        <div className={`grid ${CANVAS} grid-cols-12 gap-y-16 ${GUTTER}`}>
          <Reveal className="col-span-12 sm:col-span-6 lg:col-span-4">
            <p className="font-display text-display-sm font-semibold text-text">
              {TRUST_POINTS[0].title}
            </p>
            <p className="mt-4 text-sm text-muted">{TRUST_POINTS[0].body}</p>
          </Reveal>
          <Reveal
            delay={0.15}
            className="col-span-12 sm:col-span-6 lg:col-span-4 lg:col-start-6 lg:border-l lg:border-hairline lg:pl-12"
          >
            <p className="font-display text-display-sm font-semibold text-text">
              {TRUST_POINTS[1].title}
            </p>
            <p className="mt-4 text-sm text-muted">{TRUST_POINTS[1].body}</p>
          </Reveal>
          <Reveal
            delay={0.3}
            className="col-span-12 sm:col-span-6 lg:col-span-3 lg:col-start-10 lg:border-l lg:border-hairline lg:pl-12"
          >
            <p className="font-display text-display-sm font-semibold text-text">
              {TRUST_POINTS[2].title}
            </p>
            <p className="mt-4 text-sm text-muted">{TRUST_POINTS[2].body}</p>
          </Reveal>
        </div>
      </section>

      {/* VISIT */}
      <section className="py-32 md:py-48">
        <div className={`grid ${CANVAS} grid-cols-12 gap-6 ${GUTTER}`}>
          <Reveal className="col-span-12 lg:col-span-4">
            <p className={EYEBROW}>Visit the lot</p>
            <address className="mt-6 text-lg not-italic text-text">
              {DEALER.addressLines[0]}
              <br />
              {DEALER.addressLines[1]}
            </address>

            <ul className="mt-6 space-y-1 text-sm text-muted">
              {DEALER.hours.map((row) => (
                <li key={row.day}>
                  <span className="text-text">{row.day}</span> — {row.time}
                </li>
              ))}
            </ul>

            <a
              href={DEALER.phone.href}
              className="mt-6 inline-block text-sm text-muted transition-colors duration-300 hover:text-text"
            >
              {DEALER.phone.display}
            </a>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <LeadTrigger mode="contact" variant="accent">
                Contact us
              </LeadTrigger>
              <a
                href={DEALER.directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={TEXT_LINK}
              >
                Get directions
                <ArrowRight
                  size={14}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </a>
            </div>
          </Reveal>

          <Reveal
            delay={0.15}
            className="col-span-12 mt-12 lg:col-span-7 lg:col-start-6 lg:mt-0"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden border border-hairline lg:aspect-auto lg:h-full lg:min-h-[420px]">
              <iframe
                src={DEALER.mapEmbedUrl}
                className="absolute inset-0 h-full w-full grayscale invert-[0.92] contrast-[0.9]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Map to ${DEALER.name}`}
              />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
