export type TrendingItem = {
  id: number;
  type: 'note' | 'flashcard' | 'exam';
  title: string;
  author: string;
  topic: string;
  likes: number;
};

export type Creator = {
  id: number;
  name: string;
  handle: string;
  followers: string;
  delta: string;
  hue: number;
};

export type Topic = { name: string; count: number; trend: string };

export type ActivityItem = {
  id: number;
  name: string;
  hue: number;
  verb: string;
  what: string;
  when: string;
};

export const TYPE_META = {
  note: { label: 'Note', hue: 95, color: 'oklch(0.7 0.12 95)' },
  flashcard: { label: 'Flashcard', hue: 200, color: 'oklch(0.7 0.12 200)' },
  exam: { label: 'Exam', hue: 28, color: 'oklch(0.72 0.13 28)' },
} as const;

export const TRENDING_ITEMS: TrendingItem[] = [
  {
    id: 1,
    type: 'flashcard',
    title: 'IELTS Academic Vocabulary · Band 8+',
    author: 'Aiko Tanaka',
    topic: 'English',
    likes: 1240,
  },
  {
    id: 2,
    type: 'note',
    title: 'The Pomodoro myth — 4 years of focus tracking',
    author: 'Sofia Klein',
    topic: 'Productivity',
    likes: 904,
  },
  {
    id: 3,
    type: 'flashcard',
    title: 'Anatomy · Cranial Nerves Mnemonic',
    author: 'Priya Shah',
    topic: 'Medicine',
    likes: 712,
  },
  {
    id: 4,
    type: 'exam',
    title: 'System Design Mock — FAANG L5',
    author: 'Diego Vargas',
    topic: 'CS',
    likes: 521,
  },
  {
    id: 5,
    type: 'note',
    title: 'How fiber reconciliation actually works',
    author: 'Mai Linh',
    topic: 'React',
    likes: 384,
  },
];

export const TOP_CREATORS: Creator[] = [
  {
    id: 1,
    name: 'Aiko Tanaka',
    handle: 'aiko.t',
    followers: '11.4k',
    delta: '+312',
    hue: 320,
  },
  {
    id: 2,
    name: 'Sofia Klein',
    handle: 'sofia.k',
    followers: '8.9k',
    delta: '+248',
    hue: 15,
  },
  {
    id: 3,
    name: 'Priya Shah',
    handle: 'priya',
    followers: '6.7k',
    delta: '+156',
    hue: 85,
  },
  {
    id: 4,
    name: 'Diego Vargas',
    handle: 'dvargas',
    followers: '2.8k',
    delta: '+98',
    hue: 200,
  },
  {
    id: 5,
    name: 'Mai Linh',
    handle: 'mailinh',
    followers: '4.2k',
    delta: '+74',
    hue: 28,
  },
];

export const TRENDING_TOPICS: Topic[] = [
  { name: 'Computer Science', count: 4204, trend: '+12%' },
  { name: 'Languages', count: 8917, trend: '+8%' },
  { name: 'Medicine', count: 2310, trend: '+22%' },
  { name: 'Mathematics', count: 3145, trend: '+4%' },
  { name: 'Design', count: 1078, trend: '+18%' },
  { name: 'Finance', count: 1832, trend: '+6%' },
];

export const RECENT_ACTIVITY: ActivityItem[] = [
  {
    id: 1,
    name: 'Mai Linh',
    hue: 28,
    verb: 'published',
    what: 'How Fiber works',
    when: '12m',
  },
  {
    id: 2,
    name: 'Aiko Tanaka',
    hue: 320,
    verb: 'forked',
    what: 'JLPT N3 Grammar',
    when: '38m',
  },
  {
    id: 3,
    name: 'Priya Shah',
    hue: 85,
    verb: 'saved',
    what: 'OKLCH field guide',
    when: '1h',
  },
  {
    id: 4,
    name: 'Diego Vargas',
    hue: 200,
    verb: 'commented on',
    what: 'System Design Mock',
    when: '2h',
  },
  {
    id: 5,
    name: 'Sofia Klein',
    hue: 15,
    verb: 'published',
    what: 'Pomodoro myth',
    when: '3h',
  },
];
