import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MentorshipForm } from './MentorshipForm';
import { createIntakeAnswers } from '../data/mentorship';

const filled = {
  ...createIntakeAnswers(),
  fullName: 'Jordan Rivera',
  email: 'jordan@example.com',
  highSchool: 'Possibility High',
  location: 'Austin, Texas, United States',
  grade: '11th grade',
  classesTaken: 'English 10, Biology, Algebra II',
  currentClasses: 'AP English, Chemistry',
  plannedClasses: 'AP Calculus, Physics',
  extracurriculars: 'Robotics, weekend job, caring for siblings',
  interests: 'Engineering and design',
  targetColleges: 'Rice and UT Austin',
  applicationStage: 'Building my college list',
  guidance: ['Finding colleges'],
  availability: 'Tuesdays after 4 pm',
  timezone: 'Central Time',
  firstGeneration: 'Yes',
  financialAid: 'I would like financial aid guidance',
  additionalContext: 'I would prefer a Spanish-speaking mentor.',
  consent: true,
};

function change(name: string, value: string) {
  fireEvent.change(screen.getByLabelText(name, { exact: false }), { target: { value } });
}

async function completeToReview() {
  change('Full name', filled.fullName);
  change('Email address', filled.email);
  change('High school', filled.highSchool);
  change('City, state', filled.location);
  change('Current grade', filled.grade);
  fireEvent.click(screen.getByRole('button', { name: /Continue/ }));
  change('Classes you have completed', filled.classesTaken);
  change('Classes you are taking now', filled.currentClasses);
  change('Classes you plan to take', filled.plannedClasses);
  change('Activities, work', filled.extracurriculars);
  fireEvent.click(screen.getByRole('button', { name: /Continue/ }));
  change('What are you interested in?', filled.interests);
  change('Colleges you have in mind', filled.targetColleges);
  change('Where are you in the application process?', filled.applicationStage);
  fireEvent.click(screen.getByLabelText('Finding colleges'));
  change('When can you meet', filled.availability);
  change('Your time zone', filled.timezone);
  change('Would you be the first', filled.firstGeneration);
  change('Would financial aid', filled.financialAid);
  change('Anything else', filled.additionalContext);
  fireEvent.click(screen.getByRole('button', { name: /Continue/ }));
  expect(screen.getByRole('heading', { name: 'Review & send.' })).toBeInTheDocument();
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('MentorshipForm', () => {
  it('validates before progressing and focuses the error summary', async () => {
    render(<MentorshipForm onClose={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: /Continue/ }));
    expect(screen.getByRole('alert')).toHaveFocus();
    expect(screen.getByLabelText('Full name')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('heading', { name: 'About you.' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Please enter full name.' }));
    expect(screen.getByLabelText('Full name')).toHaveFocus();
  });

  it('retains answers when editing earlier steps and requires consent', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    render(<MentorshipForm onClose={vi.fn()} />);
    await completeToReview();
    fireEvent.click(screen.getByRole('button', { name: 'Edit your academics' }));
    expect(screen.getByLabelText('Classes you have completed')).toHaveValue(filled.classesTaken);
    fireEvent.click(screen.getByRole('button', { name: /Continue/ }));
    expect(screen.getByLabelText('What are you interested in?')).toHaveValue(filled.interests);
    fireEvent.click(screen.getByRole('button', { name: /Continue/ }));
    fireEvent.click(screen.getByRole('button', { name: /Send mentorship request/ }));
    expect(screen.getByRole('alert')).toHaveTextContent('Please agree');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('sends all matching details, locks duplicate submissions, and shows success only after delivery', async () => {
    let resolveFetch!: (value: Response) => void;
    const fetchMock = vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          resolveFetch = resolve;
        }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const onClose = vi.fn();
    render(<MentorshipForm onClose={onClose} />);
    await completeToReview();
    fireEvent.click(screen.getByLabelText(/I agree that Admission Possible/));
    const submit = screen.getByRole('button', { name: /Send mentorship request/ });
    fireEvent.click(submit);
    expect(screen.getByRole('button', { name: 'Sending your request…' })).toBeDisabled();
    fireEvent.submit(submit.closest('form')!);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const call = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(call[0]).toBe('/api/join');
    expect(JSON.parse(call[1].body as string)).toEqual(filled);
    expect(screen.queryByRole('heading', { name: 'You’re on your way.' })).not.toBeInTheDocument();
    await act(async () => resolveFetch(new Response(JSON.stringify({ ok: true }), { status: 200 })));
    expect(screen.getByRole('heading', { name: 'You’re on your way.' })).toHaveFocus();
    expect(screen.getByText(filled.email)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Back to the website/ }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('keeps every answer after an unconfigured endpoint and offers a download', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response(
            JSON.stringify({ error: 'Online delivery is not configured. Your answers have not been sent.' }),
            { status: 503 },
          ),
        ),
    );
    render(<MentorshipForm onClose={vi.fn()} />);
    await completeToReview();
    fireEvent.click(screen.getByLabelText(/I agree that Admission Possible/));
    fireEvent.click(screen.getByRole('button', { name: /Send mentorship request/ }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('have not been sent'));
    expect(screen.getByText(filled.additionalContext)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Download your answers/ })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'You’re on your way.' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Edit about you' }));
    expect(screen.getByLabelText('Full name')).toHaveValue(filled.fullName);
    expect(screen.getByLabelText('Email address')).toHaveValue(filled.email);
  });

  it('does not report success for a 200 response without a delivery acknowledgement', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<html>Preview fallback</html>', { status: 200 })));
    render(<MentorshipForm onClose={vi.fn()} />);
    await completeToReview();
    fireEvent.click(screen.getByLabelText(/I agree that Admission Possible/));
    fireEvent.click(screen.getByRole('button', { name: /Send mentorship request/ }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('could not confirm delivery'));
    expect(screen.getByText(filled.targetColleges)).toBeInTheDocument();
  });
});
