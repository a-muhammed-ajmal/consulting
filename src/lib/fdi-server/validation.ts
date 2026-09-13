import { z } from 'zod';

export const fdiAnswerMapSchema = z.record(z.string().min(1), z.string().min(1)).refine(
  (answers) => Object.keys(answers).length > 0,
  'At least one answer is required.',
);

/**
 * Sector options offered on the final screen. The Business Health Check
 * primary qualification categories (FDI_PRIMARY_SECTORS in
 * src/lib/fdi/qualification.ts) are separate from ANCHOR's internal
 * acquisition Primary sectors; everything else here simply classifies as
 * secondary for qualification purposes. Adding an option never affects an
 * FDI score.
 */
/** Sector taxonomy used by historic FDI-1.0 sessions. */
export const FDI_1_0_SECTOR_VALUES = [
  'real_estate_business_services',
  'trading_distribution',
  'construction_contracting',
  'professional_services',
  'retail_ecommerce',
  'hospitality_fnb',
  'healthcare',
  'manufacturing',
  'technology',
  'education',
  'other',
] as const;

/** Approved Business Health Check sector taxonomy for FDI-1.1. */
export const FDI_SECTOR_VALUES = [
  'real_estate_business_services',
  'trading_distribution',
  'construction_contracting',
  'professional_services',
  'retail_ecommerce',
  'hospitality_fnb',
  'manufacturing',
  'other',
] as const;

/** Accepts an already-started FDI-1.0 session without exposing old choices to FDI-1.1. */
export const ALL_FDI_SECTOR_VALUES = FDI_1_0_SECTOR_VALUES;

/**
 * Every business detail is optional, so an untouched select must not fail
 * validation. A native select submits '' when untouched; treat '' and null as
 * "not answered" rather than as an invalid enum member.
 */
function optionalEnum<const T extends readonly [string, ...string[]]>(values: T) {
  return z.enum(values).or(z.literal('')).nullish().transform((value) => value === '' || value === null ? undefined : value);
}

function businessDetailsSchemaFor(
  sectorValues: readonly [string, ...string[]],
  requireOtherSectorText: boolean,
) {
  return z.object({
    annualRevenue: optionalEnum(['under_1m', 'aed_1m_to_10m', 'over_10m']),
    employeeCount: optionalEnum(['under_5', 'employees_5_to_50', 'over_50']),
    operatingYears: optionalEnum(['under_3', 'years_3_or_more']),
    sector: optionalEnum(sectorValues),
    sectorOther: z.string().trim().max(100).nullish().transform((value) => value === '' || value === null ? undefined : value),
  }).strict().superRefine((value, context) => {
    if (requireOtherSectorText && value.sector === 'other' && !value.sectorOther) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['sectorOther'],
        message: 'Please describe your sector',
      });
    }
  });
}

/** Active FDI-1.1 validation used by the browser form. */
export const fdiBusinessDetailsSchema = businessDetailsSchemaFor(FDI_SECTOR_VALUES, true);
/** Preserves validation of in-progress FDI-1.0 sessions. */
export const fdiLegacyBusinessDetailsSchema = businessDetailsSchemaFor(FDI_1_0_SECTOR_VALUES, false);
/** Transport accepts either registered taxonomy; persistence selects the session-specific schema. */
export const fdiBusinessDetailsTransportSchema = businessDetailsSchemaFor(ALL_FDI_SECTOR_VALUES, false);

export function parseFdiBusinessDetailsForVersion(value: unknown, diagnosticVersion: string) {
  if (diagnosticVersion === 'FDI-1.0') return fdiLegacyBusinessDetailsSchema.parse(value);
  if (diagnosticVersion === 'FDI-1.1') return fdiBusinessDetailsSchema.parse(value);
  throw new Error(`Unknown FDI diagnostic version: ${diagnosticVersion}`);
}

export const fdiContactSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name').max(100),
  email: z.string().trim().email('Please enter a valid email address').max(320),
  companyName: z.string().trim().min(2, 'Please enter your company name').max(200),
  phone: z.string().trim().min(7, 'Please enter your mobile number').max(50)
    .regex(/^[+\d][\d\s()-]{6,}$/, 'Please enter a valid mobile number'),
}).strict();

export const fdiStartSchema = z.object({
  testMode: z.boolean().optional().default(false),
}).strict();

export const fdiPatchSchema = z.object({
  sessionToken: z.string().min(20).max(200),
  answers: fdiAnswerMapSchema.optional(),
  completionMs: z.number().int().nonnegative().max(86_400_000).optional(),
}).strict().refine(
  (value) => value.answers !== undefined || value.completionMs !== undefined,
  'At least one progressive update is required.',
);

export const fdiSubmitSchema = z.object({
  sessionId: z.string().uuid(),
  sessionToken: z.string().min(20).max(200),
  contact: fdiContactSchema,
  businessDetails: fdiBusinessDetailsTransportSchema.optional(),
  completionMs: z.number().int().nonnegative().max(86_400_000).optional(),
}).strict();

export const fdiTestStatusSchema = z.object({
  isTest: z.boolean(),
  reason: z.string().trim().min(3).max(500).optional(),
}).strict();

/** What the browser may send (untouched selects included) versus what the server acts on. */
export type FdiBusinessDetailsInput = z.input<typeof fdiBusinessDetailsTransportSchema>;
export type FdiBusinessDetails = z.output<typeof fdiBusinessDetailsTransportSchema>;
export type FdiContact = z.infer<typeof fdiContactSchema>;
