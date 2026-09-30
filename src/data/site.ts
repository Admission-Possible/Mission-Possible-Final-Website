export const navigation = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About Us' },
  { id: 'how-it-works', label: 'How It Works' },
  { id: 'what-we-offer', label: 'What We Offer' },
  { id: 'join', label: 'Join Us' },
] as const;

export const campuses = [
  { src: '/campus/campus-0.webp', name: 'Johns Hopkins' },
  { src: '/campus/campus-8.webp', name: 'Harvard' },
  { src: '/campus/campus-4.webp', name: 'Brown' },
  { src: '/campus/campus-12.webp', name: 'Rice' },
  { src: '/campus/campus-2.webp', name: 'Harvard' },
  { src: '/campus/campus-7.webp', name: 'Northwestern' },
  { src: '/campus/campus-6.webp', name: 'Columbia' },
  { src: '/campus/campus-13.webp', name: 'Rice' },
  { src: '/campus/campus-17.webp', name: 'Johns Hopkins' },
  { src: '/campus/campus-1.webp', name: 'Harvard' },
  { src: '/campus/campus-16.webp', name: 'Penn' },
  { src: '/campus/campus-3.webp', name: 'Brown' },
  { src: '/campus/campus-14.webp', name: 'Stanford' },
];

export const universityMarks = [
  { src: 'brown-provided.png', name: 'Brown University' },
  { src: 'davis.svg', name: 'UC Davis' },
  { src: 'bu.svg', name: 'Boston University' },
  { src: 'berkeley.svg', name: 'UC Berkeley' },
  { src: 'penn-full.png', name: 'University of Pennsylvania' },
  { src: 'mit.png', name: 'MIT' },
  { src: 'tufts.svg', name: 'Tufts University' },
  { src: 'hamilton.svg', name: 'Hamilton College' },
  { src: 'williams.png', name: 'Williams College' },
  { src: 'pomona.svg', name: 'Pomona College' },
  { src: 'miami.png', name: 'University of Miami' },
  { src: 'florida.png', name: 'University of Florida' },
];

export const steps = [
  {
    title: 'Route',
    body: 'Tell us your story. We’ll understand where you are and match you with a mentor to map your next steps.',
    image: '/campus/steps/harvard-1600.webp',
    campus: 'Harvard University',
  },
  {
    title: 'Build your list',
    body: 'Discover colleges that fit your interests, your priorities, and your financial picture.',
    image: '/campus/steps/brown-1600.webp',
    campus: 'Brown University',
  },
  {
    title: 'Learn & write',
    body: 'Turn your experiences into essays that sound like you, with thoughtful feedback along the way.',
    image: '/campus/steps/columbia-1600.webp',
    campus: 'Columbia University',
  },
  {
    title: 'Apply',
    body: 'Navigate the right application platforms and keep every requirement, draft, and deadline in view.',
    image: '/campus/steps/mit-1600.webp',
    campus: 'Massachusetts Institute of Technology',
  },
  {
    title: 'Submit',
    body: 'Give the details one last look, take your next step, and keep building toward what comes after.',
    image: '/campus/steps/penn-state-1600.webp',
    campus: 'Penn State University',
  },
];

export const pathways = [
  {
    name: 'QuestBridge',
    detail: 'College & scholarship opportunities',
    logo: 'questbridge.svg',
    href: 'https://www.questbridge.org/',
    color: '#e9e1f4',
  },
  {
    name: 'Common App',
    detail: 'One application. More possibilities.',
    logo: 'commonapp-dark.svg',
    href: 'https://www.commonapp.org/',
    color: '#e5eef7',
  },
  {
    name: 'UC Application',
    detail: 'The University of California',
    logo: 'uc.svg',
    href: 'https://admission.universityofcalifornia.edu/',
    color: '#f5edcf',
  },
  {
    name: 'Coalition',
    detail: 'Apply with Coalition on Scoir',
    logo: 'coalition.png',
    href: 'https://www.coalitionforcollegeaccess.org/',
    color: '#e5ece9',
  },
  {
    name: 'ApplyTexas',
    detail: 'Find your future in Texas',
    logo: 'applytexas.jpg',
    href: 'https://www.applytexas.org/',
    color: '#f5e1df',
  },
  {
    name: 'CBCA',
    detail: 'Common Black College Application',
    logo: 'cbca.png',
    href: 'https://commonblackcollegeapp.com/',
    color: '#e8e3f5',
  },
];
