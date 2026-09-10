import { requireAdminAuth } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Lead } from "@/types";
import { DIMENSION_META } from "@/lib/scoring";
import type { DimensionKey } from "@/types";
import { cn } from "@/lib/utils";
import { BrandMark } from "@/components/layout/BrandLogo";
import { AdminSignOut } from '@/components/admin/AdminSignOut';

function toTitleCase(snake: string) {
  return snake.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const DIMENSION_KEYS: DimensionKey[] = [
  "strategic_clarity",
  "financial_visibility",
  "operations",
  "people_leadership",
  "sales_growth",
];

export default async function LeadBriefingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminAuth();
  const supabase = createAdminClient();
  const { id } = await params;

  const { data: lead, error } = await supabase
    .from("diagnostic_leads")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') notFound();
    console.error(`Legacy lead ${id} could not be loaded:`, error);
    throw new Error('Legacy lead could not be loaded.');
  }
  if (!lead) notFound();

  const typedLead = lead as Lead;

  const dimensionScores = DIMENSION_KEYS.map((key) => {
    const scoreKey = `score_${key}` as keyof Lead;
    const score = typedLead[scoreKey] as number | null;
    return {
      key,
      label: DIMENSION_META[key].label,
      score: score ?? 0,
      isPrimary: typedLead.primary_constraint === key,
      isSecondary: typedLead.secondary_constraint === key,
    };
  }).sort((a, b) => a.score - b.score);

  let thirtyDay: string[] = [];
  let ninetyDay: string[] = [];
  let discussionQuestions: string[] = [];

  if (typedLead.ai_30day_plan) {
    try {
      thirtyDay = JSON.parse(typedLead.ai_30day_plan);
    } catch {
      thirtyDay = [typedLead.ai_30day_plan];
    }
  }
  if (typedLead.ai_90day_plan) {
    try {
      ninetyDay = JSON.parse(typedLead.ai_90day_plan);
    } catch {
      ninetyDay = [typedLead.ai_90day_plan];
    }
  }
  if (typedLead.ai_discussion_questions) {
    try {
      discussionQuestions = JSON.parse(typedLead.ai_discussion_questions);
    } catch {
      discussionQuestions = [typedLead.ai_discussion_questions];
    }
  }

  const severityColors: Record<string, string> = {
    Critical: "bg-danger-soft text-danger border-danger/30",
    Developing: "bg-warning/10 text-warning border-warning/20",
    Progressing: "bg-success-soft text-success border-success/30",
  };

  return (
    <div className="min-h-screen bg-canvas-light">
      <nav className="border-b border-line bg-white text-ink px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/leads"
            className="text-xs text-muted hover:text-brand-ink transition-colors"
          >
            ← All Leads
          </Link>
          <div className="flex items-center gap-2 font-heading font-bold text-[length:var(--step-0)]">
            <BrandMark className="h-7 w-7" />
            <span>Pre-Call Briefing</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/admin/fdi"
            className="text-xs text-brand-ink hover:text-brand transition-colors"
          >
            FDI sessions
          </Link>
          <AdminSignOut />
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Header Card */}
        <div className="bg-white rounded-xl shadow-1 border border-line p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h1 className="font-heading font-extrabold text-ink text-[length:var(--step-3)]">
                {typedLead.name}
              </h1>
              <div className="font-body text-muted text-[length:var(--step-0)] mt-1">
                {typedLead.company_name}
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                <a
                  href={`mailto:${typedLead.email}`}
                  className="font-body text-xs text-brand-ink hover:underline"
                >
                  {typedLead.email}
                </a>
                {typedLead.phone && (
                  <span className="font-body text-xs text-muted">
                    {typedLead.phone}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="font-heading font-extrabold text-ink text-[length:var(--step-4)]">
                {typedLead.health_score ?? "—"}%
              </div>
              <div className="font-body text-muted text-xs mb-1">
                Diagnostic Score
              </div>
              {typedLead.severity_label && (
                <span
                  className={cn("text-xs font-medium px-3 py-1 rounded-full border", severityColors[typedLead.severity_label])}
                >
                  {typedLead.severity_label}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-line">
            <div>
              <div className="text-[length:var(--step--1)] font-heading uppercase tracking-wider text-muted mb-1">
                Industry
              </div>
              <div className="font-body text-[length:var(--step-0)] text-ink">
                {typedLead.industry || "—"}
              </div>
            </div>
            <div>
              <div className="text-[length:var(--step--1)] font-heading uppercase tracking-wider text-muted mb-1">
                Team Size
              </div>
              <div className="font-body text-[length:var(--step-0)] text-ink">
                {typedLead.team_size || "—"}
              </div>
            </div>
            <div>
              <div className="text-[length:var(--step--1)] font-heading uppercase tracking-wider text-muted mb-1">
                Revenue
              </div>
              <div className="font-body text-[length:var(--step-0)] text-ink">
                {typedLead.revenue_range}
              </div>
            </div>
            <div>
              <div className="text-[length:var(--step--1)] font-heading uppercase tracking-wider text-muted mb-1">
                Submitted
              </div>
              <div className="font-body text-[length:var(--step-0)] text-ink">
                {new Date(typedLead.created_at).toLocaleDateString("en-AE", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Dimension Scores */}
        <div className="bg-white rounded-xl shadow-1 border border-line p-6">
          <h2 className="font-heading font-bold text-ink text-[length:var(--step-0)] mb-4">
            Dimension Scores
          </h2>
          <div className="space-y-3">
            {dimensionScores.map((d) => (
              <div key={d.key}>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-body text-[length:var(--step-0)] text-ink">
                      {d.label}
                    </span>
                    {d.isPrimary && (
                      <span className="text-[length:var(--step--1)] font-bold bg-danger-soft text-danger px-2 py-0.5 rounded-full">
                        PRIMARY
                      </span>
                    )}
                    {d.isSecondary && (
                      <span className="text-[length:var(--step--1)] font-bold bg-brand-soft text-brand-ink px-2 py-0.5 rounded-full">
                        SECONDARY
                      </span>
                    )}
                  </div>
                  <span className="font-heading font-bold text-ink text-[length:var(--step-0)]">
                    {d.score}/6
                  </span>
                </div>
                <div className="h-2 bg-brand-tint rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-[width]"
                    style={{
                      width: `${(d.score / 6) * 100}%`,
                      backgroundColor: d.isPrimary
                        ? "var(--color-crimson)"
                        : d.isSecondary
                          ? "var(--color-gold)"
                          : "var(--color-navy)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-line grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-[length:var(--step--1)] font-heading uppercase tracking-wider text-muted mb-1">
                Primary Constraint
              </div>
              <div className="font-body text-[length:var(--step-0)] text-ink font-medium">
                {typedLead.primary_constraint
                  ? toTitleCase(typedLead.primary_constraint)
                  : "—"}
              </div>
            </div>
            <div>
              <div className="text-[length:var(--step--1)] font-heading uppercase tracking-wider text-muted mb-1">
                Secondary Constraint
              </div>
              <div className="font-body text-[length:var(--step-0)] text-ink">
                {typedLead.secondary_constraint
                  ? toTitleCase(typedLead.secondary_constraint)
                  : "—"}
              </div>
            </div>
          </div>
        </div>

        {/* AI Action Plan */}
        {(thirtyDay.length > 0 || ninetyDay.length > 0) && (
          <div className="bg-white rounded-xl shadow-1 border border-line p-6">
            <h2 className="font-heading font-bold text-ink text-[length:var(--step-0)] mb-4">
              AI-Generated Action Plan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {thirtyDay.length > 0 && (
                <div>
                  <h3 className="font-heading font-semibold text-ink text-[length:var(--step-0)] uppercase tracking-wider mb-3">
                    30-Day Priorities
                  </h3>
                  <ol className="space-y-2">
                    {thirtyDay.map((item, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-danger-soft text-danger text-[length:var(--step--1)] font-bold flex items-center justify-center mt-0.5">
                          {i + 1}
                        </span>
                        <span className="font-body text-[length:var(--step-0)] text-ink">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
              {ninetyDay.length > 0 && (
                <div>
                  <h3 className="font-heading font-semibold text-ink text-[length:var(--step-0)] uppercase tracking-wider mb-3">
                    90-Day Directions
                  </h3>
                  <ol className="space-y-2">
                    {ninetyDay.map((item, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-tint text-ink text-[length:var(--step--1)] font-bold flex items-center justify-center mt-0.5">
                          {i + 1}
                        </span>
                        <span className="font-body text-[length:var(--step-0)] text-ink">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Discussion Questions */}
        {discussionQuestions.length > 0 && (
          <div className="bg-white rounded-xl p-6">
            <h2 className="font-heading font-bold text-ink text-[length:var(--step-0)] mb-4">
              Discovery Questions for the Call
            </h2>
            <ol className="space-y-3">
              {discussionQuestions.map((q, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-soft text-brand-ink text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <span className="font-body text-muted text-[length:var(--step-0)]">{q}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Status Flags */}
        <div className="bg-white rounded-xl shadow-1 border border-line p-6">
          <h2 className="font-heading font-bold text-ink text-[length:var(--step-0)] mb-4">
            Lead Status
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Email Sent", value: typedLead.email_sent },
              {
                label: "AI Plan Generated",
                value: typedLead.ai_plan_generated,
              },
              { label: "Call Booked", value: typedLead.booked_call },
              { label: "Contacted", value: typedLead.contacted },
            ].map((flag) => (
              <div key={flag.label} className="text-center">
                <div
                  className={cn("text-[length:var(--step-3)] font-bold mb-1", flag.value ? "text-success" : "text-muted")}
                >
                  {flag.value ? "✔" : "○"}
                </div>
                <div className="font-heading text-xs text-muted uppercase tracking-wider">
                  {flag.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
