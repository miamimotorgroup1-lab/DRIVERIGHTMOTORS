import { NextResponse } from "next/server";
import { Resend } from "resend";
import { leadFormSchema, type LeadMode } from "@/lib/lead";

// Must belong to a domain verified in the Resend dashboard, or delivery will fail.
const FROM_EMAIL = "Drive Right Motors <leads@driverightmotors.com>";

const MODE_LABEL: Record<LeadMode, string> = {
  "test-drive": "test drive request",
  financing: "financing request",
  contact: "contact request",
};

function isHoneypotFilled(body: unknown): boolean {
  if (typeof body !== "object" || body === null || !("company" in body)) {
    return false;
  }
  const company = (body as { company?: unknown }).company;
  return typeof company === "string" && company.trim().length > 0;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // Silent spam drop: bots fill hidden fields, humans never see them.
  if (isHoneypotFilled(body)) {
    return NextResponse.json({ ok: true });
  }

  const result = leadFormSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      {
        error: "Please check the form and try again.",
        fieldErrors: result.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const lead = result.data;

  const apiKey = process.env.RESEND_API_KEY;
  const dealerEmail = process.env.DEALER_EMAIL;

  if (!apiKey || !dealerEmail) {
    console.error(
      "Missing RESEND_API_KEY or DEALER_EMAIL environment variable.",
    );
    return NextResponse.json(
      { error: "Unable to send request right now." },
      { status: 500 },
    );
  }

  const carLine = lead.car
    ? `${lead.car.year} ${lead.car.make} ${lead.car.model}`
    : null;
  const subject = carLine
    ? `New ${MODE_LABEL[lead.mode]} — ${carLine}`
    : `New ${MODE_LABEL[lead.mode]}`;

  const lines = [
    `Type: ${MODE_LABEL[lead.mode]}`,
    carLine ? `Vehicle: ${carLine} (${lead.car?.slug})` : null,
    `Name: ${lead.name}`,
    `Email: ${lead.email}`,
    `Phone: ${lead.phone}`,
    lead.preferredDate ? `Preferred date: ${lead.preferredDate}` : null,
    lead.message ? `Message: ${lead.message}` : null,
  ].filter((line): line is string => Boolean(line));

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: dealerEmail,
      replyTo: lead.email,
      subject,
      text: lines.join("\n"),
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Unable to send request right now." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Failed to send lead email:", err);
    return NextResponse.json(
      { error: "Unable to send request right now." },
      { status: 500 },
    );
  }
}
