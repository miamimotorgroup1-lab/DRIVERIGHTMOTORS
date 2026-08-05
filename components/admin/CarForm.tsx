"use client";

import { Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import ImageUploader from "@/components/admin/ImageUploader";
import MagneticButton from "@/components/ui/MagneticButton";
import type { Car } from "@/lib/inventory";
import {
  CAR_STATUSES,
  SLUG_PATTERN,
  carFormSchema,
  makeSlugSeed,
  slugify,
  type CarFormValues,
  type CarStatusValue,
} from "@/lib/car-schema";
import {
  checkSlugAvailable,
  createCar,
  deleteCar,
  updateCar,
  type CarFieldErrors,
} from "@/app/(admin)/admin/cars/actions";

type CarFormProps =
  | { mode: "create"; car?: undefined }
  | { mode: "edit"; car: Car };

// Numeric fields are kept as strings while editing (so the input can be
// briefly empty mid-edit) and coerced by carFormSchema (z.coerce.number())
// on submit.
type FormState = {
  make: string;
  model: string;
  year: string;
  price: string;
  mileage: string;
  bodyType: string;
  transmission: string;
  drivetrain: string;
  fuelType: string;
  exteriorColor: string;
  interiorColor: string;
  engine: string;
  vin: string;
  description: string;
  slug: string;
  features: string[];
  images: string[];
  status: CarStatusValue;
  featured: boolean;
};

function emptyForm(): FormState {
  return {
    make: "",
    model: "",
    year: "",
    price: "",
    mileage: "",
    bodyType: "",
    transmission: "",
    drivetrain: "",
    fuelType: "",
    exteriorColor: "",
    interiorColor: "",
    engine: "",
    vin: "",
    description: "",
    slug: "",
    features: [],
    images: [],
    status: "available",
    featured: false,
  };
}

function carToForm(car: Car): FormState {
  return {
    make: car.make,
    model: car.model,
    year: String(car.year),
    price: String(car.price),
    mileage: String(car.mileage),
    bodyType: car.bodyType,
    transmission: car.transmission,
    drivetrain: car.drivetrain,
    fuelType: car.fuelType,
    exteriorColor: car.exteriorColor,
    interiorColor: car.interiorColor,
    engine: car.engine,
    vin: car.vin,
    description: car.description,
    slug: car.slug,
    features: car.features,
    images: car.images,
    status: car.status,
    featured: car.featured,
  };
}

type SubmitStatus = "idle" | "submitting" | "success" | "error";
type SlugStatus = "idle" | "checking" | "available" | "taken";

const FIELD_BASE =
  "w-full border-b bg-transparent py-2 text-sm text-text placeholder:text-muted";

function fieldClass(hasError: boolean) {
  return `${FIELD_BASE} ${hasError ? "border-red-400/60" : "border-hairline focus:border-accent"}`;
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.15em] text-muted">
        {label}
      </span>
      <div className="mt-2">{children}</div>
      {error ? (
        <p className="mt-1 text-xs text-red-400">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-muted">{hint}</p>
      ) : null}
    </label>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-display text-lg font-semibold text-text">
      {children}
    </h2>
  );
}

function ListEditor({
  label,
  items,
  onChange,
  placeholder,
  error,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
  error?: string;
}) {
  const [draft, setDraft] = useState("");

  function add() {
    const value = draft.trim();
    if (!value) return;
    onChange([...items, value]);
    setDraft("");
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className={fieldClass(false)}
        />
        <button
          type="button"
          onClick={add}
          aria-label={`Add ${label.toLowerCase()}`}
          className="shrink-0 rounded-pill border border-hairline p-2 text-muted transition-colors duration-300 hover:border-accent hover:text-accent"
        >
          <Plus size={16} />
        </button>
      </div>

      {items.length > 0 && (
        <ul className="mt-3 space-y-2">
          {items.map((item, index) => (
            <li
              key={`${item}-${index}`}
              className="flex items-center justify-between gap-3 rounded-card border border-hairline bg-elevated px-3 py-2 text-sm text-text"
            >
              <span className="min-w-0 break-all">{item}</span>
              <button
                type="button"
                onClick={() => onChange(items.filter((_, i) => i !== index))}
                aria-label={`Remove ${item}`}
                className="shrink-0 text-muted transition-colors duration-300 hover:text-red-400"
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}

export default function CarForm({ mode, car }: CarFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() =>
    car ? carToForm(car) : emptyForm(),
  );
  // Existing cars keep their slug fixed on load; only future make/model/year
  // edits re-trigger auto-generation if the user hasn't touched it since.
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [errors, setErrors] = useState<CarFieldErrors>({});
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const [slugStatus, setSlugStatus] = useState<SlugStatus>("idle");
  const [deleteArmed, setDeleteArmed] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState<"idle" | "deleting" | "error">(
    "idle",
  );
  const slugCheckId = useRef(0);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateIdentity(
    patch: Partial<Pick<FormState, "year" | "make" | "model">>,
  ) {
    setForm((prev) => {
      const next = { ...prev, ...patch };
      if (!slugTouched) {
        next.slug = makeSlugSeed(next.year || "0", next.make, next.model);
      }
      return next;
    });
  }

  function handleSlugChange(value: string) {
    setSlugTouched(true);
    updateField("slug", value);
  }

  function regenerateSlug() {
    setSlugTouched(false);
    setForm((prev) => ({
      ...prev,
      slug: makeSlugSeed(prev.year || "0", prev.make, prev.model),
    }));
  }

  // Live slug-uniqueness check, debounced — final authority is still the DB
  // unique constraint enforced server-side in createCar/updateCar.
  useEffect(() => {
    const slug = form.slug.trim();
    const requestId = ++slugCheckId.current;
    const needsCheck =
      slug !== "" &&
      SLUG_PATTERN.test(slug) &&
      !(mode === "edit" && slug === car.slug);

    if (!needsCheck) {
      // Deferred (rather than a direct setState in the effect body) so this
      // stays a reaction to an external event, not a render-triggered render.
      const handle = setTimeout(() => {
        if (slugCheckId.current !== requestId) return;
        setSlugStatus("idle");
      }, 0);
      return () => clearTimeout(handle);
    }

    const handle = setTimeout(async () => {
      setSlugStatus("checking");
      try {
        const available = await checkSlugAvailable(
          slug,
          mode === "edit" ? car.id : undefined,
        );
        if (slugCheckId.current !== requestId) return;
        setSlugStatus(available ? "available" : "taken");
      } catch {
        if (slugCheckId.current !== requestId) return;
        setSlugStatus("idle");
      }
    }, 400);
    return () => clearTimeout(handle);
  }, [form.slug, mode, car]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = {
      slug: form.slug,
      make: form.make,
      model: form.model,
      year: form.year,
      price: form.price,
      mileage: form.mileage,
      bodyType: form.bodyType,
      transmission: form.transmission,
      drivetrain: form.drivetrain,
      fuelType: form.fuelType,
      exteriorColor: form.exteriorColor,
      interiorColor: form.interiorColor,
      engine: form.engine,
      vin: form.vin,
      features: form.features,
      description: form.description,
      images: form.images,
      status: form.status,
      featured: form.featured,
    };

    const result = carFormSchema.safeParse(payload);
    if (!result.success) {
      const flat = result.error.flatten().fieldErrors;
      const fieldErrors: CarFieldErrors = {};
      for (const key of Object.keys(flat) as (keyof CarFormValues)[]) {
        const message = flat[key]?.[0];
        if (message) fieldErrors[key] = message;
      }
      setErrors(fieldErrors);
      setFormError("Please check the form and try again.");
      setStatus("error");
      return;
    }

    setErrors({});
    setFormError(null);
    setStatus("submitting");

    const actionResult =
      mode === "create"
        ? await createCar(result.data)
        : await updateCar(car.id, result.data);

    if (!actionResult.success) {
      setFormError(actionResult.error);
      setErrors(actionResult.fieldErrors ?? {});
      setStatus("error");
      return;
    }

    setStatus("success");
    if (mode === "create") {
      router.push("/admin");
    } else {
      router.refresh();
    }
  }

  async function handleDelete() {
    if (mode !== "edit") return;
    if (!deleteArmed) {
      setDeleteArmed(true);
      return;
    }
    setDeleteStatus("deleting");
    const result = await deleteCar(car.id);
    if (!result.success) {
      setDeleteStatus("error");
      setFormError(result.error);
      return;
    }
    router.push("/admin");
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-12">
      <section className="space-y-6">
        <SectionTitle>Identity</SectionTitle>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Make" error={errors.make}>
            <input
              type="text"
              value={form.make}
              onChange={(event) => updateIdentity({ make: event.target.value })}
              className={fieldClass(Boolean(errors.make))}
            />
          </Field>
          <Field label="Model" error={errors.model}>
            <input
              type="text"
              value={form.model}
              onChange={(event) => updateIdentity({ model: event.target.value })}
              className={fieldClass(Boolean(errors.model))}
            />
          </Field>
          <Field label="Year" error={errors.year}>
            <input
              type="number"
              inputMode="numeric"
              value={form.year}
              onChange={(event) => updateIdentity({ year: event.target.value })}
              className={fieldClass(Boolean(errors.year))}
            />
          </Field>
          <Field label="Price (USD)" error={errors.price}>
            <input
              type="number"
              inputMode="numeric"
              value={form.price}
              onChange={(event) => updateField("price", event.target.value)}
              className={fieldClass(Boolean(errors.price))}
            />
          </Field>
          <Field label="Mileage" error={errors.mileage}>
            <input
              type="number"
              inputMode="numeric"
              value={form.mileage}
              onChange={(event) => updateField("mileage", event.target.value)}
              className={fieldClass(Boolean(errors.mileage))}
            />
          </Field>
          <Field
            label="Slug"
            error={
              errors.slug ?? (slugStatus === "taken" ? "Already in use" : undefined)
            }
            hint={
              errors.slug || slugStatus === "taken"
                ? undefined
                : slugStatus === "checking"
                  ? "Checking availability…"
                  : slugStatus === "available"
                    ? "Available"
                    : "Used in the public URL: /inventory/<slug>"
            }
          >
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={form.slug}
                onChange={(event) => handleSlugChange(event.target.value)}
                onBlur={() => updateField("slug", slugify(form.slug))}
                className={fieldClass(
                  Boolean(errors.slug) || slugStatus === "taken",
                )}
              />
              <button
                type="button"
                onClick={regenerateSlug}
                className="shrink-0 whitespace-nowrap text-xs uppercase tracking-[0.15em] text-muted transition-colors duration-300 hover:text-accent"
              >
                Auto
              </button>
            </div>
          </Field>
        </div>
      </section>

      <section className="space-y-6">
        <SectionTitle>Specs</SectionTitle>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Body type" error={errors.bodyType}>
            <input
              type="text"
              value={form.bodyType}
              onChange={(event) => updateField("bodyType", event.target.value)}
              className={fieldClass(Boolean(errors.bodyType))}
            />
          </Field>
          <Field label="Transmission" error={errors.transmission}>
            <input
              type="text"
              value={form.transmission}
              onChange={(event) =>
                updateField("transmission", event.target.value)
              }
              className={fieldClass(Boolean(errors.transmission))}
            />
          </Field>
          <Field label="Drivetrain" error={errors.drivetrain}>
            <input
              type="text"
              value={form.drivetrain}
              onChange={(event) => updateField("drivetrain", event.target.value)}
              className={fieldClass(Boolean(errors.drivetrain))}
            />
          </Field>
          <Field label="Fuel type" error={errors.fuelType}>
            <input
              type="text"
              value={form.fuelType}
              onChange={(event) => updateField("fuelType", event.target.value)}
              className={fieldClass(Boolean(errors.fuelType))}
            />
          </Field>
          <Field label="Exterior color" error={errors.exteriorColor}>
            <input
              type="text"
              value={form.exteriorColor}
              onChange={(event) =>
                updateField("exteriorColor", event.target.value)
              }
              className={fieldClass(Boolean(errors.exteriorColor))}
            />
          </Field>
          <Field label="Interior color" error={errors.interiorColor}>
            <input
              type="text"
              value={form.interiorColor}
              onChange={(event) =>
                updateField("interiorColor", event.target.value)
              }
              className={fieldClass(Boolean(errors.interiorColor))}
            />
          </Field>
          <Field label="Engine" error={errors.engine}>
            <input
              type="text"
              value={form.engine}
              onChange={(event) => updateField("engine", event.target.value)}
              className={fieldClass(Boolean(errors.engine))}
            />
          </Field>
          <Field label="VIN" error={errors.vin}>
            <input
              type="text"
              value={form.vin}
              onChange={(event) => updateField("vin", event.target.value)}
              className={fieldClass(Boolean(errors.vin))}
            />
          </Field>
        </div>
      </section>

      <section className="space-y-6">
        <SectionTitle>Features</SectionTitle>
        <ListEditor
          label="Features"
          items={form.features}
          onChange={(items) => updateField("features", items)}
          placeholder="e.g. Carbon package"
          error={errors.features}
        />
      </section>

      <section className="space-y-6">
        <SectionTitle>Description</SectionTitle>
        <Field label="Description" error={errors.description}>
          <textarea
            value={form.description}
            onChange={(event) => updateField("description", event.target.value)}
            rows={5}
            className={`${fieldClass(Boolean(errors.description))} resize-none`}
          />
        </Field>
      </section>

      <section className="space-y-6">
        <SectionTitle>Images</SectionTitle>
        <p className="text-sm text-muted">
          Upload photos or drag them in below. The first image is the
          inventory card and gallery cover — reorder with the arrows.
        </p>
        <ImageUploader
          images={form.images}
          onChange={(items) => updateField("images", items)}
          error={errors.images}
        />
      </section>

      <section className="space-y-6">
        <SectionTitle>Status</SectionTitle>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Field label="Status" error={errors.status}>
            <select
              value={form.status}
              onChange={(event) =>
                updateField("status", event.target.value as CarStatusValue)
              }
              className={fieldClass(Boolean(errors.status))}
            >
              {CAR_STATUSES.map((option) => (
                <option key={option} value={option}>
                  {option[0].toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          </Field>

          <label className="flex items-center gap-3 pt-6 sm:pt-8">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(event) =>
                updateField("featured", event.target.checked)
              }
              className="h-4 w-4 accent-accent"
            />
            <span className="text-sm text-text">Featured on the home page</span>
          </label>
        </div>
      </section>

      {formError && <p className="text-sm text-red-400">{formError}</p>}
      {status === "success" && mode === "edit" && !formError && (
        <p className="text-sm text-accent">Saved.</p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-6 border-t border-hairline pt-8">
        <MagneticButton
          type="submit"
          variant="accent"
          disabled={status === "submitting"}
        >
          {status === "submitting"
            ? "Saving…"
            : mode === "create"
              ? "Create vehicle"
              : "Save changes"}
        </MagneticButton>

        {mode === "edit" && (
          <div className="flex items-center gap-3">
            {deleteArmed && (
              <button
                type="button"
                onClick={() => setDeleteArmed(false)}
                className="text-sm text-muted transition-colors duration-300 hover:text-text"
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteStatus === "deleting"}
              className={`rounded-pill border px-6 py-3 text-sm font-medium transition-colors duration-300 ${
                deleteArmed
                  ? "border-red-400 bg-red-400/10 text-red-400"
                  : "border-hairline text-muted hover:border-red-400 hover:text-red-400"
              }`}
            >
              {deleteStatus === "deleting"
                ? "Deleting…"
                : deleteArmed
                  ? "Confirm delete"
                  : "Delete vehicle"}
            </button>
          </div>
        )}
      </div>
    </form>
  );
}
