import Link from "next/link";
import type { Car } from "@/lib/inventory";
import CarImage from "./CarImage";

type CarCardProps = {
  car: Car;
  hasImage: boolean;
  fluid?: boolean;
};

export default function CarCard({ car, hasImage, fluid = false }: CarCardProps) {
  const title = `${car.year} ${car.make} ${car.model}`;
  const image = car.images[0] ?? "";

  return (
    <Link
      href={`/inventory/${car.slug}`}
      className={`group block ${fluid ? "w-full" : "w-72 shrink-0 sm:w-80"}`}
    >
      <div className="overflow-hidden rounded-card border border-hairline bg-surface transition-all duration-500 motion-reduce:transition-none group-hover:-translate-y-1.5 group-hover:border-accent/60 group-hover:shadow-[0_18px_50px_-12px_rgba(255,46,136,0.35),0_10px_30px_-16px_rgba(34,211,238,0.3)]">
        <div className="relative aspect-[4/3] overflow-hidden bg-elevated">
          <CarImage
            src={image}
            alt={title}
            fallbackLabel={title}
            hasImage={hasImage}
            sizes="(min-width: 640px) 320px, 288px"
            className="object-cover transition-transform duration-700 motion-reduce:transition-none group-hover:scale-105"
          />
          {car.status === "sold" && (
            <span className="absolute left-3 top-3 rounded-pill bg-bg/80 px-3 py-1 text-xs font-medium uppercase tracking-wide text-muted backdrop-blur">
              Sold
            </span>
          )}
        </div>

        <div className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            {title}
          </p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="font-display text-xl text-text">
              ${car.price.toLocaleString()}
            </p>
            <span className="rounded-pill border border-hairline bg-elevated px-3 py-1 text-xs text-muted">
              {car.mileage.toLocaleString()} mi
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
