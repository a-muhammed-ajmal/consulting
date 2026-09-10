import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { ContactNotificationEmail } from "@/lib/email/templates/ContactNotification";
import { inquiryTypeLabel, isInquiryTypeValue } from "@/lib/contact/inquiry-types";
import { enforcePublicFormLimits } from "@/lib/rateLimit";
import { Resend } from "resend";
import { z } from "zod";
import { requireResendConfig } from "@/lib/serverEnv";

const RESEND_CONFIG = requireResendConfig();

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(7).max(20),
  companyName: z.string().min(2).max(200),
  inquiryType: z.string().refine(isInquiryTypeValue),
  message: z.string().min(20).max(2000),
});

type ContactData = z.infer<typeof schema>;

/**
 * `New inquiry — {Name}, {Company} — {Label}`.
 *
 * A blank company drops itself and its separator rather than leaving a dangling
 * comma. The server schema requires min(2) on companyName, so that branch is
 * currently unreachable through the form — it is here so the subject cannot
 * break if the schema is ever relaxed.
 */
function notificationSubject(data: ContactData): string {
  const who = [data.name, data.companyName]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join(", ");

  return `New inquiry — ${who} — ${inquiryTypeLabel(data.inquiryType)}`;
}

export async function POST(req: NextRequest) {
  try {
    const data = schema.parse(await req.json());

    // Guard before the Resend send.
    const limited = await enforcePublicFormLimits(req, "contact", data.email);
    if (limited) return limited;

    const supabase = createAdminClient();

    // Store first, always — the message must survive a failed notification.
    // supabase-js RETURNS errors rather than throwing, so this result has to be
    // inspected explicitly or a lost message looks identical to a stored one.
    const { data: stored, error: insertError } = await supabase
      .from("contact_enquiries")
      .insert({
        name: data.name,
        email: data.email,
        phone: data.phone,
        company_name: data.companyName,
        inquiry_type: data.inquiryType,
        message: data.message,
      })
      .select("id")
      .single();

    if (insertError || !stored) {
      // Nothing was stored, so the message genuinely was not received. Telling
      // the visitor it succeeded here would lose it silently.
      console.error("Contact inquiry could not be stored:", insertError);
      return NextResponse.json({ success: false }, { status: 500 });
    }

    // The send is isolated: a Resend outage must not cost us a stored message.
    try {
      const resend = new Resend(RESEND_CONFIG.apiKey);
      const { data: sent, error: sendError } = await resend.emails.send({
        from: `Muhammed Ajmal Consulting <${RESEND_CONFIG.fromEmail}>`,
        to: RESEND_CONFIG.fromEmail,
        replyTo: data.email,
        subject: notificationSubject(data),
        // Rendered as React so every attacker-controlled value is escaped.
        react: ContactNotificationEmail(data),
      });

      if (sendError) {
        console.error(`Contact notification rejected for inquiry ${stored.id}:`, sendError);
        const { error: flagError } = await supabase
          .from("contact_enquiries")
          .update({ email_error: sendError.message ?? "Unknown Resend error" })
          .eq("id", stored.id);
        if (flagError) {
          console.error(`Notification failure could not be recorded for inquiry ${stored.id}:`, flagError);
        }
      } else {
        const { error: flagError } = await supabase
          .from("contact_enquiries")
          .update({ email_sent: true, email_error: null })
          .eq("id", stored.id);
        if (flagError) {
          console.error(`Notification acceptance could not be recorded for inquiry ${stored.id}:`, flagError);
        } else {
          console.info(`Contact notification accepted for inquiry ${stored.id}`, { messageId: sent?.id });
        }
      }
    } catch (sendThrew) {
      console.error(`Contact notification send threw for inquiry ${stored.id}:`, sendThrew);
      const { error: flagError } = await supabase
        .from("contact_enquiries")
        .update({ email_error: sendThrew instanceof Error ? sendThrew.message : "Send threw" })
        .eq("id", stored.id);
      if (flagError) {
        console.error(`Notification failure could not be recorded for inquiry ${stored.id}:`, flagError);
      }
    }

    // The message is stored, so the visitor is told the truth regardless of the
    // notification outcome. They are not asked to resubmit.
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError || error instanceof SyntaxError) {
      return NextResponse.json({ success: false }, { status: 400 });
    }
    console.error("Contact error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
