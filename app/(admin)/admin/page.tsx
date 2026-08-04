import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Star } from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import CarImage from "@/components/ui/CarImage";
import MagneticButton from "@/components/ui/MagneticButton";
import { carImageExists } from "@/lib/car-images";
import type { Car, CarStatus } from "@/lib/inventory";
import { getAllCars } from "@/lib/inventory-queries";
import { createClient } from "@/lib/supabase/server";

// Re-verifies the session server-side (the "secure" check) rather than
// trusting proxy.ts's optimistic cookie check alone — see the Next.js
// authentication guide's Data Access Layer guidance.
export default async function AdminPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (!claims) {
    redirect("/admin/login");
  }

  const cars = await getAllCars();

  return (
    <div className="min-h-screen">
      <AdminHeader />

      <main className="mx-auto max-w-5xl px-6 py-12 md:px-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted">
              Inventory
            </p>
            <h1 className="mt-2 font-display text-display-md font-semibold text-text">
              {cars.length} {cars.length === 1 ? "vehicle" : "vehicles"}
            </h1>
          </div>
          <MagneticButton href="/admin/cars/new" variant="accent">
            <Plus size={16} />
            Add vehicle
          </MagneticButton>
        </div>

        {cars.length === 0 ? (
          <div className="mt-16 border border-dashed border-hairline p-12 text-center">
            <p className="text-sm text-muted">No vehicles yet.</p>
            <MagneticButton href="/admin/cars/new" variant="ghost" className="mt-6">
              Add your first vehicle
            </MagneticButton>
          </div>
        ) : (
          <div className="mt-10 overflow-x-auto">
            <div className="min-w-[640px] border-t border-hairline">
              <div className="grid grid-cols-[80px_1fr_120px_110px_80px] items-center gap-4 border-b border-hairline py-3 text-xs uppercase tracking-[0.15em] text-muted">
                <span>Photo</span>
                <span>Vehicle</span>
                <span>Price</span>
                <span>Status</span>
                <span className="text-center">Featured</span>
              </div>

              <div className="divide-y divide-hairline">
                {cars.map((car) => (
                  <CarRow key={car.id} car={car} />
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function CarRow({ car }: { car: Car }) {
  const title = `${car.year} ${car.make} ${car.model}`;
  const image = car.images[0] ?? "";

  return (
    <Link
      href={`/admin/cars/${car.id}/edit`}
      className="grid grid-cols-[80px_1fr_120px_110px_80px] items-center gap-4 py-3 transition-colors duration-300 hover:bg-elevated"
    >
      <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-card border border-hairline bg-elevated">
        <CarImage
          src={image}
          alt={title}
          fallbackLabel={title}
          hasImage={carImageExists(image)}
          sizes="80px"
          className="object-cover"
        />
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-text">{title}</p>
        <p className="mt-1 truncate text-xs text-muted">{car.slug}</p>
      </div>

      <span className="text-sm text-text">${car.price.toLocaleString()}</span>

      <span>
        <StatusBadge status={car.status} />
      </span>

      <span className="flex justify-center">
        {car.featured && (
          <Star size={16} className="text-accent" fill="currentColor" />
        )}
      </span>
    </Link>
  );
}

const STATUS_LABEL: Record<CarStatus, string> = {
  available: "Available",
  pending: "Pending",
  sold: "Sold",
};

function StatusBadge({ status }: { status: CarStatus }) {
  return (
    <span className="inline-flex rounded-pill border border-hairline bg-elevated px-3 py-1 text-xs text-muted">
      {STATUS_LABEL[status]}
    </span>
  );
}
