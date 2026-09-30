import { formatIntake, normalizeIntake, validateIntake, type IntakeAnswers } from '../src/data/mentorship.ts';

// Web Request / Response signature works on Vercel and the local Vite adapter.
// All three variables are required: RESEND_API_KEY, JOIN_NOTIFY_EMAIL,
// JOIN_FROM_EMAIL (a sender on a Resend-verified domain). Never log intake data.
const MAX_BODY_BYTES = 32_768;
const json = (body: unknown, status: number, extraHeaders: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...extraHeaders },
  });

async function readBoundedBody(request: Request): Promise<string | null> {
  if (!request.body) return '';
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let size = 0;
  let text = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        await reader.cancel();
        return null;
      }
      text += decoder.decode(value, { stream: true });
    }
    return text + decoder.decode();
  } finally {
    reader.releaseLock();
  }
}

export async function handleJoin(request: Request): Promise<Response> {
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405, { Allow: 'POST' });
  const origin = request.headers.get('origin');
  if (origin) {
    try {
      if (new URL(origin).origin !== new URL(request.url).origin)
        return json({ error: 'Please submit the form from this website.' }, 403);
    } catch {
      return json({ error: 'Please submit the form from this website.' }, 403);
    }
  }
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type') || ''))
    return json({ error: 'Expected a JSON request.' }, 415);
  const contentLength = Number(request.headers.get('content-length'));
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES)
    return json({ error: 'Your answers are too long. Please shorten them and try again.' }, 413);
  let raw: unknown;
  try {
    const text = await readBoundedBody(request);
    if (text === null) return json({ error: 'Your answers are too long. Please shorten them and try again.' }, 413);
    raw = JSON.parse(text);
  } catch {
    return json({ error: 'Expected a valid JSON object.' }, 400);
  }
  const errors = validateIntake(raw);
  if (Object.keys(errors).length)
    return json({ error: 'Please check your answers and try again.', fields: errors }, 400);
  const answers = normalizeIntake(raw as IntakeAnswers);
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.JOIN_NOTIFY_EMAIL;
  const from = process.env.JOIN_FROM_EMAIL;
  if (!apiKey || !to || !from)
    return json(
      {
        error:
          'Mentorship requests are not open for online delivery yet. Your answers have not been sent. You can download a copy below and try again later.',
      },
      503,
    );

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      signal: controller.signal,
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: answers.email,
        subject: `Mentorship request — ${answers.fullName}`,
        text: formatIntake(answers),
      }),
    });
    if (!response.ok)
      return json(
        {
          error:
            'We could not send your request just now. Your answers are still here. Please try again or download a copy.',
        },
        502,
      );
    const receipt: unknown = await response.json();
    if (!receipt || typeof receipt !== 'object' || !('id' in receipt) || typeof receipt.id !== 'string' || !receipt.id)
      return json(
        {
          error:
            'We could not confirm delivery. Your answers are still here. Please download a copy and try again later.',
        },
        502,
      );
    return json({ ok: true }, 200);
  } catch {
    return json(
      {
        error:
          'We could not confirm delivery just now. Your answers are still here. You can download a copy and try again later.',
      },
      502,
    );
  } finally {
    clearTimeout(timeout);
  }
}

export default { fetch: handleJoin };
