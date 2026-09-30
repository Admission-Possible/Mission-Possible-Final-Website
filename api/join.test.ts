import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { handleJoin } from './join';
import { createIntakeAnswers, intakeFields } from '../src/data/mentorship';

const valid = {
  ...createIntakeAnswers(),
  fullName: 'Jordan Rivera',
  email: 'jordan@example.com',
  highSchool: 'Possibility High',
  location: 'Austin, Texas, United States',
  grade: '11th grade',
  classesTaken: 'Biology, Algebra II',
  currentClasses: 'AP English, Chemistry',
  plannedClasses: 'AP Calculus',
  extracurriculars: 'Robotics and part-time work',
  interests: 'Engineering',
  targetColleges: 'Rice, UT Austin',
  applicationStage: 'Building my college list',
  guidance: ['Finding colleges', 'Essays & personal statements'],
  availability: 'Tuesdays after 4 pm',
  timezone: 'Central Time',
  firstGeneration: 'Yes',
  financialAid: 'I would like financial aid guidance',
  additionalContext: 'Spanish-speaking mentor preferred',
  consent: true,
};
const request = (body: unknown = valid, headers: Record<string, string> = {}) =>
  new Request('https://example.org/api/join', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'https://example.org', ...headers },
    body: JSON.stringify(body),
  });

beforeEach(() => {
  vi.stubEnv('RESEND_API_KEY', 'test_key');
  vi.stubEnv('JOIN_NOTIFY_EMAIL', 'team@example.org');
  vi.stubEnv('JOIN_FROM_EMAIL', 'intake@example.org');
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: 'test_receipt' }), { status: 200 })),
  );
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('mentorship delivery endpoint', () => {
  it('sends every field in a plain text message and confirms the receipt', async () => {
    const response = await handleJoin(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    const send = vi.mocked(fetch).mock.calls[0];
    expect(send[0]).toBe('https://api.resend.com/emails');
    const body = JSON.parse(send[1]?.body as string);
    expect(body.to).toEqual(['team@example.org']);
    expect(body.reply_to).toBe(valid.email);
    expect(body.from).toBe('intake@example.org');
    expect(body.subject).toContain(valid.fullName);
    for (const field of intakeFields) expect(body.text).toContain(`${field.label}: ${valid[field.key]}`);
    expect(body.text).toContain(valid.guidance.join(', '));
    expect(body.text).toContain('Consent to mentorship matching and contact: Yes');
    expect(body.html).toBeUndefined();
    expect(response.headers.get('cache-control')).toBe('no-store');
  });

  it.each(intakeFields.filter((field) => field.required).map((field) => [field.key]))(
    'rejects missing required field %s',
    async (key) => {
      const response = await handleJoin(request({ ...valid, [key]: '' }));
      expect(response.status).toBe(400);
      expect(fetch).not.toHaveBeenCalled();
    },
  );

  it.each([
    { email: 'invalid' },
    { fullName: 'Jordan\r\nInjected' },
    { grade: 'invented' },
    { applicationStage: 'invented' },
    { consent: false },
    { consent: 'true' },
    { guidance: [] },
    { guidance: ['invented'] },
    { guidance: ['Finding colleges', 'Finding colleges'] },
    { firstGeneration: 'invented' },
    { financialAid: 'invented' },
    { website: 'bot.example' },
    { plannedClasses: 'x'.repeat(2001) },
  ])('rejects invalid field values without contacting the mail provider: %j', async (patch) => {
    expect((await handleJoin(request({ ...valid, ...patch }))).status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });

  it.each(['RESEND_API_KEY', 'JOIN_NOTIFY_EMAIL', 'JOIN_FROM_EMAIL'])(
    'never fakes delivery without %s',
    async (name) => {
      vi.stubEnv(name, '');
      const response = await handleJoin(request());
      expect(response.status).toBe(503);
      expect(await response.json()).toEqual({ error: expect.stringContaining('have not been sent') });
      expect(fetch).not.toHaveBeenCalled();
    },
  );

  it('rejects cross-origin, wrong methods and content types', async () => {
    expect((await handleJoin(request(valid, { Origin: 'https://another.example' }))).status).toBe(403);
    const wrongMethod = await handleJoin(new Request('https://example.org/api/join'));
    expect(wrongMethod.status).toBe(405);
    expect(wrongMethod.headers.get('allow')).toBe('POST');
    expect((await handleJoin(request(valid, { 'Content-Type': 'text/plain' }))).status).toBe(415);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('bounds actual body bytes even without a content-length header', async () => {
    expect((await handleJoin(request({ ...valid, additionalContext: 'x'.repeat(40_000) }))).status).toBe(413);
    expect((await handleJoin(request(valid, { 'Content-Length': '40000' }))).status).toBe(413);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('rejects malformed JSON and non-object bodies', async () => {
    expect(
      (
        await handleJoin(
          new Request('https://example.org/api/join', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: '{invalid',
          }),
        )
      ).status,
    ).toBe(400);
    expect((await handleJoin(request(null))).status).toBe(400);
    expect((await handleJoin(request([]))).status).toBe(400);
  });

  it('reports upstream failure without echoing private provider output', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response('private provider details', { status: 422 }));
    const response = await handleJoin(request());
    expect(response.status).toBe(502);
    expect(await response.text()).not.toContain('private provider details');
  });

  it('requires a delivery receipt even when the provider returns 200', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response('{}', { status: 200 }));
    expect((await handleJoin(request())).status).toBe(502);
  });

  it('stops waiting for an unresponsive provider', async () => {
    vi.useFakeTimers();
    vi.mocked(fetch).mockImplementation(
      (_input, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(new Error('aborted')));
        }),
    );
    const response = handleJoin(request());
    await vi.advanceTimersByTimeAsync(10_001);
    expect((await response).status).toBe(502);
  });
});
