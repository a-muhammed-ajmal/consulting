import { createAdminClient } from '@/lib/supabase/server';
import { CURRENT_FDI_VERSION, resolveVersion, type ResolvedVersion } from '@/lib/fdi/config';
import { buildReport } from '@/lib/fdi/report';
import { evaluateQualification } from '@/lib/fdi/qualification';
import { scoreFdi } from '@/lib/fdi/score';
import type { FdiReport } from '@/lib/fdi/types';
import { businessDetailColumns, businessDetailsFromColumns, mergeBusinessDetails, type BusinessDetailRow } from './business-details';
import { parseFdiBusinessDetailsForVersion, type FdiBusinessDetails, type FdiContact } from './validation';

type PersistedSession = BusinessDetailRow & {
  id: string;
  status: 'in_progress' | 'completed';
  is_test: boolean;
  diagnostic_version: string;
  question_set_version: string;
  scoring_model_version: string;
  band_config_version: string;
};

type PersistedAnswer = {
  question_id: string;
  option_id: string;
  change_count: number;
};

export class FdiInputError extends Error {}
export class FdiSessionConflictError extends Error {}

/**
 * Resolves the exact instrument recorded on a session. This is intentionally
 * exported for regression tests: completion must never fall back to the
 * current instrument when a founder began an earlier version.
 */
export function resolveFdiSessionVersion(session: Pick<
  PersistedSession,
  'diagnostic_version' | 'question_set_version' | 'scoring_model_version' | 'band_config_version'
>): ResolvedVersion {
  const resolved = resolveVersion(session.diagnostic_version);
  if (!resolved) throw new FdiInputError(`Unknown FDI diagnostic version: ${session.diagnostic_version}`);

  const { config } = resolved;
  if (
    session.question_set_version !== config.questionSetVersion
    || session.scoring_model_version !== config.scoringModelVersion
    || session.band_config_version !== config.bandConfigVersion
  ) {
    throw new FdiInputError(`FDI session ${session.diagnostic_version} has inconsistent version stamps.`);
  }
  return resolved;
}

function resolveAnswer(questionSet: ResolvedVersion['questionSet'], questionId: string, optionId: string) {
  const question = questionSet.questions.find((candidate) => candidate.id === questionId);
  if (!question) throw new FdiInputError(`Unknown FDI question: ${questionId}`);
  const option = question.options.find((candidate) => candidate.id === optionId);
  if (!option) throw new FdiInputError(`Invalid option for ${questionId}`);
  return { question, option };
}

export async function startFdiSession(isTest: boolean): Promise<{ id: string }> {
  const supabase = createAdminClient();
  const { config } = CURRENT_FDI_VERSION;
  const { data, error } = await supabase
    .from('fdi_sessions')
    .insert({
      status: 'in_progress',
      instrument: config.instrument,
      diagnostic_version: config.diagnosticVersion,
      question_set_version: config.questionSetVersion,
      scoring_model_version: config.scoringModelVersion,
      band_config_version: config.bandConfigVersion,
      is_test: isTest,
    })
    .select('id')
    .single();

  if (error || !data) throw error ?? new Error('FDI session could not be created.');
  return data as { id: string };
}

export async function persistFdiProgress(
  sessionId: string,
  update: { answers?: Record<string, string>; completionMs?: number },
): Promise<void> {
  const supabase = createAdminClient();
  const { data: session, error: sessionError } = await supabase
    .from('fdi_sessions')
    .select('id,status,diagnostic_version,question_set_version,scoring_model_version,band_config_version')
    .eq('id', sessionId)
    .single();
  if (sessionError || !session) throw new FdiInputError('FDI session was not found.');
  const persisted = session as Pick<PersistedSession, 'id' | 'status' | 'diagnostic_version' | 'question_set_version' | 'scoring_model_version' | 'band_config_version'>;
  if (persisted.status !== 'in_progress') throw new FdiSessionConflictError('This FDI session is already complete.');
  const version = resolveFdiSessionVersion(persisted);

  if (update.answers) {
    const resolvedAnswers = Object.entries(update.answers).map(([questionId, optionId]) => ({
      questionId,
      optionId,
      ...resolveAnswer(version.questionSet, questionId, optionId),
    }));
    const questionIds = resolvedAnswers.map((answer) => answer.questionId);
    const { data: existingRows, error: existingError } = await supabase
      .from('fdi_answers')
      .select('question_id,option_id,change_count')
      .eq('session_id', sessionId)
      .in('question_id', questionIds);
    if (existingError) throw existingError;
    const existing = new Map((existingRows ?? []).map((row) => [row.question_id, row as PersistedAnswer]));
    const now = new Date().toISOString();
    const rows = resolvedAnswers
      .filter(({ questionId, optionId }) => existing.get(questionId)?.option_id !== optionId)
      .map(({ question, option, questionId }) => ({
        session_id: sessionId,
        question_id: questionId,
        component_key: question.componentKey,
        option_id: option.id,
        score: option.score,
        answered_at: now,
        change_count: (existing.get(questionId)?.change_count ?? -1) + 1,
      }));
    if (rows.length > 0) {
      const { error } = await supabase
        .from('fdi_answers')
        .upsert(rows, { onConflict: 'session_id,question_id' });
      if (error) throw error;
    }
  }

  const sessionUpdate: Record<string, unknown> = {};
  if (update.completionMs !== undefined) sessionUpdate.completion_ms = update.completionMs;
  if (Object.keys(sessionUpdate).length > 0) {
    const { error } = await supabase
      .from('fdi_sessions')
      .update(sessionUpdate)
      .eq('id', sessionId)
      .eq('status', 'in_progress');
    if (error) throw error;
  }
}

function analysisFor(answers: readonly { score: number }[], completionMs: number | null): Record<string, unknown> {
  const firstScore = answers[0]?.score;
  const straightLine = firstScore !== undefined && answers.every((answer) => answer.score === firstScore);
  return {
    straight_line_flag: straightLine,
    analysis_flags: {
      straightLine,
      completionMs,
      note: 'Quality signals are for consultant review only and never affect the FDI.',
    },
  };
}

export async function completeFdiSession(
  sessionId: string,
  contact: FdiContact,
  completionMs?: number,
  businessDetails?: FdiBusinessDetails,
): Promise<FdiReport> {
  const supabase = createAdminClient();
  const { data: sessionData, error: sessionError } = await supabase
    .from('fdi_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();
  if (sessionError || !sessionData) throw new FdiInputError('FDI session was not found.');
  const session = sessionData as PersistedSession & { completion_ms: number | null };
  if (session.status !== 'in_progress') throw new FdiSessionConflictError('This FDI session is already complete.');
  const version = resolveFdiSessionVersion(session);

  const { data: answerRows, error: answerError } = await supabase
    .from('fdi_answers')
    .select('question_id,option_id,score,change_count')
    .eq('session_id', sessionId);
  if (answerError) throw answerError;
  const answers = Object.fromEntries((answerRows ?? []).map((row) => [row.question_id, row.option_id]));
  const scored = scoreFdi(
    { diagnosticVersion: version.config.diagnosticVersion, answers },
    version.config,
    version.questionSet,
  );
  if (!scored.ok) throw new FdiInputError('All twelve FDI answers are required before completion.');

  // Business details are optional: whatever is missing stays missing, and the
  // qualification outcome absorbs that rather than blocking completion.
  const submittedDetails = businessDetails === undefined
    ? undefined
    : parseFdiBusinessDetailsForVersion(businessDetails, version.config.diagnosticVersion);
  const details = mergeBusinessDetails(businessDetailsFromColumns(session), submittedDetails);
  const qualification = evaluateQualification(details, version.qualificationConfigVersion);
  const completedAt = new Date().toISOString();
  const report = buildReport(scored.result, version.config, {
    sessionId,
    completedAt,
    qualification,
    ai: null,
  });
  const components = new Map(report.components.map((component) => [component.key, component]));
  const totalChanges = (answerRows ?? []).reduce((sum, answer) => sum + Number(answer.change_count ?? 0), 0);
  const persistedCompletionMs = completionMs ?? session.completion_ms;
  const { error: updateError, count } = await supabase
    .from('fdi_sessions')
    .update({
      status: 'completed',
      completed_at: completedAt,
      name: contact.name,
      email: contact.email.toLowerCase(),
      phone: contact.phone,
      company_name: contact.companyName,
      ...businessDetailColumns(details),
      qualification_config_version: qualification.version,
      qualification_result: qualification.result,
      qualification_reasons: qualification.reasons,
      raw_ds: components.get('DS')?.raw,
      raw_ec: components.get('EC')?.raw,
      raw_ov: components.get('OV')?.raw,
      component_ds: components.get('DS')?.unrounded,
      component_ec: components.get('EC')?.unrounded,
      component_ov: components.get('OV')?.unrounded,
      display_ds: components.get('DS')?.display,
      display_ec: components.get('EC')?.display,
      display_ov: components.get('OV')?.display,
      fdi_unrounded: report.index.unrounded,
      fdi_display: report.index.display,
      band_key: report.index.band.key,
      band_label: report.index.band.label,
      component_alerts: report.alerts,
      concentration: report.concentration,
      observations: report.observations,
      completion_ms: persistedCompletionMs,
      answer_change_count: totalChanges,
      ...analysisFor(scored.result.answers, persistedCompletionMs),
    }, { count: 'exact' })
    .eq('id', sessionId)
    .eq('status', 'in_progress');
  if (updateError) throw updateError;
  if (count !== null && count !== 1) throw new FdiSessionConflictError('This FDI session was completed elsewhere.');

  return report;
}

export async function setFdiTestStatus(
  sessionId: string,
  isTest: boolean,
  adminIdentifier: string,
  reason?: string,
): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.rpc('set_fdi_test_status', {
    p_session_id: sessionId,
    p_is_test: isTest,
    p_admin_identifier: adminIdentifier,
    p_reason: reason ?? null,
  });
  if (error?.code === 'P0002') throw new FdiInputError('FDI session was not found.');
  if (error) throw error;
}
