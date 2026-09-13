import { renderToStaticMarkup } from 'react-dom/server';

const mockOrder = jest.fn();
const mockSelect = jest.fn();
const mockFrom = jest.fn();
const mockCreateAdminClient = jest.fn();

jest.mock('@/lib/adminAuth', () => ({
  requireAdminAuth: () => Promise.resolve({ identifier: 'test-admin' }),
}));

jest.mock('@/lib/supabase/server', () => ({
  createAdminClient: (...args: unknown[]) => mockCreateAdminClient(...args),
}));

import AdminFdiPage from './page';

function supabaseWith(result: { data: unknown; error: unknown }) {
  mockOrder.mockResolvedValue(result);
  mockSelect.mockReturnValue({ order: mockOrder });
  mockFrom.mockReturnValue({ select: mockSelect });
  mockCreateAdminClient.mockReturnValue({ from: mockFrom });
}

function baseSession(overrides: Record<string, unknown> = {}) {
  return {
    id: 'session-1',
    created_at: '2026-01-01T00:00:00.000Z',
    status: 'completed',
    is_test: false,
    name: 'Founder Name',
    email: 'founder@example.com',
    company_name: 'Acme LLC',
    fdi_display: 62,
    band_label: 'Elevated',
    qualification_result: 'qualified_primary',
    email_sent: true,
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('AdminFdiPage', () => {
  it('shows humanized BHC qualification labels, not the raw enum value', async () => {
    supabaseWith({ data: [baseSession()], error: null });

    const html = renderToStaticMarkup(await AdminFdiPage());

    expect(html).toContain('BHC qualification');
    expect(html).toContain('BHC primary category');
    expect(html).not.toContain('qualified_primary');
  });

  it('falls back to the raw value for an unrecognized qualification result', async () => {
    supabaseWith({ data: [baseSession({ qualification_result: 'some_future_value' })], error: null });

    const html = renderToStaticMarkup(await AdminFdiPage());

    expect(html).toContain('some_future_value');
  });

  it('shows "Pending" for a session with no qualification result yet', async () => {
    supabaseWith({ data: [baseSession({ qualification_result: null })], error: null });

    const html = renderToStaticMarkup(await AdminFdiPage());

    expect(html).toContain('Pending');
  });

  it('throws instead of rendering when the query itself fails, so it never looks like zero records', async () => {
    supabaseWith({ data: null, error: { message: 'connection reset' } });

    await expect(AdminFdiPage()).rejects.toThrow();
  });

  it('shows the empty-state message for a genuine zero-record result', async () => {
    supabaseWith({ data: [], error: null });

    const html = renderToStaticMarkup(await AdminFdiPage());

    expect(html).toContain('No FDI sessions yet.');
  });
});
