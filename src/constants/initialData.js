export const COURSES = [
  { id: 'cs101', code: 'CS 101', name: 'Computer Science & Data Structures', color: '#6366f1' },
  { id: 'math201', code: 'MATH 201', name: 'Calculus & Linear Algebra', color: '#0284c7' },
  { id: 'phys102', code: 'PHYS 102', name: 'Physics: Electromagnetism', color: '#059669' },
  { id: 'eng210', code: 'ENG 210', name: 'Academic Writing & Research', color: '#d97706' },
  { id: 'bio105', code: 'BIO 105', name: 'Molecular Biology & Genetics', color: '#e11d48' },
]

export const PRIORITIES = {
  urgent: {
    label: 'Urgent',
    weight: 4,
    badgeBg: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    dotColor: 'bg-rose-500',
    accentColor: '#f43f5e'
  },
  high: {
    label: 'High',
    weight: 3,
    badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    dotColor: 'bg-amber-500',
    accentColor: '#f59e0b'
  },
  medium: {
    label: 'Medium',
    weight: 2,
    badgeBg: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    dotColor: 'bg-indigo-500',
    accentColor: '#6366f1'
  },
  low: {
    label: 'Low',
    weight: 1,
    badgeBg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    dotColor: 'bg-slate-400',
    accentColor: '#94a3b8'
  }
}

export const TASK_TYPES = {
  assignment: { label: 'Assignment', icon: 'FileText' },
  exam: { label: 'Exam / Quiz', icon: 'GraduationCap' },
  lab: { label: 'Lab Report', icon: 'FlaskConical' },
  project: { label: 'Term Project', icon: 'FolderGit2' },
  reading: { label: 'Reading Prep', icon: 'BookOpen' },
  presentation: { label: 'Presentation', icon: 'Presentation' }
}

// Generate relative dates for initial demo
const now = new Date()
const formatDate = (daysOffset, hour = 23, minute = 59) => {
  const d = new Date(now)
  d.setDate(d.getDate() + daysOffset)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

export const INITIAL_TASKS = [
  {
    id: 'task-1',
    title: 'Data Structures Lab 4: Binary Search Trees',
    course_id: 'cs101',
    type: 'lab',
    due_date: formatDate(1, 23, 59), // Due tomorrow
    priority: 'urgent',
    status: 'in_progress',
    estimated_minutes: 120,
    weight: 15,
    notes: 'Implement insert, delete, and balanced tree rotations in C++. Include memory leak verification using Valgrind.',
    subtasks: [
      { id: 'st-1', title: 'Implement Node struct and insertion logic', completed: true },
      { id: 'st-2', title: 'Implement tree balancing & deletion', completed: false },
      { id: 'st-3', title: 'Run automated test suite and check memory leaks', completed: false }
    ],
    created_at: formatDate(-2)
  },
  {
    id: 'task-2',
    title: 'Calculus Midterm II Practice & Formula Sheet',
    course_id: 'math201',
    type: 'exam',
    due_date: formatDate(3, 10, 0), // Due in 3 days
    priority: 'high',
    status: 'todo',
    estimated_minutes: 180,
    weight: 25,
    notes: 'Focus on Taylor series expansions, double integrals in polar coordinates, and gradient vector fields.',
    subtasks: [
      { id: 'st-4', title: 'Review Chapter 14 homework solutions', completed: false },
      { id: 'st-5', title: 'Complete 2023 practice midterm exam', completed: false },
      { id: 'st-6', title: 'Synthesize single-page formula cheat sheet', completed: false }
    ],
    created_at: formatDate(-3)
  },
  {
    id: 'task-3',
    title: 'Research Essay: Ethical Implications of Generative AI',
    course_id: 'eng210',
    type: 'assignment',
    due_date: formatDate(6, 17, 0), // Due in 6 days
    priority: 'medium',
    status: 'todo',
    estimated_minutes: 150,
    weight: 20,
    notes: 'Draft 2,000 words covering copyright litigation, energy footprint, and academic integrity policies. MLA format.',
    subtasks: [
      { id: 'st-7', title: 'Gather 5 peer-reviewed scholarly references', completed: true },
      { id: 'st-8', title: 'Write outline with thesis statement', completed: true },
      { id: 'st-9', title: 'Draft main body arguments and counterarguments', completed: false },
      { id: 'st-10', title: 'Proofread and format citations', completed: false }
    ],
    created_at: formatDate(-4)
  },
  {
    id: 'task-4',
    title: 'Electromagnetism Lab: Faraday Induction Analysis',
    course_id: 'phys102',
    type: 'lab',
    due_date: formatDate(8, 23, 59),
    priority: 'low',
    status: 'todo',
    estimated_minutes: 90,
    weight: 10,
    notes: 'Plot voltage vs magnetic flux frequency in Python/Matplotlib and compute experimental error margins.',
    subtasks: [
      { id: 'st-11', title: 'Process CSV sensor readings in pandas', completed: false },
      { id: 'st-12', title: 'Generate error bar scatter plots', completed: false }
    ],
    created_at: formatDate(-1)
  },
  {
    id: 'task-5',
    title: 'DNA Replication & Polymerase Reading Guide',
    course_id: 'bio105',
    type: 'reading',
    due_date: formatDate(-1, 14, 0), // Yesterday (Completed)
    priority: 'medium',
    status: 'completed',
    estimated_minutes: 60,
    weight: 5,
    notes: 'Campbell Biology Chapter 16 reading notes and end-of-chapter quiz preparation.',
    subtasks: [
      { id: 'st-13', title: 'Read pages 315-334', completed: true },
      { id: 'st-14', title: 'Diagram replication fork replication enzymes', completed: true }
    ],
    completed_at: formatDate(-1, 13, 45),
    created_at: formatDate(-5)
  }
]
