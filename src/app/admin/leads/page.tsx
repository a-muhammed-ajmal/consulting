import { requireAdminAuth } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Lead } from "@/types";
import { cn } from "@/lib/utils";
import { BrandMark } from "@/components/layout/BrandLogo";
import { AdminSignOut } from '@/components/admin/AdminSignOut';

export default async function AdminLeadsPage() {
  await requireAdminAuth();
  const supabase = createAdminClient();
  const { data: leads, error } = await supabase
    .from("diagnostic_leads")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error('Legacy leads could not be loaded:', error);
    throw new Error('Legacy leads could not be loaded.');
  }

  const severityColors: Record<string, string> = {
    Critical: "bg-danger-soft text-danger",
    Developing: "bg-warning/10 text-warning",
    Progressing: "bg-success-soft text-success",
  };

  return (
    <div className="min-h-screen bg-canvas-light">
      <nav className="border-b border-line bg-white text-ink px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 font-heading font-bold text-[length:var(--step-0)]">
          <BrandMark className="h-7 w-7" />
          <span>Consultant Workspace</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/admin/fdi"
            className="text-xs text-brand-ink hover:text-brand transition-colors"
          >
            FDI sessions
          </Link>
          <span className="font-body text-xs text-muted">
            {leads?.length || 0} leads
          </span>
          <AdminSignOut />
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="font-heading font-extrabold text-ink text-[length:var(--step-3)] mb-6">
          All Leads
        </h1>
        <div className="bg-white rounded-xl shadow-1 border border-line overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[length:var(--step-0)]">
              <thead className="sticky top-0 z-10 bg-white text-ink">
                <tr>
                  {[
                    "Date",
                    "Name",
                    "Company",
                    "Industry",
                    "Team",
                    "Revenue",
                    "Health",
                    "Primary Constraint",
                    "Email",
                    "AI Plan",
                    "Booked",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left font-heading font-semibold text-xs uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {(leads as Lead[]).map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-brand-tint transition-colors"
                  >
                    <td className="px-4 py-3 font-body text-xs text-muted whitespace-nowrap">
                      {new Date(lead.created_at).toLocaleDateString("en-AE", {
                        day: "numeric",
                        month: "short",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/leads/${lead.id}`}
                        className="font-heading font-semibold text-ink hover:text-brand-ink transition-colors whitespace-nowrap"
                      >
                        {lead.name}
                      </Link>
                      <div className="font-body text-xs text-muted">
                        {lead.email}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-body text-xs text-ink whitespace-nowrap">
                      {lead.company_name}
                    </td>
                    <td className="px-4 py-3 font-body text-xs text-muted whitespace-nowrap">
                      {lead.industry || "—"}
                    </td>
                    <td className="px-4 py-3 font-body text-xs text-muted whitespace-nowrap">
                      {lead.team_size || "—"}
                    </td>
                    <td className="px-4 py-3 font-body text-xs text-muted whitespace-nowrap">
                      {lead.revenue_range}
                    </td>
                    <td className="px-4 py-3">
                      {lead.health_score !== null && (
                        <div>
                          <div className="font-heading font-bold text-ink text-[length:var(--step-0)]">
                            {lead.health_score}%
                          </div>
                          {lead.severity_label && (
                            <span
                              className={cn("text-[length:var(--step--1)] font-medium px-2 py-0.5 rounded-full", severityColors[lead.severity_label])}
                            >
                              {lead.severity_label}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-body text-xs text-ink whitespace-nowrap">
                      {lead.primary_constraint?.replace(/_/g, " ") || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn("text-[length:var(--step--1)] font-medium px-2 py-0.5 rounded-full", lead.email_sent ? "bg-success-soft text-success" : "bg-danger-soft text-danger")}
                      >
                        {lead.email_sent ? "✔ Sent" : "✗ Pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn("text-[length:var(--step--1)] font-medium px-2 py-0.5 rounded-full", lead.ai_plan_generated ? "bg-success-soft text-success" : "bg-line text-muted")}
                      >
                        {lead.ai_plan_generated ? "✔ Ready" : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn("text-[length:var(--step--1)] font-medium px-2 py-0.5 rounded-full", lead.booked_call ? "bg-success-soft text-success" : "bg-line text-muted")}
                      >
                        {lead.booked_call ? "✔ Booked" : "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {leads.length === 0 && (
            <p className="p-8 text-center font-body text-[length:var(--step-0)] text-muted">No legacy leads yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
