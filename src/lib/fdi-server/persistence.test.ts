const mockRpc = jest.fn();

jest.mock('@/lib/supabase/server', () => ({
  createAdminClient: () => ({ rpc: (...args: unknown[]) => mockRpc(...args) }),
}));

import { FdiInputError, resolveFdiSessionVersion, setFdiTestStatus } from './persistence';

function sessionVersion(diagnosticVersion: string, questionSetVersion: string) {
  return {
    diagnostic_version: diagnosticVersion,
    question_set_version: questionSetVersion,
    scoring_model_version: 'FDI-SM-1.0',
    band_config_version: 'FDI-BC-1.0',
  };
}

describe('persisted FDI version resolution', () => {
  it('keeps FDI-1.0 sessions on their original instrument', () => {
    const resolved = resolveFdiSessionVersion(sessionVersion('FDI-1.0', 'FDI-QS-1.0'));
    expect(resolved.config.diagnosticVersion).toBe('FDI-1.0');
    expect(resolved.questionSet.questionSetVersion).toBe('FDI-QS-1.0');
    expect(resolved.qualificationConfigVersion).toBe('FDI-QF-2.0');
  });

  it('uses FDI-1.1 and its qualification taxonomy for new sessions', () => {
    const resolved = resolveFdiSessionVersion(sessionVersion('FDI-1.1', 'FDI-QS-1.1'));
    expect(resolved.config.diagnosticVersion).toBe('FDI-1.1');
    expect(resolved.questionSet.questionSetVersion).toBe('FDI-QS-1.1');
    expect(resolved.qualificationConfigVersion).toBe('FDI-QF-2.1');
  });

  it('rejects inconsistent version stamps instead of silently using the current version', () => {
    expect(() => resolveFdiSessionVersion(sessionVersion('FDI-1.0', 'FDI-QS-1.1')))
      .toThrow('inconsistent version stamps');
  });
});

describe('atomic FDI test-status persistence', () => {
  beforeEach(() => jest.clearAllMocks());

  it('delegates the status change and audit history to one database RPC', async () => {
    mockRpc.mockResolvedValue({ data: true, error: null });

    await setFdiTestStatus('00000000-0000-4000-8000-000000000001', true, 'admin-123', 'QA record');

    expect(mockRpc).toHaveBeenCalledWith('set_fdi_test_status', {
      p_session_id: '00000000-0000-4000-8000-000000000001',
      p_is_test: true,
      p_admin_identifier: 'admin-123',
      p_reason: 'QA record',
    });
  });

  it('maps the database not-found signal to the public input error', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { code: 'P0002' } });

    await expect(setFdiTestStatus('missing', false, 'admin-123'))
      .rejects.toBeInstanceOf(FdiInputError);
  });

  it('propagates unexpected database failures', async () => {
    const failure = { code: '42501', message: 'permission denied' };
    mockRpc.mockResolvedValue({ data: null, error: failure });

    await expect(setFdiTestStatus('session-1', false, 'admin-123'))
      .rejects.toBe(failure);
  });
});
