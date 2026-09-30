import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  aidOptions,
  createIntakeAnswers,
  firstGenOptions,
  formatIntake,
  gradeOptions,
  guidanceOptions,
  intakeFields,
  intakeSteps,
  normalizeIntake,
  stageOptions,
  validateIntake,
  type IntakeAnswers,
  type IntakeErrors,
  type IntakeTextKey,
} from '../data/mentorship';
import '../styles/mentorship-form.css';

type FieldProps = {
  name: IntakeTextKey;
  answers: IntakeAnswers;
  errors: IntakeErrors;
  onChange: (key: IntakeTextKey, value: string) => void;
  hint?: string;
  placeholder?: string;
  multiline?: boolean;
  options?: readonly string[];
  autoComplete?: string;
};

function IntakeField({
  name,
  answers,
  errors,
  onChange,
  hint,
  placeholder,
  multiline,
  options,
  autoComplete,
}: FieldProps) {
  const field = intakeFields.find((item) => item.key === name)!;
  const id = `intake-${name}`;
  const describedBy = [hint && `${id}-hint`, errors[name] && `${id}-error`].filter(Boolean).join(' ') || undefined;
  const shared = {
    id,
    name,
    value: answers[name],
    required: field.required,
    'aria-invalid': Boolean(errors[name]),
    'aria-describedby': describedBy,
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      onChange(name, event.target.value),
  };
  return (
    <div className={`intake-field${multiline ? ' intake-field-wide' : ''}`}>
      <label htmlFor={id}>
        {field.label}
        {!field.required && <span className="intake-optional">Optional</span>}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="intake-hint">
          {hint}
        </p>
      )}
      {options ? (
        <select {...shared}>
          <option value="">Select an option</option>
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      ) : multiline ? (
        <textarea {...shared} rows={3} maxLength={field.max} placeholder={placeholder} />
      ) : (
        <input
          {...shared}
          type={name === 'email' ? 'email' : 'text'}
          maxLength={field.max}
          placeholder={placeholder}
          autoComplete={autoComplete}
        />
      )}
      {errors[name] && (
        <p id={`${id}-error`} className="intake-field-error">
          {errors[name]}
        </p>
      )}
    </div>
  );
}

function firstErrorStep(errors: IntakeErrors): number {
  const field = intakeFields.find(({ key }) => errors[key]);
  return field?.step ?? (errors.guidance ? 2 : 3);
}

export function MentorshipForm({ onClose }: { onClose: () => void }) {
  const [answers, setAnswers] = useState(createIntakeAnswers);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<IntakeErrors>({});
  const [serverError, setServerError] = useState('');
  const [pending, setPending] = useState(false);
  const [complete, setComplete] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const sendingRef = useRef(false);
  const focusErrorsRef = useRef(false);

  useEffect(() => {
    headingRef.current?.focus();
  }, [step, complete]);
  useEffect(() => {
    if (focusErrorsRef.current) {
      errorRef.current?.focus();
      focusErrorsRef.current = false;
    }
  }, [errors]);
  useEffect(() => {
    if (serverError) statusRef.current?.focus();
  }, [serverError]);

  function update(key: IntakeTextKey, value: string) {
    setAnswers((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  }
  function changeStep(next: number) {
    setErrors({});
    setServerError('');
    setStep(next);
  }
  function toggleGuidance(option: string) {
    setAnswers((current) => ({
      ...current,
      guidance: current.guidance.includes(option)
        ? current.guidance.filter((item) => item !== option)
        : [...current.guidance, option],
    }));
    setErrors((current) => ({ ...current, guidance: undefined }));
  }
  function focusField(key: string) {
    const element = document.getElementById(`intake-${key}`);
    element?.focus();
  }
  function downloadAnswers() {
    const url = URL.createObjectURL(new Blob([formatIntake(answers)], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'admission-possible-mentorship.txt';
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sendingRef.current) return;
    const nextErrors = validateIntake(answers, step === 3 ? undefined : step);
    if (Object.keys(nextErrors).length) {
      focusErrorsRef.current = true;
      setErrors(nextErrors);
      if (step === 3) setStep(firstErrorStep(nextErrors));
      return;
    }
    if (step < 3) {
      changeStep(step + 1);
      return;
    }
    sendingRef.current = true;
    setPending(true);
    setServerError('');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);
    try {
      const response = await fetch('/api/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify(normalizeIntake(answers)),
      });
      const result: unknown = await response.json();
      const data = result && typeof result === 'object' ? (result as Record<string, unknown>) : {};
      if (response.ok && data.ok === true) {
        setComplete(true);
      } else {
        setServerError(
          typeof data.error === 'string'
            ? data.error
            : 'We could not confirm delivery. Your answers are still here. Please try again or download a copy.',
        );
      }
    } catch {
      setServerError(
        'We could not confirm delivery. Your answers are still here. Please check your connection, try again, or download a copy.',
      );
    } finally {
      clearTimeout(timeout);
      sendingRef.current = false;
      setPending(false);
    }
  }

  const shared = { answers, errors, onChange: update };
  const visibleErrors = Object.entries(errors).filter((entry): entry is [string, string] => Boolean(entry[1]));

  if (complete)
    return (
      <div className="intake intake-complete">
        <span className="intake-eyebrow">A new possibility.</span>
        <h2 ref={headingRef} tabIndex={-1}>
          You’re on your way.
        </h2>
        <p>
          Your mentorship request has been sent. Our team will review your interests, goals, and availability, then
          contact you at <strong>{answers.email}</strong> about next steps.
        </p>
        <p className="intake-hint">
          A request does not guarantee a mentor match. We’ll be in touch about availability.
        </p>
        <div className="intake-actions">
          <button type="button" className="intake-secondary" onClick={downloadAnswers}>
            Download your answers <span aria-hidden="true">↓</span>
          </button>
          <button type="button" className="intake-primary" onClick={onClose}>
            Back to the website <span aria-hidden="true">↗</span>
          </button>
        </div>
      </div>
    );

  return (
    <div className="intake">
      <div className="intake-heading">
        <span className="intake-eyebrow">Find your mentor · {step + 1} / 4</span>
        <h2 ref={headingRef} tabIndex={-1}>
          {intakeSteps[step]}
          <span className="intake-heading-dot">.</span>
        </h2>
        <p>
          {
            [
              'Tell us a little about yourself. We’ll use your answers to help find the right mentor for you.',
              'Your path is your own. Share the classes and experiences that have shaped it.',
              'Big plans, small questions, or still figuring it out. Let’s start where you are.',
              'Take one last look. You can edit any part before sending your request.',
            ][step]
          }
        </p>
      </div>
      <ol className="intake-progress" aria-label="Mentorship application progress">
        {intakeSteps.map((name, index) => (
          <li
            key={name}
            aria-current={step === index ? 'step' : undefined}
            className={index < step ? 'is-complete' : ''}
          >
            <span className="intake-progress-number">0{index + 1}</span>
            <span>{name}</span>
          </li>
        ))}
      </ol>
      <form ref={formRef} noValidate onSubmit={submit} aria-busy={pending}>
        <div className="intake-trap" aria-hidden="true">
          <label htmlFor="intake-website">Leave this field empty</label>
          <input
            id="intake-website"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={answers.website}
            onChange={(event) => setAnswers((current) => ({ ...current, website: event.target.value }))}
          />
        </div>
        {visibleErrors.length > 0 && (
          <div ref={errorRef} className="intake-error-summary" tabIndex={-1} role="alert">
            <p>Please check the following:</p>
            <ul>
              {visibleErrors.map(([key, error]) => (
                <li key={key}>
                  <button type="button" onClick={() => focusField(key)}>
                    {error}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {step === 0 && (
          <div className="intake-fields">
            <IntakeField {...shared} name="fullName" autoComplete="name" placeholder="Your name" />
            <IntakeField {...shared} name="email" autoComplete="email" placeholder="you@example.com" />
            <IntakeField
              {...shared}
              name="highSchool"
              autoComplete="organization"
              placeholder="School name, or homeschool"
            />
            <IntakeField {...shared} name="grade" options={gradeOptions} />
            <IntakeField
              {...shared}
              name="location"
              autoComplete="address-level2"
              placeholder="e.g. Austin, Texas, United States"
            />
            <p className="intake-fields-note">
              All fields are required unless marked optional.
              <br />
              No perfect answers needed.
            </p>
          </div>
        )}
        {step === 1 && (
          <div className="intake-fields">
            <IntakeField
              {...shared}
              name="classesTaken"
              multiline
              hint="A quick list is enough. Include honors, AP, IB, dual enrollment, or other courses if relevant."
              placeholder="e.g. Algebra II, English 10 Honors, Biology, World History…"
            />
            <IntakeField
              {...shared}
              name="currentClasses"
              multiline
              placeholder="What’s on your schedule this year? Write “none” if you’re not currently taking classes."
            />
            <IntakeField
              {...shared}
              name="plannedClasses"
              multiline
              placeholder="What’s next? “Not sure yet” is a perfectly good answer."
            />
            <IntakeField
              {...shared}
              name="extracurriculars"
              multiline
              hint="Clubs, sports, volunteering, jobs, family care, and personal projects all count. You can also write “none yet.”"
              placeholder="Tell us what you do outside class and what matters to you."
            />
          </div>
        )}
        {step === 2 && (
          <div className="intake-fields">
            <IntakeField
              {...shared}
              name="interests"
              multiline
              hint="Subjects, possible majors, careers, or things you love learning about. Undecided is welcome."
              placeholder="What are you curious about?"
            />
            <IntakeField
              {...shared}
              name="targetColleges"
              multiline
              hint="Name any colleges or describe what you’re looking for. “I’m still exploring” works too."
              placeholder="Your list can be a work in progress."
            />
            <IntakeField {...shared} name="applicationStage" options={stageOptions} />
            <fieldset
              className="intake-guidance intake-field-wide"
              aria-describedby={errors.guidance ? 'intake-guidance-error' : 'intake-guidance-hint'}
            >
              <legend>Where would you like support?</legend>
              <p id="intake-guidance-hint" className="intake-hint">
                Choose at least one. You can select more than one.
              </p>
              <div className="intake-choices">
                {guidanceOptions.map((option, index) => (
                  <label key={option}>
                    <input
                      id={index === 0 ? 'intake-guidance' : undefined}
                      type="checkbox"
                      name="guidance"
                      value={option}
                      checked={answers.guidance.includes(option)}
                      onChange={() => toggleGuidance(option)}
                      aria-invalid={Boolean(errors.guidance)}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
              {errors.guidance && (
                <p id="intake-guidance-error" className="intake-field-error">
                  {errors.guidance}
                </p>
              )}
            </fieldset>
            <IntakeField
              {...shared}
              name="availability"
              hint="Days and times that usually work for you."
              placeholder="e.g. Tuesdays after 4 pm or Saturday mornings"
            />
            <IntakeField
              {...shared}
              name="timezone"
              hint="A time zone name or nearby city is enough."
              placeholder="e.g. Eastern Time / New York"
            />
            <IntakeField
              {...shared}
              name="firstGeneration"
              options={firstGenOptions}
              hint="For example, neither parent or guardian completed a four-year college degree."
            />
            <IntakeField {...shared} name="financialAid" options={aidOptions} />
            <IntakeField
              {...shared}
              name="additionalContext"
              multiline
              hint="You can mention language or access needs, mentor preferences, deadlines, or questions."
              placeholder="Anything you’d like your future mentor to know."
            />
          </div>
        )}
        {step === 3 && (
          <div className="intake-review">
            {intakeSteps.slice(0, 3).map((name, index) => (
              <div className="intake-review-group" key={name}>
                <div className="intake-review-heading">
                  <h3>{name}</h3>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => changeStep(index)}
                    aria-label={`Edit ${name.toLowerCase()}`}
                  >
                    Edit <span aria-hidden="true">↗</span>
                  </button>
                </div>
                <dl>
                  {intakeFields
                    .filter((field) => field.step === index)
                    .map((field) => (
                      <div key={field.key}>
                        <dt>{field.label}</dt>
                        <dd>{answers[field.key].trim() || 'Not provided'}</dd>
                      </div>
                    ))}
                  {index === 2 && (
                    <div>
                      <dt>Preferred guidance</dt>
                      <dd>{answers.guidance.join(', ')}</dd>
                    </div>
                  )}
                </dl>
              </div>
            ))}
            <div className="intake-consent">
              <label>
                <input
                  id="intake-consent"
                  type="checkbox"
                  required
                  disabled={pending}
                  checked={answers.consent}
                  aria-invalid={Boolean(errors.consent)}
                  aria-describedby={errors.consent ? 'intake-consent-error' : undefined}
                  onChange={(event) => {
                    setAnswers((current) => ({ ...current, consent: event.target.checked }));
                    setErrors((current) => ({ ...current, consent: undefined }));
                  }}
                />
                <span>
                  I agree that Admission Possible may use these answers to match me with a mentor and contact me about
                  mentorship.
                </span>
              </label>
              {errors.consent && (
                <p id="intake-consent-error" className="intake-field-error">
                  {errors.consent}
                </p>
              )}
            </div>
            <p className="intake-hint">
              Your request helps us explore a match based on mentor availability. You can keep a copy of your answers
              below.
            </p>
          </div>
        )}
        {serverError && (
          <div ref={statusRef} className="intake-server-error" role="alert" tabIndex={-1}>
            <h3>Your answers are saved in this form.</h3>
            <p>{serverError}</p>
            <button type="button" className="intake-text-button" onClick={downloadAnswers}>
              Download your answers <span aria-hidden="true">↓</span>
            </button>
          </div>
        )}
        <div className="intake-actions">
          {step > 0 ? (
            <button type="button" className="intake-secondary" disabled={pending} onClick={() => changeStep(step - 1)}>
              <span aria-hidden="true">←</span> Back
            </button>
          ) : (
            <span className="intake-action-note">
              A little about you.
              <br />A lot of possibility.
            </span>
          )}
          <button type="submit" className="intake-primary" disabled={pending}>
            {pending ? 'Sending your request…' : step === 3 ? 'Send mentorship request' : 'Continue'}
            {!pending && <span aria-hidden="true">↗</span>}
          </button>
        </div>
        {step === 3 && !serverError && (
          <button
            type="button"
            className="intake-text-button intake-download"
            disabled={pending}
            onClick={downloadAnswers}
          >
            Download a copy of your answers <span aria-hidden="true">↓</span>
          </button>
        )}
      </form>
    </div>
  );
}
