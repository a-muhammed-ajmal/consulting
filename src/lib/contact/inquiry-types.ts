/**
 * The contact form's inquiry categories — the single source of truth.
 *
 * The stored `value` is what lands in `contact_enquiries.inquiry_type` and is
 * therefore permanent; the `label` is what the visitor actually read when they
 * chose it. The notification email must show the label, not the slug, so both
 * live here rather than being duplicated across the form, the route, and the
 * template.
 *
 * WEB §6 — these are inquiry categories, not an offer menu. A visitor may ask
 * about the Business Clarity Audit without having been offered it.
 */

export interface InquiryType {
  readonly value: string;
  readonly label: string;
}

export const INQUIRY_TYPES: readonly InquiryType[] = [
  { value: 'health-check-followup', label: 'Following up on my Business Health Check result' },
  { value: 'clarity-audit-question', label: 'A question about the Business Clarity Audit' },
  { value: 'operating-question', label: 'A specific operating question' },
  { value: 'other', label: 'Something else' },
];

export function isInquiryTypeValue(value: string): boolean {
  return INQUIRY_TYPES.some((type) => type.value === value);
}

/**
 * Historic rows may carry slugs from the retired six-service list. New public
 * submissions are restricted to the active values above, but an unknown value
 * can still appear when an historic row is rendered.
 * It falls back to the raw stored value rather than throwing or showing blank —
 * a subject line reading the slug is still better than one reading "undefined".
 */
export function inquiryTypeLabel(value: string): string {
  return INQUIRY_TYPES.find((type) => type.value === value)?.label ?? value;
}
