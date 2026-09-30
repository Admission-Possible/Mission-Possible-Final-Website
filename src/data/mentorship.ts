/** The client, review screen and delivery endpoint share one intake contract. */
export const intakeSteps = ['About you', 'Your academics', 'Your direction', 'Review & send'] as const;

export const gradeOptions = [
  '9th grade',
  '10th grade',
  '11th grade',
  '12th grade',
  'Gap year / graduated',
  'Other',
] as const;
export const stageOptions = [
  'Just exploring',
  'Building my college list',
  'Working on essays',
  'Completing applications',
  'Submitted some applications',
  'Comparing offers / planning next steps',
] as const;
export const guidanceOptions = [
  'Finding colleges',
  'Essays & personal statements',
  'Application planning',
  'Scholarships & financial aid',
  'Choosing classes & activities',
  'First-generation college guidance',
] as const;
export const firstGenOptions = ['Yes', 'No', 'Not sure', 'Prefer not to say'] as const;
export const aidOptions = [
  'I would like financial aid guidance',
  'I do not need guidance right now',
  'Not sure yet',
  'Prefer not to say',
] as const;

export const intakeFields = [
  { key: 'fullName', label: 'Full name', step: 0, max: 160, required: true },
  { key: 'email', label: 'Email address', step: 0, max: 254, required: true },
  { key: 'highSchool', label: 'High school', step: 0, max: 200, required: true },
  { key: 'location', label: 'City, state / region, and country', step: 0, max: 200, required: true },
  { key: 'grade', label: 'Current grade', step: 0, max: 60, required: true },
  { key: 'classesTaken', label: 'Classes you have completed', step: 1, max: 2000, required: true },
  { key: 'currentClasses', label: 'Classes you are taking now', step: 1, max: 2000, required: true },
  { key: 'plannedClasses', label: 'Classes you plan to take', step: 1, max: 2000, required: true },
  { key: 'extracurriculars', label: 'Activities, work, and responsibilities', step: 1, max: 2000, required: true },
  { key: 'interests', label: 'What are you interested in?', step: 2, max: 1500, required: true },
  { key: 'targetColleges', label: 'Colleges you have in mind', step: 2, max: 1500, required: true },
  { key: 'applicationStage', label: 'Where are you in the application process?', step: 2, max: 80, required: true },
  { key: 'availability', label: 'When can you meet with a mentor?', step: 2, max: 600, required: true },
  { key: 'timezone', label: 'Your time zone', step: 2, max: 100, required: true },
  {
    key: 'firstGeneration',
    label: 'Would you be the first in your family to attend college?',
    step: 2,
    max: 40,
    required: false,
  },
  { key: 'financialAid', label: 'Would financial aid guidance be useful?', step: 2, max: 80, required: false },
  {
    key: 'additionalContext',
    label: 'Anything else that would help us match you?',
    step: 2,
    max: 2000,
    required: false,
  },
] as const;

export type IntakeTextKey = (typeof intakeFields)[number]['key'];
export type IntakeAnswers = Record<IntakeTextKey, string> & { guidance: string[]; consent: boolean; website: string };
export type IntakeErrorKey = IntakeTextKey | 'guidance' | 'consent' | 'website';
export type IntakeErrors = Partial<Record<IntakeErrorKey, string>>;

export function createIntakeAnswers(): IntakeAnswers {
  return Object.fromEntries([
    ...intakeFields.map(({ key }) => [key, '']),
    ['guidance', []],
    ['consent', false],
    ['website', ''],
  ]) as IntakeAnswers;
}

export function normalizeIntake(answers: IntakeAnswers): IntakeAnswers {
  return {
    ...answers,
    ...Object.fromEntries(intakeFields.map(({ key }) => [key, answers[key].trim()])),
    guidance: [...answers.guidance],
  };
}

/** Never silently truncate students' answers. Validate exactly what will be sent. */
export function validateIntake(raw: unknown, step?: number): IntakeErrors {
  const errors: IntakeErrors = {};
  const body = raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  for (const field of intakeFields) {
    if (step !== undefined && field.step !== step) continue;
    const value = body[field.key];
    if (typeof value !== 'string') {
      errors[field.key] = `Please enter ${field.label.toLowerCase()}.`;
    } else if (field.required && !value.trim()) {
      errors[field.key] = `Please enter ${field.label.toLowerCase()}.`;
    } else if (value.length > field.max) {
      errors[field.key] = `Please use ${field.max.toLocaleString('en-US')} characters or fewer.`;
    }
  }
  if (step === undefined || step === 0) {
    if (typeof body.email === 'string' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim()))
      errors.email = 'Enter a valid email address so we can reach you.';
    if (!gradeOptions.includes(body.grade as (typeof gradeOptions)[number]))
      errors.grade = 'Please select your current grade.';
    for (const key of ['fullName', 'email', 'highSchool', 'location'] as const) {
      if (typeof body[key] === 'string' && (/[\r\n]/.test(body[key]) || body[key].includes('\0')))
        errors[key] = 'Please enter this on a single line.';
    }
  }
  if (step === undefined || step === 2) {
    if (!stageOptions.includes(body.applicationStage as (typeof stageOptions)[number]))
      errors.applicationStage = 'Please select your application stage.';
    if (
      !Array.isArray(body.guidance) ||
      body.guidance.length === 0 ||
      body.guidance.length > guidanceOptions.length ||
      new Set(body.guidance).size !== body.guidance.length ||
      body.guidance.some((item) => !guidanceOptions.includes(item))
    )
      errors.guidance = 'Choose at least one area where you would like support.';
    if (
      body.firstGeneration !== '' &&
      !firstGenOptions.includes(body.firstGeneration as (typeof firstGenOptions)[number])
    )
      errors.firstGeneration = 'Please choose one of the listed options.';
    if (body.financialAid !== '' && !aidOptions.includes(body.financialAid as (typeof aidOptions)[number]))
      errors.financialAid = 'Please choose one of the listed options.';
    if (typeof body.timezone === 'string' && (/[\r\n]/.test(body.timezone) || body.timezone.includes('\0')))
      errors.timezone = 'Please enter your time zone on a single line.';
  }
  if (step === undefined || step === 3) {
    if (body.consent !== true)
      errors.consent = 'Please agree to the use of your answers for mentorship matching and contact.';
  }
  if (step === undefined && (typeof body.website !== 'string' || body.website.length > 0))
    errors.website = 'We could not process this request. Please try again.';
  return errors;
}

export function formatIntake(answers: IntakeAnswers): string {
  const lines = ['ADMISSION POSSIBLE — MENTORSHIP REQUEST', ''];
  for (const [index, name] of intakeSteps.slice(0, 3).entries()) {
    lines.push(name.toUpperCase());
    for (const field of intakeFields.filter((item) => item.step === index))
      lines.push(`${field.label}: ${answers[field.key].trim() || 'Not provided'}`);
    if (index === 2) lines.push(`Preferred guidance: ${answers.guidance.join(', ')}`);
    lines.push('');
  }
  lines.push(`Consent to mentorship matching and contact: ${answers.consent ? 'Yes' : 'No'}`);
  return lines.join('\n');
}
