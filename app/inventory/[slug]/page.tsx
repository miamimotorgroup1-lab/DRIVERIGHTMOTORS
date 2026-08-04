import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import CarCard from "@/components/ui/CarCard";
import Gallery from "@/components/ui/Gallery";
import LeadTrigger from "@/components/ui/LeadTrigger";
import Reveal from "@/components/ui/Reveal";
import { carImageExists } from "@/lib/car-images";
import { getAllCars, getCarBySlug, type Car } from "@/lib/inventory";
import { CANVAS, GUTTER } from "@/lib/layout";

const EYEBROW = "text-xs uppercase tracking-[0.2em] text-muted";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllCars().map((car) => ({ slug: car.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const car = getCarBySlug(slug);
  if (!car) return {};

  const price = `$${car.price.toLocaleString()}`;
  const title = `${car.year} ${car.make} ${car.model} — ${price} | Drive Right Motors`;
  const description = `${car.year} ${car.make} ${car.model} for ${price} at Drive Right Motors. ${car.mileage.toLocaleString()} miles, ${car.transmission}, ${car.exteriorColor}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
  };
}

function getRelatedCars(car: Car, allCars: Car[]): Car[] {
  const pool = allCars.filter(
    (candidate) => candidate.slug !== car.slug && candidate.status !== "sold",
  );
  const sameBodyType = pool.filter(
    (candidate) => candidate.bodyType === car.bodyType,
  );
  const sameMake = pool.filter((candidate) => candidate.make === car.make);

  const related: Car[] = [];
  const seen = new Set<string>();
  for (const candidate of [...sameBodyType, ...sameMake]) {
    if (seen.has(candidate.slug)) continue;
    seen.add(candidate.slug);
    related.push(candidate);
    if (related.length === 3) break;
  }
  return related;
}

function SpecChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-pill border border-hairline bg-elevated px-3 py-1.5 text-xs text-muted">
      {children}
    </span>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-hairline py-3">
      <span className="text-xs uppercase tracking-[0.15em] text-muted">
        {label}
      </span>
      <span className="text-sm text-text">{value}</span>
    </div>
  );
}

export default async function CarDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const car = getCarBySlug(slug);

  if (!car) {
    notFound();
  }

  const hasImageList = car.images.map((src) => carImageExists(src));
  const relatedCars = getRelatedCars(car, getAllCars());
  const title = `${car.year} ${car.make} ${car.model}`;

  return (
    <>
      <section className={`pb-16 pt-40 md:pt-48 ${GUTTER}`}>
        <div className={CANVAS}>
          <Reveal>
            <Link
              href="/inventory"
              className="group inline-flex items-center gap-2 text-sm text-muted transition-colors duration-300 hover:text-text"
            >
              <ArrowLeft
                size={14}
                className="transition-transform duration-300 group-hover:-translate-x-1"
              />
              Back to inventory
            </Link>
          </Reveal>

          <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-12">
            <Reveal className="lg:col-span-7">
              <Gallery
                images={car.images}
                hasImageList={hasImageList}
                title={title}
              />
            </Reveal>

            <Reveal
              delay={0.1}
              className="lg:col-span-5 lg:col-start-8 lg:sticky lg:top-24 lg:self-start"
            >
              <p className={EYEBROW}>
                {car.year} {car.make}
              </p>
              <h1 className="mt-4 font-display text-display-lg font-semibold text-text">
                {car.model}
              </h1>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <p className="font-display text-3xl text-text">
                  ${car.price.toLocaleString()}
                </p>
                {car.status === "sold" && (
                  <span className="rounded-pill border border-hairline bg-elevated px-3 py-1 text-xs uppercase tracking-wide text-muted">
                    Sold
                  </span>
                )}
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <SpecChip>{car.mileage.toLocaleString()} mi</SpecChip>
                <SpecChip>{car.transmission}</SpecChip>
                <SpecChip>{car.drivetrain}</SpecChip>
                <SpecChip>{car.fuelType}</SpecChip>
              </div>

              <div className="mt-8 border-t border-hairline">
                <SpecRow label="Exterior" value={car.exteriorColor} />
                <SpecRow label="Interior" value={car.interiorColor} />
                <SpecRow label="Engine" value={car.engine} />
                <SpecRow label="Body type" value={car.bodyType} />
                <SpecRow label="VIN" value={car.vin} />
              </div>

              {car.features.length > 0 && (
                <div className="mt-8 flex flex-wrap gap-2">
                  {car.features.map((feature) => (
                    <span
                      key={feature}
                      className="rounded-pill border border-hairline px-3 py-1 text-xs text-muted"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <LeadTrigger
                  mode="test-drive"
                  car={{
                    slug: car.slug,
                    year: car.year,
                    make: car.make,
                    model: car.model,
                  }}
                  variant="accent"
                >
                  Book test drive
                </LeadTrigger>
                <LeadTrigger
                  mode="financing"
                  car={{
                    slug: car.slug,
                    year: car.year,
                    make: car.make,
                    model: car.model,
                  }}
                  variant="ghost"
                >
                  Get financing
                </LeadTrigger>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className={`pb-24 ${GUTTER}`}>
        <div className={CANVAS}>
          <Reveal>
            <p className="max-w-3xl text-xl leading-relaxed text-muted">
              {car.description}
            </p>
          </Reveal>
        </div>
      </section>

      {relatedCars.length > 0 && (
        <section
          className={`border-t border-hairline py-32 md:py-48 ${GUTTER}`}
        >
          <div className={CANVAS}>
            <Reveal>
              <p className={EYEBROW}>More like this</p>
              <h2 className="mt-3 font-display text-display-md font-semibold text-text">
                Worth a look too.
              </h2>
            </Reveal>

            <Reveal
              stagger={0.1}
              className="mt-12 grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3"
            >
              {relatedCars.map((related) => (
                <CarCard
                  key={related.slug}
                  car={related}
                  hasImage={carImageExists(related.images[0] ?? "")}
                  fluid
                />
              ))}
            </Reveal>
          </div>
        </section>
      )}
    </>
  );
}
