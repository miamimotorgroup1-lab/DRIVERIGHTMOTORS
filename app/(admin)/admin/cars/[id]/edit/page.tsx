import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import CarForm from "@/components/admin/CarForm";
import { getCarById } from "@/lib/inventory-queries";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Edit vehicle — Admin — Drive Right Motors",
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditCarPage({ params }: PageProps) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) {
    redirect("/admin/login");
  }

  const { id } = await params;
  const car = await getCarById(id);
  if (!car) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <AdminHeader backHref="/admin" backLabel="Inventory" />

      <main className="mx-auto max-w-4xl px-6 py-12 md:px-10">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">
          Edit vehicle
        </p>
        <h1 className="mt-2 font-display text-display-md font-semibold text-text">
          {car.year} {car.make} {car.model}
        </h1>

        <div className="mt-10">
          <CarForm mode="edit" car={car} />
        </div>
      </main>
    </div>
  );
}
