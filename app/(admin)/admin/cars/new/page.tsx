import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import CarForm from "@/components/admin/CarForm";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Add vehicle — Admin — Drive Right Motors",
  robots: { index: false, follow: false },
};

export default async function NewCarPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen">
      <AdminHeader backHref="/admin" backLabel="Inventory" />

      <main className="mx-auto max-w-4xl px-6 py-12 md:px-10">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">
          New vehicle
        </p>
        <h1 className="mt-2 font-display text-display-md font-semibold text-text">
          Add a vehicle
        </h1>

        <div className="mt-10">
          <CarForm mode="create" />
        </div>
      </main>
    </div>
  );
}
