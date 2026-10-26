/**
 * ScholarFlow - Modern Academic Task & Deadline Cockpit
 * Zero-Account, Offline-First, Pure Vanilla JS Architecture
 */

(function () {
  'use strict';

  // --- Sound Synthesizer via Web Audio API ---
  class SoundFX {
    constructor() {
      this.enabled = true;
      this.ctx = null;
    }

    initContext() {
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.08) {
      if (!this.enabled) return;
      try {
        this.initContext();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {
        // Audio might be blocked by browser policy until gesture
      }
    }

    click() {
      this.playTone(600, 'sine', 0.05, 0.04);
    }

    complete() {
      if (!this.enabled) return;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio
      notes.forEach((freq, idx) => {
        setTimeout(() => this.playTone(freq, 'triangle', 0.25, 0.08), idx * 70);
      });
    }

    delete() {
      this.playTone(280, 'sawtooth', 0.12, 0.05);
    }

    timerTick() {
      this.playTone(800, 'sine', 0.02, 0.015);
    }

    timerDone() {
      if (!this.enabled) return;
      const fanfare = [587.33, 739.99, 880.00, 1174.66];
      fanfare.forEach((f, i) => {
        setTimeout(() => this.playTone(f, 'sine', 0.4, 0.1), i * 120);
      });
    }
  }

  const sfx = new SoundFX();

  // --- Date Utility Helpers ---
  function getRelativeDate(offsetDays, hours = 23, minutes = 59) {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    d.setHours(hours, minutes, 0, 0);
    return d.toISOString();
  }

  function formatDateISO(isoStr) {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    return d.toISOString().split('T')[0];
  }

  function formatTimeISO(isoStr) {
    if (!isoStr) return '23:59';
    const d = new Date(isoStr);
    const hrs = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${hrs}:${mins}`;
  }

  function getDeadlineInfo(isoStr) {
    if (!isoStr) return { text: 'No deadline', statusClass: 'deadline-future', isOverdue: false, isUrgent: false };
    const now = new Date();
    const due = new Date(isoStr);
    const diffMs = due - now;
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffMs < 0) {
      const pastHours = Math.abs(diffHours);
      const text = pastHours < 24 ? `Overdue by ${pastHours}h` : `Overdue by ${Math.ceil(pastHours / 24)}d`;
      return { text, statusClass: 'deadline-overdue', isOverdue: true, isUrgent: true };
    }

    if (diffHours <= 12) {
      return { text: `Due in ${diffHours}h`, statusClass: 'deadline-today', isOverdue: false, isUrgent: true };
    }

    if (diffDays <= 1) {
      return { text: `Due today at ${formatTimeISO(isoStr)}`, statusClass: 'deadline-today', isOverdue: false, isUrgent: true };
    }

    if (diffDays === 2) {
      return { text: `Due tomorrow at ${formatTimeISO(isoStr)}`, statusClass: 'deadline-tomorrow', isOverdue: false, isUrgent: false };
    }

    return {
      text: due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ` (${diffDays}d left)`,
      statusClass: 'deadline-future',
      isOverdue: false,
      isUrgent: false
    };
  }

  // --- Initial Demo State Generator ---
  function getDefaultCourses() {
    return [
      { id: 'c1', code: 'CS 101', name: 'Intro to Algorithms & Data Structures', color: '#6366f1' },
      { id: 'c2', code: 'MATH 201', name: 'Multivariable Calculus', color: '#ec4899' },
      { id: 'c3', code: 'PHYS 150', name: 'Classical Mechanics & Lab', color: '#f59e0b' },
      { id: 'c4', code: 'ENG 102', name: 'Academic Research & Composition', color: '#10b981' },
      { id: 'c5', code: 'BIO 110', name: 'Cellular & Molecular Biology', color: '#06b6d4' }
    ];
  }

  function getDefaultTasks() {
    return [
      {
        id: 't1',
        title: 'Problem Set 4: Graph Traversals & Dijkstra Algorithm',
        courseId: 'c1',
        type: 'assignment',
        dueDate: getRelativeDate(0, 23, 59), // Due today
        priority: 'urgent',
        status: 'in_progress',
        estimatedMinutes: 90,
        weight: 15,
        notes: 'Implement BFS, DFS and Dijkstra in Python. Submit on Gradescope with all 12 test assertions passing.',
        subtasks: [
          { id: 's1', text: 'Adjacency list graph representation', completed: true },
          { id: 's2', text: 'Implement priority queue for Dijkstra', completed: true },
          { id: 's3', text: 'Write cycle detection unit tests', completed: false }
        ],
        completedAt: null
      },
      {
        id: 't2',
        title: 'Midterm Exam Preparation & Formula Sheet',
        courseId: 'c2',
        type: 'exam',
        dueDate: getRelativeDate(1, 10, 0), // Tomorrow morning
        priority: 'urgent',
        status: 'todo',
        estimatedMinutes: 120,
        weight: 25,
        notes: 'Covers Partial derivatives, Lagrange multipliers, double and triple integrals in polar coordinates.',
        subtasks: [
          { id: 's4', text: 'Complete 2024 Practice Exam', completed: true },
          { id: 's5', text: 'Condense single-page handwritten reference sheet', completed: false }
        ],
        completedAt: null
      },
      {
        id: 't3',
        title: 'Weekly Physics Lab 5 Report: Damped Harmonic Motion',
        courseId: 'c3',
        type: 'lab',
        dueDate: getRelativeDate(-1, 17, 0), // Overdue by 1 day
        priority: 'high',
        status: 'review',
        estimatedMinutes: 75,
        weight: 10,
        notes: 'Include error bars and damping coefficient calculations from tracker video data.',
        subtasks: [
          { id: 's6', text: 'Plot oscillation decay curves in Python/Matplotlib', completed: true },
          { id: 's7', text: 'Draft discussion and error propagation section', completed: true }
        ],
        completedAt: null
      },
      {
        id: 't4',
        title: 'Term Research Essay Draft: AI Ethics in Healthcare',
        courseId: 'c4',
        type: 'project',
        dueDate: getRelativeDate(4, 23, 59),
        priority: 'high',
        status: 'todo',
        estimatedMinutes: 180,
        weight: 30,
        notes: 'Minimum 2,500 words, MLA 9th edition format. Need at least 8 peer-reviewed academic citations.',
        subtasks: [
          { id: 's8', text: 'Formulate thesis statement and 4-point outline', completed: true },
          { id: 's9', text: 'Draft Introduction and Literature Review', completed: false },
          { id: 's10', text: 'Cite primary studies on diagnostic fairness', completed: false }
        ],
        completedAt: null
      },
      {
        id: 't5',
        title: 'Pre-lecture Reading: Chapter 8 Cellular Respiration & ATP Synthase',
        courseId: 'c5',
        type: 'reading',
        dueDate: getRelativeDate(2, 9, 0),
        priority: 'medium',
        status: 'todo',
        estimatedMinutes: 45,
        weight: 5,
        notes: 'Take Cornell notes on electron transport chain complex I-IV and chemiosmosis.',
        subtasks: [],
        completedAt: null
      },
      {
        id: 't6',
        title: 'Robotics Club autonomous rover chassis soldering',
        courseId: 'c1',
        type: 'extracurricular',
        dueDate: getRelativeDate(6, 18, 0),
        priority: 'low',
        status: 'todo',
        estimatedMinutes: 60,
        weight: 0,
        notes: 'Meet team in engineering maker-space room 204.',
        subtasks: [],
        completedAt: null
      },
      {
        id: 't7',
        title: 'Math Homework 3: Gradient Vectors & Directional Derivatives',
        courseId: 'c2',
        type: 'assignment',
        dueDate: getRelativeDate(-2, 23, 59),
        priority: 'medium',
        status: 'completed',
        estimatedMinutes: 60,
        weight: 5,
        notes: 'Submitted via WebAssign with 100% score.',
        subtasks: [],
        completedAt: new Date(Date.now() - 86400000 * 2).toISOString()
      }
    ];
  }

  // --- Supabase Cloud Sync Engine ---
  class SupabaseManager {
    constructor(store, ui) {
      this.store = store;
      this.ui = ui;
      this.client = null;
      this.configKey = 'scholarflow_supabase_config';
      this.config = this.loadConfig();
      this.status = 'local'; // 'local' | 'connected' | 'syncing' | 'error'
      this.initClient();
    }

    loadConfig() {
      try {
        const raw = localStorage.getItem(this.configKey);
        if (raw) return JSON.parse(raw);
      } catch (e) {}
      return { url: '', key: '', autoSync: true, connected: false };
    }

    saveConfig(newConfig) {
      this.config = { ...this.config, ...newConfig };
      localStorage.setItem(this.configKey, JSON.stringify(this.config));
    }

    initClient() {
      if (this.config.url && this.config.key && window.supabase) {
        try {
          this.client = window.supabase.createClient(this.config.url, this.config.key);
          this.status = 'connected';
        } catch (e) {
          console.error('Supabase client initialization error', e);
          this.client = null;
          this.status = 'error';
        }
      } else {
        this.client = null;
        this.status = 'local';
      }
    }

    async testConnection(url = null, key = null) {
      const testUrl = (url || this.config.url || '').trim();
      const testKey = (key || this.config.key || '').trim();
      if (!testUrl || !testKey) {
        return { ok: false, error: 'Please enter both Supabase Project URL and Anon Key.' };
      }
      if (!window.supabase) {
        return { ok: false, error: 'Supabase JS library is loading or blocked by browser.' };
      }
      try {
        const testClient = window.supabase.createClient(testUrl, testKey);
        const { data, error } = await testClient.from('courses').select('id', { count: 'exact', head: true });
        if (error) {
          if (error.code === '42P01') {
            return { ok: false, error: 'Connected to Supabase, but "courses" table does not exist. Please run the SQL schema script in Supabase SQL Editor!' };
          }
          return { ok: false, error: error.message || 'Connection failed' };
        }
        return { ok: true, message: 'Successfully verified connection to Supabase database!' };
      } catch (err) {
        return { ok: false, error: err.message || 'Connection error' };
      }
    }

    async pushAll() {
      if (!this.client) throw new Error('Supabase is not connected. Enter your credentials first.');
      this.status = 'syncing';
      if (this.ui) this.ui.updateSupabaseStatus();

      try {
        // 1. Sync Courses
        if (this.store.courses.length > 0) {
          const coursesPayload = this.store.courses.map(c => ({
            id: c.id,
            code: c.code,
            name: c.name,
            color: c.color
          }));
          const { error: cErr } = await this.client.from('courses').upsert(coursesPayload, { onConflict: 'id' });
          if (cErr) throw new Error(`Courses sync failed: ${cErr.message}`);
        }

        // 2. Sync Tasks
        if (this.store.tasks.length > 0) {
          const tasksPayload = this.store.tasks.map(t => ({
            id: t.id,
            course_id: t.courseId,
            title: t.title,
            type: t.type,
            due_date: t.dueDate,
            priority: t.priority,
            status: t.status,
            estimated_minutes: t.estimatedMinutes,
            weight: t.weight,
            notes: t.notes,
            subtasks: t.subtasks || [],
            completed_at: t.completedAt
          }));
          const { error: tErr } = await this.client.from('tasks').upsert(tasksPayload, { onConflict: 'id' });
          if (tErr) throw new Error(`Tasks sync failed: ${tErr.message}`);
        }

        this.status = 'connected';
        if (this.ui) this.ui.updateSupabaseStatus();
        return { ok: true, coursesCount: this.store.courses.length, tasksCount: this.store.tasks.length };
      } catch (err) {
        this.status = 'error';
        if (this.ui) this.ui.updateSupabaseStatus();
        throw err;
      }
    }

    async pullAll() {
      if (!this.client) throw new Error('Supabase is not connected. Enter your credentials first.');
      this.status = 'syncing';
      if (this.ui) this.ui.updateSupabaseStatus();

      try {
        const { data: remoteCourses, error: cErr } = await this.client.from('courses').select('*');
        if (cErr) throw new Error(`Courses fetch failed: ${cErr.message}`);

        const { data: remoteTasks, error: tErr } = await this.client.from('tasks').select('*');
        if (tErr) throw new Error(`Tasks fetch failed: ${tErr.message}`);

        if (remoteCourses && remoteCourses.length > 0) {
          this.store.courses = remoteCourses.map(rc => ({
            id: rc.id,
            code: rc.code,
            name: rc.name,
            color: rc.color
          }));
        }

        if (remoteTasks) {
          this.store.tasks = remoteTasks.map(rt => ({
            id: rt.id,
            courseId: rt.course_id,
            title: rt.title,
            type: rt.type,
            dueDate: rt.due_date,
            priority: rt.priority,
            status: rt.status,
            estimatedMinutes: rt.estimated_minutes,
            weight: rt.weight,
            notes: rt.notes,
            subtasks: rt.subtasks || [],
            completedAt: rt.completed_at
          }));
        }

        this.store.save();
        this.status = 'connected';
        if (this.ui) this.ui.updateSupabaseStatus();
        return { ok: true, coursesCount: remoteCourses?.length || 0, tasksCount: remoteTasks?.length || 0 };
      } catch (err) {
        this.status = 'error';
        if (this.ui) this.ui.updateSupabaseStatus();
        throw err;
      }
    }

    async autoSyncTask(task, action = 'upsert') {
      if (!this.client || !this.config.autoSync) return;
      try {
        if (action === 'delete') {
          await this.client.from('tasks').delete().eq('id', task.id);
        } else {
          await this.client.from('tasks').upsert({
            id: task.id,
            course_id: task.courseId,
            title: task.title,
            type: task.type,
            due_date: task.dueDate,
            priority: task.priority,
            status: task.status,
            estimated_minutes: task.estimatedMinutes,
            weight: task.weight,
            notes: task.notes,
            subtasks: task.subtasks || [],
            completed_at: task.completedAt
          }, { onConflict: 'id' });
        }
      } catch (e) {
        console.warn('Auto-sync task skipped or failed:', e);
      }
    }

    async autoSyncCourse(course, action = 'upsert') {
      if (!this.client || !this.config.autoSync) return;
      try {
        if (action === 'delete') {
          await this.client.from('courses').delete().eq('id', course.id);
        } else {
          await this.client.from('courses').upsert({
            id: course.id,
            code: course.code,
            name: course.name,
            color: course.color
          }, { onConflict: 'id' });
        }
      } catch (e) {
        console.warn('Auto-sync course skipped or failed:', e);
      }
    }
  }

  // --- State Store ---
  class Store {
    constructor() {
      this.STORAGE_KEY = 'scholarflow_v1_store';
      this.load();
    }

    load() {
      try {
        const raw = localStorage.getItem(this.STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          this.courses = parsed.courses || getDefaultCourses();
          this.tasks = parsed.tasks || getDefaultTasks();
          this.pomoStats = parsed.pomoStats || { completedBlocks: 3, totalMinutes: 75, streak: 5 };
          return;
        }
      } catch (e) {
        console.warn('Storage parsing failed, loading defaults', e);
      }
      this.resetDefaults();
    }

    save() {
      try {
        const payload = {
          courses: this.courses,
          tasks: this.tasks,
          pomoStats: this.pomoStats,
          updatedAt: new Date().toISOString()
        };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(payload));
      } catch (e) {
        console.error('Storage save error:', e);
      }
    }

    resetDefaults() {
      this.courses = getDefaultCourses();
      this.tasks = getDefaultTasks();
      this.pomoStats = { completedBlocks: 3, totalMinutes: 75, streak: 5 };
      this.save();
    }

    clearAll() {
      this.courses = [];
      this.tasks = [];
      this.pomoStats = { completedBlocks: 0, totalMinutes: 0, streak: 0 };
      this.save();
    }

    addTask(task) {
      this.tasks.unshift(task);
      this.save();
      if (window.scholarApp?.supabase) {
        window.scholarApp.supabase.autoSyncTask(task, 'upsert');
      }
    }

    updateTask(id, updates) {
      const idx = this.tasks.findIndex(t => t.id === id);
      if (idx !== -1) {
        this.tasks[idx] = { ...this.tasks[idx], ...updates };
        this.save();
        if (window.scholarApp?.supabase) {
          window.scholarApp.supabase.autoSyncTask(this.tasks[idx], 'upsert');
        }
      }
    }

    deleteTask(id) {
      const task = this.getTask(id);
      this.tasks = this.tasks.filter(t => t.id !== id);
      this.save();
      if (task && window.scholarApp?.supabase) {
        window.scholarApp.supabase.autoSyncTask(task, 'delete');
      }
    }

    getTask(id) {
      return this.tasks.find(t => t.id === id);
    }

    getCourse(id) {
      return this.courses.find(c => c.id === id) || { id: 'unknown', code: 'General', name: 'General Academic', color: '#94a3b8' };
    }

    addCourse(course) {
      this.courses.push(course);
      this.save();
      if (window.scholarApp?.supabase) {
        window.scholarApp.supabase.autoSyncCourse(course, 'upsert');
      }
    }

    deleteCourse(id) {
      const course = this.getCourse(id);
      this.courses = this.courses.filter(c => c.id !== id);
      // Reassign or keep orphaned tasks
      this.save();
      if (course && window.scholarApp?.supabase) {
        window.scholarApp.supabase.autoSyncCourse(course, 'delete');
      }
    }
  }

  const store = new Store();

  // --- UI Controller ---
  class AppUI {
    constructor() {
      this.store = store;
      this.currentView = 'list';
      this.selectedCourseFilter = 'all';
      this.selectedTypeFilter = 'all';
      this.selectedPriorityFilter = 'all';
      this.selectedSort = 'deadline_asc';
      this.searchQuery = '';
      this.activeEditingTaskId = null;

      // Pomodoro Timer State
      this.timerMode = 'pomodoro'; // pomodoro (25), shortBreak (5), longBreak (15)
      this.timerDurations = { pomodoro: 25 * 60, shortBreak: 5 * 60, longBreak: 15 * 60 };
      this.timerRemaining = this.timerDurations.pomodoro;
      this.timerInterval = null;
      this.timerIsRunning = false;
      this.timerTargetTaskId = '';

      this.cacheDOMElements();
      this.bindEvents();
      this.initTheme();
      this.render();
    }

    cacheDOMElements() {
      // Views
      this.viewPanels = {
        list: document.getElementById('viewList'),
        kanban: document.getElementById('viewKanban'),
        calendar: document.getElementById('viewCalendar'),
        matrix: document.getElementById('viewMatrix'),
        focus: document.getElementById('viewFocus'),
        analytics: document.getElementById('viewAnalytics'),
        devbot: document.getElementById('viewDevbot')
      };

      this.navItems = document.querySelectorAll('.nav-item');
      this.viewTitle = document.getElementById('currentViewTitle');
      this.viewSubtitle = document.getElementById('currentViewSubtitle');
      this.listBadgeCount = document.getElementById('listBadgeCount');

      // Top bar & filters
      this.globalSearchInput = document.getElementById('globalSearchInput');
      this.urgentSummaryPill = document.getElementById('urgentSummaryPill');
      this.urgentCountText = document.getElementById('urgentCountText');
      this.btnDataActions = document.getElementById('btnDataActions');
      this.dataActionsMenu = document.getElementById('dataActionsMenu');
      this.filterCourseChips = document.getElementById('filterCourseChips');
      this.filterTypeSelect = document.getElementById('filterTypeSelect');
      this.filterPrioritySelect = document.getElementById('filterPrioritySelect');
      this.sortTasksSelect = document.getElementById('sortTasksSelect');

      // Quick inline add
      this.quickTaskInput = document.getElementById('quickTaskInput');
      this.quickCourseSelect = document.getElementById('quickCourseSelect');
      this.quickPrioritySelect = document.getElementById('quickPrioritySelect');
      this.quickDueDate = document.getElementById('quickDueDate');
      this.btnQuickSubmit = document.getElementById('btnQuickSubmit');

      // Feed groups
      this.groupOverdue = document.getElementById('groupOverdue');
      this.cardsOverdue = document.getElementById('cardsOverdue');
      this.countOverdue = document.getElementById('countOverdue');
      this.groupToday = document.getElementById('groupToday');
      this.cardsToday = document.getElementById('cardsToday');
      this.countToday = document.getElementById('countToday');
      this.groupTomorrow = document.getElementById('groupTomorrow');
      this.cardsTomorrow = document.getElementById('cardsTomorrow');
      this.countTomorrow = document.getElementById('countTomorrow');
      this.groupUpcoming = document.getElementById('groupUpcoming');
      this.cardsUpcoming = document.getElementById('cardsUpcoming');
      this.countUpcoming = document.getElementById('countUpcoming');
      this.groupCompleted = document.getElementById('groupCompleted');
      this.cardsCompleted = document.getElementById('cardsCompleted');
      this.countCompleted = document.getElementById('countCompleted');
      this.btnToggleCompletedGroup = document.getElementById('btnToggleCompletedGroup');
      this.listEmptyState = document.getElementById('listEmptyState');

      // Sidebar
      this.sidebarCourseList = document.getElementById('sidebarCourseList');
      this.streakDaysCount = document.getElementById('streakDaysCount');
      this.weeklyStreakFill = document.getElementById('weeklyStreakFill');
      this.streakSubtitle = document.getElementById('streakSubtitle');
      this.btnToggleAudio = document.getElementById('btnToggleAudio');
      this.audioIcon = document.getElementById('audioIcon');
      this.btnToggleTheme = document.getElementById('btnToggleTheme');
      this.themeIcon = document.getElementById('themeIcon');
      this.btnMobileMenu = document.getElementById('btnMobileMenu');
      this.sidebar = document.getElementById('sidebar');

      // Modals
      this.taskModal = document.getElementById('taskModal');
      this.btnOpenNewTaskModal = document.getElementById('btnOpenNewTaskModal');
      this.btnCloseTaskModal = document.getElementById('btnCloseTaskModal');
      this.btnCancelTaskModal = document.getElementById('btnCancelTaskModal');
      this.taskForm = document.getElementById('taskForm');
      this.taskModalTitle = document.getElementById('taskModalTitle');
      this.taskModalIcon = document.getElementById('taskModalIcon');
      this.formTaskId = document.getElementById('formTaskId');
      this.formTitle = document.getElementById('formTitle');
      this.formCourse = document.getElementById('formCourse');
      this.formType = document.getElementById('formType');
      this.formDueDate = document.getElementById('formDueDate');
      this.formDueTime = document.getElementById('formDueTime');
      this.formPriority = document.getElementById('formPriority');
      this.formStatus = document.getElementById('formStatus');
      this.formEstMinutes = document.getElementById('formEstMinutes');
      this.formGradeWeight = document.getElementById('formGradeWeight');
      this.formNotes = document.getElementById('formNotes');
      this.formSubtasksContainer = document.getElementById('formSubtasksContainer');
      this.btnAddSubtaskRow = document.getElementById('btnAddSubtaskRow');

      // Manage Courses Modal
      this.coursesModal = document.getElementById('coursesModal');
      this.btnManageCourses = document.getElementById('btnManageCourses');
      this.btnCloseCoursesModal = document.getElementById('btnCloseCoursesModal');
      this.btnDoneCoursesModal = document.getElementById('btnDoneCoursesModal');
      this.courseAddForm = document.getElementById('courseAddForm');
      this.manageCoursesList = document.getElementById('manageCoursesList');
      this.coursesModalCount = document.getElementById('coursesModalCount');

      // Calendar
      this.calDaysGrid = document.getElementById('calDaysGrid');
      this.calMonthTitle = document.getElementById('calMonthTitle');
      this.btnCalPrevMonth = document.getElementById('btnCalPrevMonth');
      this.btnCalNextMonth = document.getElementById('btnCalNextMonth');
      this.btnCalToday = document.getElementById('btnCalToday');
      this.calDayInspector = document.getElementById('calDayInspector');
      this.inspectorDateTitle = document.getElementById('inspectorDateTitle');
      this.inspectorTaskList = document.getElementById('inspectorTaskList');
      this.btnCloseInspector = document.getElementById('btnCloseInspector');
      this.currentCalDate = new Date();

      // Pomodoro
      this.timerDigits = document.getElementById('timerDigits');
      this.timerProgressCircle = document.getElementById('timerProgressCircle');
      this.timerSessionLabel = document.getElementById('timerSessionLabel');
      this.timerSelectedTaskDisplay = document.getElementById('timerSelectedTaskDisplay');
      this.btnTimerToggle = document.getElementById('btnTimerToggle');
      this.timerPlayIcon = document.getElementById('timerPlayIcon');
      this.timerPlayText = document.getElementById('timerPlayText');
      this.btnTimerReset = document.getElementById('btnTimerReset');
      this.btnTimerSkip = document.getElementById('btnTimerSkip');
      this.timerTaskSelect = document.getElementById('timerTaskSelect');
      this.pomoCountCompleted = document.getElementById('pomoCountCompleted');
      this.pomoTotalMinutes = document.getElementById('pomoTotalMinutes');
      this.pomodoroActiveDot = document.getElementById('pomodoroActiveDot');

      // Export / Sync
      this.btnExportICal = document.getElementById('btnExportICal');
      this.btnExportJSON = document.getElementById('btnExportJSON');
      this.inputImportJSON = document.getElementById('inputImportJSON');
      this.btnSeedDemoData = document.getElementById('btnSeedDemoData');
      this.btnClearAllData = document.getElementById('btnClearAllData');
      this.btnPrintPlanner = document.getElementById('btnPrintPlanner');
      this.btnEmptyAdd = document.getElementById('btnEmptyAdd');

      // Toast
      this.toastContainer = document.getElementById('toastContainer');
    }

    bindEvents() {
      // Navigation switches
      this.navItems.forEach(item => {
        item.addEventListener('click', () => {
          const view = item.dataset.view;
          this.switchView(view);
          sfx.click();
          if (window.innerWidth < 1024) {
            this.sidebar.classList.remove('mobile-open');
          }
        });
      });

      // Mobile Menu
      this.btnMobileMenu.addEventListener('click', () => {
        this.sidebar.classList.toggle('mobile-open');
        sfx.click();
      });

      // Audio Toggle
      this.btnToggleAudio.addEventListener('click', () => {
        sfx.enabled = !sfx.enabled;
        this.audioIcon.textContent = sfx.enabled ? '🔊' : '🔇';
        this.btnToggleAudio.querySelector('.tool-text').textContent = sfx.enabled ? 'Sound: ON' : 'Sound: OFF';
        this.showToast(sfx.enabled ? 'Sound effects enabled' : 'Sound effects muted', 'info');
        if (sfx.enabled) sfx.click();
      });

      // Theme Toggle
      this.btnToggleTheme.addEventListener('click', () => {
        this.toggleTheme();
      });

      // Search & Filters
      this.globalSearchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderCurrentView();
      });

      this.filterTypeSelect.addEventListener('change', (e) => {
        this.selectedTypeFilter = e.target.value;
        this.renderCurrentView();
      });

      this.filterPrioritySelect.addEventListener('change', (e) => {
        this.selectedPriorityFilter = e.target.value;
        this.renderCurrentView();
      });

      this.sortTasksSelect.addEventListener('change', (e) => {
        this.selectedSort = e.target.value;
        this.renderCurrentView();
      });

      // Quick inline task creation
      this.btnQuickSubmit.addEventListener('click', () => this.handleQuickAdd());
      this.quickTaskInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.handleQuickAdd();
        }
      });

      // Modals
      this.btnOpenNewTaskModal.addEventListener('click', () => {
        this.openTaskModal();
      });
      this.btnEmptyAdd.addEventListener('click', () => {
        this.openTaskModal();
      });
      this.btnCloseTaskModal.addEventListener('click', () => this.closeTaskModal());
      this.btnCancelTaskModal.addEventListener('click', () => this.closeTaskModal());

      this.taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleTaskFormSubmit();
      });

      this.btnAddSubtaskRow.addEventListener('click', () => {
        this.addSubtaskRow();
      });

      // Course Management Modal
      this.btnManageCourses.addEventListener('click', () => this.openCoursesModal());
      this.btnCloseCoursesModal.addEventListener('click', () => this.closeCoursesModal());
      this.btnDoneCoursesModal.addEventListener('click', () => this.closeCoursesModal());
      this.courseAddForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleCourseAddSubmit();
      });

      // Accordion for completed tasks
      this.btnToggleCompletedGroup.addEventListener('click', () => {
        const isHidden = this.cardsCompleted.style.display === 'none';
        this.cardsCompleted.style.display = isHidden ? 'flex' : 'none';
        this.btnToggleCompletedGroup.querySelector('.icon-chevron').style.transform = isHidden ? 'rotate(180deg)' : 'none';
      });

      // Dropdown Sync menu
      this.btnDataActions.addEventListener('click', (e) => {
        e.stopPropagation();
        this.dataActionsMenu.classList.toggle('show');
      });

      document.addEventListener('click', () => {
        this.dataActionsMenu.classList.remove('show');
      });

      // Sync menu options
      this.btnExportICal.addEventListener('click', () => this.exportICalendar());
      this.btnExportJSON.addEventListener('click', () => this.exportJSON());
      this.inputImportJSON.addEventListener('change', (e) => this.importJSON(e));
      this.btnSeedDemoData.addEventListener('click', () => {
        if (confirm('Load realistic semester demo data? (This will add fresh sample courses and assignments)')) {
          store.resetDefaults();
          this.render();
          this.showToast('Semester demo data loaded!', 'success');
          sfx.complete();
        }
      });
      this.btnClearAllData.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all assignments and courses?')) {
          store.clearAll();
          this.render();
          this.showToast('All coursework data wiped', 'warning');
          sfx.delete();
        }
      });
      this.btnPrintPlanner.addEventListener('click', () => {
        window.print();
      });

      // Calendar nav
      this.btnCalPrevMonth.addEventListener('click', () => {
        this.currentCalDate.setMonth(this.currentCalDate.getMonth() - 1);
        this.renderCalendarView();
      });
      this.btnCalNextMonth.addEventListener('click', () => {
        this.currentCalDate.setMonth(this.currentCalDate.getMonth() + 1);
        this.renderCalendarView();
      });
      this.btnCalToday.addEventListener('click', () => {
        this.currentCalDate = new Date();
        this.renderCalendarView();
      });
      this.btnCloseInspector.addEventListener('click', () => {
        this.calDayInspector.style.display = 'none';
      });

      // Pomodoro Controls
      document.querySelectorAll('.timer-mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.timer-mode-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.setTimerMode(btn.dataset.mode);
        });
      });

      this.btnTimerToggle.addEventListener('click', () => this.togglePomodoroTimer());
      this.btnTimerReset.addEventListener('click', () => this.resetPomodoroTimer());
      this.btnTimerSkip.addEventListener('click', () => this.skipPomodoroTimer());
      this.timerTaskSelect.addEventListener('change', (e) => {
        this.timerTargetTaskId = e.target.value;
        const task = store.getTask(this.timerTargetTaskId);
        this.timerSelectedTaskDisplay.textContent = task ? `Focus: ${task.title}` : 'No assignment linked';
      });

      // Keyboard Shortcuts
      window.addEventListener('keydown', (e) => {
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
          if (e.key === 'Escape') {
            document.activeElement.blur();
            this.closeTaskModal();
            this.closeCoursesModal();
          }
          return;
        }

        if (e.key === 'n' || e.key === 'N') {
          e.preventDefault();
          this.openTaskModal();
        } else if (e.key === '/') {
          e.preventDefault();
          this.globalSearchInput.focus();
        } else if (e.key === '1') {
          this.switchView('list');
        } else if (e.key === '2') {
          this.switchView('kanban');
        } else if (e.key === '3') {
          this.switchView('calendar');
        } else if (e.key === '4') {
          this.switchView('matrix');
        } else if (e.key === '5') {
          this.switchView('focus');
        } else if (e.key === '6') {
          this.switchView('analytics');
        } else if (e.key === '7' || e.key === 'd' || e.key === 'D') {
          this.switchView('devbot');
        } else if (e.key === 'Escape') {
          this.closeTaskModal();
          this.closeCoursesModal();
          this.dataActionsMenu.classList.remove('show');
        }
      });

      // AI Settings Save
      const btnSaveAiConfig = document.getElementById('btnSaveAiConfig');
      if (btnSaveAiConfig) {
        btnSaveAiConfig.addEventListener('click', () => {
          const backendUrl = document.getElementById('devbotBackendUrlInput')?.value || 'http://localhost:5000';
          const apiKey = document.getElementById('devbotApiKeyInput')?.value || '';
          if (window.devBotApp) {
            window.devBotApp.saveSettings(backendUrl, apiKey);
            this.showToast('DevBot AI settings saved!', 'success');
          }
        });
      }

      // Setup Kanban Drag and Drop listeners
      this.setupKanbanDnd();
    }

    // --- Theme Controller ---
    initTheme() {
      const savedTheme = localStorage.getItem('scholarflow_theme') || 'theme-dark';
      document.body.className = savedTheme;
      this.updateThemeIcon();
    }

    toggleTheme() {
      const isDark = document.body.classList.contains('theme-dark');
      const nextTheme = isDark ? 'theme-light' : 'theme-dark';
      document.body.className = nextTheme;
      localStorage.setItem('scholarflow_theme', nextTheme);
      this.updateThemeIcon();
      sfx.click();
    }

    updateThemeIcon() {
      const isDark = document.body.classList.contains('theme-dark');
      this.themeIcon.textContent = isDark ? '🌙' : '☀️';
      this.btnToggleTheme.querySelector('.tool-text').textContent = isDark ? 'Dark Mode' : 'Light Mode';
    }

    // --- View Navigation ---
    switchView(viewName) {
      this.currentView = viewName;
      this.navItems.forEach(item => {
        item.classList.toggle('active', item.dataset.view === viewName);
      });

      Object.keys(this.viewPanels).forEach(key => {
        this.viewPanels[key].classList.toggle('active', key === viewName);
      });

      const titles = {
        list: { title: 'Academic Assignments Feed', sub: 'Chronological roadmap of problem sets, projects, and deadlines' },
        kanban: { title: 'Workflow Board', sub: 'Interactive Kanban pipeline from backlog to submission' },
        calendar: { title: 'Semester Deadline Calendar', sub: 'Monthly overview of critical exams and deliverables' },
        matrix: { title: 'Eisenhower Priority Matrix', sub: 'Cognitive load prioritization: Do First vs Schedule vs Fast Wins' },
        focus: { title: 'Pomodoro Study Station', sub: 'High-intensity interval focus blocks with zero distractions' },
        analytics: { title: 'Workload & Academic Insights', sub: 'Semester health forecast, estimated study hours, and pacing metrics' },
        devbot: { title: 'DevBot AI Mentor & Task Assistant', sub: 'Powered by Google Gemini: Deconstruct assignments, generate study plans & debug code' }
      };

      const meta = titles[viewName] || titles.list;
      this.viewTitle.textContent = meta.title;
      this.viewSubtitle.textContent = meta.sub;

      this.renderCurrentView();
    }

    // --- Course Filters & Sidebar Rendering ---
    renderCourses() {
      // Sidebar course links
      this.sidebarCourseList.innerHTML = '';
      store.courses.forEach(c => {
        const count = store.tasks.filter(t => t.courseId === c.id && t.status !== 'completed').length;
        const btn = document.createElement('button');
        btn.className = `course-nav-link ${this.selectedCourseFilter === c.id ? 'active' : ''}`;
        btn.innerHTML = `
          <span class="course-dot" style="background-color: ${c.color}"></span>
          <span class="course-name-truncate">${c.code} · ${c.name}</span>
          <span class="course-count-badge">${count}</span>
        `;
        btn.addEventListener('click', () => {
          this.setCourseFilter(this.selectedCourseFilter === c.id ? 'all' : c.id);
          sfx.click();
        });
        this.sidebarCourseList.appendChild(btn);
      });

      // Filter chips in the top bar
      this.filterCourseChips.innerHTML = `
        <button class="chip ${this.selectedCourseFilter === 'all' ? 'active' : ''}" data-filter-course="all">
          <span class="chip-dot all"></span>
          All Courses
        </button>
      `;

      store.courses.forEach(c => {
        const count = store.tasks.filter(t => t.courseId === c.id && t.status !== 'completed').length;
        const chip = document.createElement('button');
        chip.className = `chip ${this.selectedCourseFilter === c.id ? 'active' : ''}`;
        chip.dataset.filterCourse = c.id;
        chip.innerHTML = `
          <span class="chip-dot" style="background-color: ${c.color}"></span>
          ${c.code} (${count})
        `;
        chip.addEventListener('click', () => {
          this.setCourseFilter(c.id);
          sfx.click();
        });
        this.filterCourseChips.appendChild(chip);
      });

      // Bind All Courses chip
      this.filterCourseChips.querySelector('[data-filter-course="all"]').addEventListener('click', () => {
        this.setCourseFilter('all');
        sfx.click();
      });

      // Update Form Course Select & Quick Add Select
      const courseOptionsHTML = store.courses.map(c => `<option value="${c.id}">${c.code} - ${c.name}</option>`).join('');
      this.formCourse.innerHTML = courseOptionsHTML;
      this.quickCourseSelect.innerHTML = courseOptionsHTML;
      this.timerTaskSelect.innerHTML = '<option value="">-- Choose an assignment to work on --</option>' +
        store.tasks.filter(t => t.status !== 'completed').map(t => {
          const c = store.getCourse(t.courseId);
          return `<option value="${t.id}">[${c.code}] ${t.title}</option>`;
        }).join('');
    }

    setCourseFilter(courseId) {
      this.selectedCourseFilter = courseId;
      this.renderCourses();
      this.renderCurrentView();
    }

    // --- Task Filtering & Sorting Engine ---
    getFilteredTasks() {
      return store.tasks.filter(task => {
        // Course filter
        if (this.selectedCourseFilter !== 'all' && task.courseId !== this.selectedCourseFilter) {
          return false;
        }

        // Type filter
        if (this.selectedTypeFilter !== 'all' && task.type !== this.selectedTypeFilter) {
          return false;
        }

        // Priority filter
        if (this.selectedPriorityFilter !== 'all' && task.priority !== this.selectedPriorityFilter) {
          return false;
        }

        // Search query
        if (this.searchQuery) {
          const c = store.getCourse(task.courseId);
          const fullSearch = `${task.title} ${c.code} ${c.name} ${task.notes || ''}`.toLowerCase();
          if (!fullSearch.includes(this.searchQuery)) {
            return false;
          }
        }

        return true;
      }).sort((a, b) => {
        if (this.selectedSort === 'deadline_asc') {
          return new Date(a.dueDate) - new Date(b.dueDate);
        }
        if (this.selectedSort === 'deadline_desc') {
          return new Date(b.dueDate) - new Date(a.dueDate);
        }
        if (this.selectedSort === 'priority_desc') {
          const pOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          return (pOrder[b.priority] || 0) - (pOrder[a.priority] || 0);
        }
        if (this.selectedSort === 'weight_desc') {
          return (b.weight || 0) - (a.weight || 0);
        }
        if (this.selectedSort === 'title_asc') {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
    }

    // --- Main Render Dispatcher ---
    render() {
      this.renderCourses();
      this.renderSummaryCounters();
      this.renderCurrentView();
    }

    renderCurrentView() {
      if (this.currentView === 'list') this.renderListView();
      else if (this.currentView === 'kanban') this.renderKanbanView();
      else if (this.currentView === 'calendar') this.renderCalendarView();
      else if (this.currentView === 'matrix') this.renderMatrixView();
      else if (this.currentView === 'focus') this.renderFocusView();
      else if (this.currentView === 'analytics') this.renderAnalyticsView();
    }

    renderSummaryCounters() {
      const now = new Date();
      let urgentCount = 0;
      let activeCount = 0;

      store.tasks.forEach(t => {
        if (t.status !== 'completed') {
          activeCount++;
          const due = new Date(t.dueDate);
          const diffHours = (due - now) / (1000 * 60 * 60);
          if (diffHours < 24) urgentCount++;
        }
      });

      this.listBadgeCount.textContent = activeCount;
      this.urgentCountText.textContent = `${urgentCount} Urgent`;
      this.urgentSummaryPill.style.display = urgentCount > 0 ? 'flex' : 'none';

      // Streak & study progress
      this.streakDaysCount.textContent = store.pomoStats.streak || 5;
      this.pomoCountCompleted.textContent = store.pomoStats.completedBlocks || 0;
      this.pomoTotalMinutes.textContent = `${store.pomoStats.totalMinutes || 0}m`;
    }

    // --- Card DOM Generator ---
    createTaskCardElement(task, options = { draggable: false }) {
      const course = store.getCourse(task.courseId);
      const deadline = getDeadlineInfo(task.dueDate);
      const isCompleted = task.status === 'completed';

      const card = document.createElement('div');
      card.className = `task-card ${isCompleted ? 'is-completed' : ''} ${options.draggable ? 'kanban-card' : ''}`;
      card.style.setProperty('--card-course-color', course.color);
      card.dataset.taskId = task.id;

      if (options.draggable) {
        card.setAttribute('draggable', 'true');
      }

      // Subtasks calculation
      const totalSubtasks = task.subtasks ? task.subtasks.length : 0;
      const completedSubtasks = task.subtasks ? task.subtasks.filter(s => s.completed).length : 0;
      const subtaskPct = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

      card.innerHTML = `
        <button class="task-check-btn" title="${isCompleted ? 'Mark incomplete' : 'Mark completed'}" aria-label="Toggle completed">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="width:13px;height:13px;"><polyline points="20 6 9 17 4 12"/></svg>
        </button>

        <div class="task-card-content">
          <div class="task-header-row">
            <span class="course-badge" style="background-color: ${course.color}">${course.code}</span>
            <span class="type-pill">${task.type}</span>
            <span class="priority-badge priority-${task.priority}">
              ${task.priority === 'urgent' ? '🔴 Urgent' : task.priority === 'high' ? '🟠 High' : task.priority === 'medium' ? '🔵 Med' : '⚪ Low'}
            </span>
            ${task.weight ? `<span class="weight-pill">${task.weight}% Grade</span>` : ''}
            ${task.estimatedMinutes ? `<span class="text-muted text-sm">⏱️ ${task.estimatedMinutes}m</span>` : ''}
          </div>

          <div class="task-title-text">${task.title}</div>
          ${task.notes ? `<div class="task-notes-preview">${task.notes}</div>` : ''}

          ${totalSubtasks > 0 ? `
            <div class="card-subtasks-block">
              <div class="subtasks-progress-header">
                <span>Checklist (${completedSubtasks}/${totalSubtasks})</span>
                <span>${subtaskPct}%</span>
              </div>
              <div class="subtasks-mini-progress">
                <div class="subtasks-mini-fill" style="width: ${subtaskPct}%;"></div>
              </div>
              <div class="subtasks-mini-items">
                ${task.subtasks.map((sub, sIdx) => `
                  <label class="subtask-mini-item ${sub.completed ? 'done' : ''}">
                    <input type="checkbox" data-subtask-index="${sIdx}" ${sub.completed ? 'checked' : ''}>
                    <span>${sub.text}</span>
                  </label>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <div class="task-footer-row">
            <div class="task-deadline-badge ${deadline.statusClass}">
              <span>📅</span>
              <span>${deadline.text}</span>
            </div>

            <div class="task-actions-row">
              <button class="btn-card-action btn-pomo-link" title="Focus on this assignment with Pomodoro">
                <span>⏱️ Focus</span>
              </button>
              <button class="btn-card-action btn-card-edit" title="Edit Assignment">
                <span>✏️</span>
              </button>
              <button class="btn-card-action btn-card-delete" title="Delete Assignment">
                <span>🗑️</span>
              </button>
            </div>
          </div>
        </div>
      `;

      // Event: Checkbox toggle completed
      const checkBtn = card.querySelector('.task-check-btn');
      checkBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleTaskCompleted(task.id);
      });

      // Event: Subtask interactive checkboxes
      card.querySelectorAll('.subtask-mini-item input[type="checkbox"]').forEach(input => {
        input.addEventListener('change', (e) => {
          e.stopPropagation();
          const sIdx = parseInt(e.target.dataset.subtaskIndex, 10);
          this.toggleSubtaskCompleted(task.id, sIdx, e.target.checked);
        });
      });

      // Event: Focus timer button
      const pomoBtn = card.querySelector('.btn-pomo-link');
      pomoBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.linkAndLaunchFocusTimer(task.id);
      });

      // Event: Edit button
      const editBtn = card.querySelector('.btn-card-edit');
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openTaskModal(task.id);
      });

      // Event: Delete button
      const deleteBtn = card.querySelector('.btn-card-delete');
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm(`Delete assignment "${task.title}"?`)) {
          store.deleteTask(task.id);
          this.render();
          this.showToast('Assignment deleted', 'info');
          sfx.delete();
        }
      });

      return card;
    }

    // --- Task State Mutations ---
    toggleTaskCompleted(taskId) {
      const task = store.getTask(taskId);
      if (!task) return;
      const nextStatus = task.status === 'completed' ? 'todo' : 'completed';
      const completedAt = nextStatus === 'completed' ? new Date().toISOString() : null;
      store.updateTask(taskId, { status: nextStatus, completedAt });
      this.render();

      if (nextStatus === 'completed') {
        sfx.complete();
        this.showToast(`Completed: ${task.title}! 🔥`, 'success');
      } else {
        sfx.click();
      }
    }

    toggleSubtaskCompleted(taskId, subtaskIdx, isDone) {
      const task = store.getTask(taskId);
      if (!task || !task.subtasks || !task.subtasks[subtaskIdx]) return;
      task.subtasks[subtaskIdx].completed = isDone;
      store.updateTask(taskId, { subtasks: task.subtasks });
      this.render();
      sfx.click();
    }

    linkAndLaunchFocusTimer(taskId) {
      const task = store.getTask(taskId);
      if (!task) return;
      this.timerTargetTaskId = taskId;
      this.timerTaskSelect.value = taskId;
      this.timerSelectedTaskDisplay.textContent = `Focus: ${task.title}`;
      this.switchView('focus');
      sfx.click();
      this.showToast(`Linked "${task.title}" to Focus Timer`, 'info');
    }

    // --- VIEW 1: Smart Feed / List View ---
    renderListView() {
      const filtered = this.getFilteredTasks();

      // Clear containers
      this.cardsOverdue.innerHTML = '';
      this.cardsToday.innerHTML = '';
      this.cardsTomorrow.innerHTML = '';
      this.cardsUpcoming.innerHTML = '';
      this.cardsCompleted.innerHTML = '';

      if (filtered.length === 0) {
        this.listEmptyState.style.display = 'block';
        this.groupOverdue.style.display = 'none';
        this.groupToday.style.display = 'none';
        this.groupTomorrow.style.display = 'none';
        this.groupUpcoming.style.display = 'none';
        this.groupCompleted.style.display = 'none';
        return;
      }
      this.listEmptyState.style.display = 'none';

      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const tomorrow = new Date();
      tomorrow.setDate(now.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      let countO = 0, countTd = 0, countTm = 0, countUp = 0, countCp = 0;

      filtered.forEach(task => {
        const card = this.createTaskCardElement(task);
        if (task.status === 'completed') {
          this.cardsCompleted.appendChild(card);
          countCp++;
          return;
        }

        const due = new Date(task.dueDate);
        const taskDateStr = task.dueDate.split('T')[0];

        if (due < now && taskDateStr !== todayStr) {
          this.cardsOverdue.appendChild(card);
          countO++;
        } else if (taskDateStr === todayStr) {
          this.cardsToday.appendChild(card);
          countTd++;
        } else if (taskDateStr === tomorrowStr) {
          this.cardsTomorrow.appendChild(card);
          countTm++;
        } else {
          this.cardsUpcoming.appendChild(card);
          countUp++;
        }
      });

      this.groupOverdue.style.display = countO > 0 ? 'flex' : 'none';
      this.countOverdue.textContent = countO;

      this.groupToday.style.display = countTd > 0 ? 'flex' : 'none';
      this.countToday.textContent = countTd;

      this.groupTomorrow.style.display = countTm > 0 ? 'flex' : 'none';
      this.countTomorrow.textContent = countTm;

      this.groupUpcoming.style.display = countUp > 0 ? 'flex' : 'none';
      this.countUpcoming.textContent = countUp;

      this.groupCompleted.style.display = countCp > 0 ? 'flex' : 'none';
      this.countCompleted.textContent = countCp;
    }

    // --- VIEW 2: Kanban Board ---
    setupKanbanDnd() {
      const dropZones = document.querySelectorAll('.drop-zone');
      dropZones.forEach(zone => {
        zone.addEventListener('dragover', (e) => {
          e.preventDefault();
          zone.classList.add('drag-over');
        });
        zone.addEventListener('dragleave', () => {
          zone.classList.remove('drag-over');
        });
        zone.addEventListener('drop', (e) => {
          e.preventDefault();
          zone.classList.remove('drag-over');
          const taskId = e.dataTransfer.getData('text/plain');
          const targetStatus = zone.dataset.dropStatus;
          if (taskId && targetStatus) {
            const task = store.getTask(taskId);
            if (task && task.status !== targetStatus) {
              const completedAt = targetStatus === 'completed' ? new Date().toISOString() : null;
              store.updateTask(taskId, { status: targetStatus, completedAt });
              this.render();
              if (targetStatus === 'completed') {
                sfx.complete();
                this.showToast(`Task "${task.title}" submitted and marked done! 🎉`, 'success');
              } else {
                sfx.click();
              }
            }
          }
        });
      });
    }

    renderKanbanView() {
      const filtered = this.getFilteredTasks();
      const colCards = {
        todo: document.getElementById('kanbanCardsTodo'),
        in_progress: document.getElementById('kanbanCardsInProgress'),
        review: document.getElementById('kanbanCardsReview'),
        completed: document.getElementById('kanbanCardsCompleted')
      };

      const counts = { todo: 0, in_progress: 0, review: 0, completed: 0 };

      Object.values(colCards).forEach(el => el.innerHTML = '');

      filtered.forEach(task => {
        const col = colCards[task.status] || colCards.todo;
        const card = this.createTaskCardElement(task, { draggable: true });

        card.addEventListener('dragstart', (e) => {
          card.classList.add('dragging');
          e.dataTransfer.setData('text/plain', task.id);
          sfx.click();
        });

        card.addEventListener('dragend', () => {
          card.classList.remove('dragging');
        });

        col.appendChild(card);
        counts[task.status] = (counts[task.status] || 0) + 1;
      });

      document.getElementById('kanbanBadgeTodo').textContent = counts.todo;
      document.getElementById('kanbanBadgeInProgress').textContent = counts.in_progress;
      document.getElementById('kanbanBadgeReview').textContent = counts.review;
      document.getElementById('kanbanBadgeCompleted').textContent = counts.completed;
    }

    // --- VIEW 3: Interactive Academic Calendar ---
    renderCalendarView() {
      const year = this.currentCalDate.getFullYear();
      const month = this.currentCalDate.getMonth();
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      this.calMonthTitle.textContent = `${monthNames[month]} ${year}`;

      const firstDay = new Date(year, month, 1).getDay();
      const totalDays = new Date(year, month + 1, 0).getDate();
      const prevMonthDays = new Date(year, month, 0).getDate();

      this.calDaysGrid.innerHTML = '';
      const today = new Date();

      // Group tasks by date string (YYYY-MM-DD)
      const tasksByDate = {};
      store.tasks.forEach(task => {
        const dStr = task.dueDate.split('T')[0];
        if (!tasksByDate[dStr]) tasksByDate[dStr] = [];
        tasksByDate[dStr].push(task);
      });

      // Previous month padding cells
      for (let i = firstDay - 1; i >= 0; i--) {
        const dayNum = prevMonthDays - i;
        const cell = document.createElement('div');
        cell.className = 'cal-day-cell other-month';
        cell.innerHTML = `<div class="cal-day-header"><span class="cal-day-number">${dayNum}</span></div>`;
        this.calDaysGrid.appendChild(cell);
      }

      // Current month cells
      for (let day = 1; day <= totalDays; day++) {
        const cell = document.createElement('div');
        const mStr = String(month + 1).padStart(2, '0');
        const dStr = String(day).padStart(2, '0');
        const currentIsoDate = `${year}-${mStr}-${dStr}`;

        const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
        cell.className = `cal-day-cell ${isToday ? 'is-today' : ''}`;

        const dayTasks = tasksByDate[currentIsoDate] || [];

        cell.innerHTML = `
          <div class="cal-day-header">
            <span class="cal-day-number">${day}</span>
            ${dayTasks.length > 0 ? `<span class="col-badge">${dayTasks.length}</span>` : ''}
          </div>
          <div class="cal-day-tasks">
            ${dayTasks.slice(0, 3).map(t => {
              const c = store.getCourse(t.courseId);
              return `
                <div class="cal-task-pill ${t.type === 'exam' ? 'is-exam' : ''} ${t.status === 'completed' ? 'is-done' : ''}" style="background-color: ${c.color}22; border-left-color: ${c.color};" title="${t.title}">
                  <span>${t.type === 'exam' ? '🎯' : '•'}</span>
                  <span>${t.title}</span>
                </div>
              `;
            }).join('')}
            ${dayTasks.length > 3 ? `<span class="cal-more-badge">+${dayTasks.length - 3} more</span>` : ''}
          </div>
        `;

        cell.addEventListener('click', () => {
          this.inspectCalendarDay(currentIsoDate, dayTasks);
          sfx.click();
        });

        this.calDaysGrid.appendChild(cell);
      }
    }

    inspectCalendarDay(dateStr, dayTasks) {
      this.calDayInspector.style.display = 'block';
      const d = new Date(dateStr + 'T12:00:00');
      this.inspectorDateTitle.textContent = `Deadlines on ${d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}`;
      this.inspectorTaskList.innerHTML = '';

      if (dayTasks.length === 0) {
        this.inspectorTaskList.innerHTML = `
          <div class="text-secondary text-sm" style="padding: 0.5rem 0;">
            No assignments due on this date.
            <button class="btn btn-secondary btn-sm" id="btnQuickAddCalDay" style="margin-left: 0.5rem;">+ Add Assignment Due Here</button>
          </div>
        `;
        document.getElementById('btnQuickAddCalDay').addEventListener('click', () => {
          this.openTaskModal(null, dateStr);
        });
        return;
      }

      dayTasks.forEach(task => {
        const card = this.createTaskCardElement(task);
        this.inspectorTaskList.appendChild(card);
      });
    }

    // --- VIEW 4: Eisenhower Priority Matrix ---
    renderMatrixView() {
      const filtered = this.getFilteredTasks().filter(t => t.status !== 'completed');
      const q1El = document.getElementById('matrixListQ1');
      const q2El = document.getElementById('matrixListQ2');
      const q3El = document.getElementById('matrixListQ3');
      const q4El = document.getElementById('matrixListQ4');

      q1El.innerHTML = '';
      q2El.innerHTML = '';
      q3El.innerHTML = '';
      q4El.innerHTML = '';

      let c1 = 0, c2 = 0, c3 = 0, c4 = 0;

      filtered.forEach(task => {
        const card = this.createTaskCardElement(task);
        if (task.priority === 'urgent') {
          q1El.appendChild(card);
          c1++;
        } else if (task.priority === 'high') {
          q2El.appendChild(card);
          c2++;
        } else if (task.priority === 'medium') {
          q3El.appendChild(card);
          c3++;
        } else {
          q4El.appendChild(card);
          c4++;
        }
      });

      document.getElementById('matrixBadgeQ1').textContent = c1;
      document.getElementById('matrixBadgeQ2').textContent = c2;
      document.getElementById('matrixBadgeQ3').textContent = c3;
      document.getElementById('matrixBadgeQ4').textContent = c4;
    }

    // --- VIEW 5: Pomodoro Study Station ---
    setTimerMode(mode) {
      this.timerMode = mode;
      this.timerRemaining = this.timerDurations[mode];
      this.stopTimer();
      const labels = {
        pomodoro: 'DEEP STUDY FOCUS',
        shortBreak: 'SHORT RECOVERY BREAK',
        longBreak: 'LONG RECHARGE BREAK'
      };
      this.timerSessionLabel.textContent = labels[mode] || 'FOCUS SESSION';
      this.updateTimerDisplay();
      sfx.click();
    }

    togglePomodoroTimer() {
      if (this.timerIsRunning) {
        this.stopTimer();
      } else {
        this.startTimer();
      }
    }

    startTimer() {
      this.timerIsRunning = true;
      this.timerPlayIcon.textContent = '⏸';
      this.timerPlayText.textContent = 'Pause Session';
      this.pomodoroActiveDot.style.display = 'inline-block';
      sfx.click();

      this.timerInterval = setInterval(() => {
        this.timerRemaining--;
        this.updateTimerDisplay();

        if (this.timerRemaining <= 0) {
          this.timerCompleted();
        }
      }, 1000);
    }

    stopTimer() {
      this.timerIsRunning = false;
      this.timerPlayIcon.textContent = '▶';
      this.timerPlayText.textContent = 'Start Focus Session';
      this.pomodoroActiveDot.style.display = 'none';
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
    }

    resetPomodoroTimer() {
      this.stopTimer();
      this.timerRemaining = this.timerDurations[this.timerMode];
      this.updateTimerDisplay();
      sfx.click();
    }

    skipPomodoroTimer() {
      this.stopTimer();
      if (this.timerMode === 'pomodoro') {
        this.setTimerMode('shortBreak');
      } else {
        this.setTimerMode('pomodoro');
      }
      this.startTimer();
    }

    timerCompleted() {
      this.stopTimer();
      sfx.timerDone();

      if (this.timerMode === 'pomodoro') {
        store.pomoStats.completedBlocks = (store.pomoStats.completedBlocks || 0) + 1;
        store.pomoStats.totalMinutes = (store.pomoStats.totalMinutes || 0) + 25;
        store.save();
        this.showToast('Focus session complete! Take a well-deserved break! 🎉', 'success');
        this.setTimerMode('shortBreak');
      } else {
        this.showToast('Break finished! Ready for next study block?', 'info');
        this.setTimerMode('pomodoro');
      }
      this.renderSummaryCounters();
    }

    updateTimerDisplay() {
      const minutes = Math.floor(this.timerRemaining / 60);
      const seconds = this.timerRemaining % 60;
      this.timerDigits.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

      // SVG Circle Progress (Circumference = 2 * PI * 120 = 753.98)
      const total = this.timerDurations[this.timerMode];
      const progress = (total - this.timerRemaining) / total;
      const circumference = 753.98;
      const offset = circumference * (1 - progress);
      this.timerProgressCircle.style.strokeDashoffset = offset;
    }

    renderFocusView() {
      this.updateTimerDisplay();
      const task = store.getTask(this.timerTargetTaskId);
      this.timerSelectedTaskDisplay.textContent = task ? `Focus: ${task.title}` : 'No assignment linked';
    }

    // --- VIEW 6: Workload & Analytics ---
    renderAnalyticsView() {
      const pendingTasks = store.tasks.filter(t => t.status !== 'completed');
      const completedTasks = store.tasks.filter(t => t.status === 'completed');
      const totalTasks = store.tasks.length;
      const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

      const totalEstimatedMinutes = pendingTasks.reduce((sum, t) => sum + (Number(t.estimatedMinutes) || 60), 0);
      const totalEstimatedHours = (totalEstimatedMinutes / 60).toFixed(1);

      const examsUpcoming = pendingTasks.filter(t => t.type === 'exam').length;

      document.getElementById('statTotalPending').textContent = pendingTasks.length;
      document.getElementById('statTotalCompleted').textContent = completedTasks.length;
      document.getElementById('statCompletionRatePill').textContent = `${completionRate}% Done`;
      document.getElementById('statEstimatedHours').textContent = `${totalEstimatedHours}h`;
      document.getElementById('statUpcomingExamsCount').textContent = examsUpcoming;

      // 7-Day Workload Bar Chart (Pure SVG)
      this.renderWorkloadChart(pendingTasks);

      // Course Workload Distribution
      this.renderCourseDistribution(pendingTasks);

      // Personalized Study Advice
      const adviceTitle = document.getElementById('adviceTitle');
      const adviceText = document.getElementById('adviceText');

      if (examsUpcoming > 0) {
        adviceTitle.textContent = 'High-Stakes Preparation Window';
        adviceText.textContent = `You have ${examsUpcoming} upcoming exam(s) or quizzes. Allocate 60-90 minute Pomodoro review sessions 48 hours prior to the test to leverage active recall.`;
      } else if (Number(totalEstimatedHours) > 8) {
        adviceTitle.textContent = 'Heavy Workload Ahead';
        adviceText.textContent = `You have roughly ${totalEstimatedHours} hours of coursework pending this week. Break down large problem sets into subtask checkpoints and knock out quick assignments first.`;
      } else {
        adviceTitle.textContent = 'Balanced Semester Pace';
        adviceText.textContent = `Your workload is currently well-balanced. Keep maintaining your 5-day study streak and get an early head-start on upcoming term projects!`;
      }
    }

    renderWorkloadChart(pendingTasks) {
      const container = document.getElementById('workloadChartContainer');
      const days = [];
      const now = new Date();

      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(now.getDate() + i);
        const iso = d.toISOString().split('T')[0];
        const dayLabel = i === 0 ? 'Today' : i === 1 ? 'Tmrw' : d.toLocaleDateString(undefined, { weekday: 'short' });
        const count = pendingTasks.filter(t => t.dueDate.split('T')[0] === iso).length;
        days.push({ label: dayLabel, count });
      }

      const maxCount = Math.max(...days.map(d => d.count), 4);
      const chartWidth = 480;
      const chartHeight = 160;
      const barWidth = 36;
      const barGap = 32;

      let svg = `
        <svg viewBox="0 0 ${chartWidth} ${chartHeight}" style="width:100%; height:auto;">
          <!-- Grid lines -->
          <line x1="20" y1="30" x2="${chartWidth - 20}" y2="30" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3"/>
          <line x1="20" y1="80" x2="${chartWidth - 20}" y2="80" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3"/>
          <line x1="20" y1="130" x2="${chartWidth - 20}" y2="130" stroke="rgba(255,255,255,0.12)"/>
      `;

      days.forEach((day, idx) => {
        const x = 35 + idx * (barWidth + barGap);
        const barHeight = (day.count / maxCount) * 95;
        const y = 130 - barHeight;
        const isHighlight = day.count > 0;

        svg += `
          <g class="chart-bar-group">
            <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="4"
              fill="${isHighlight ? 'url(#barGradient)' : 'rgba(255,255,255,0.08)'}" />
            <text x="${x + barWidth / 2}" y="${y - 6}" font-size="11" font-weight="600" fill="${isHighlight ? '#fff' : '#64748b'}" text-anchor="middle">${day.count}</text>
            <text x="${x + barWidth / 2}" y="148" font-size="11" fill="#94a3b8" text-anchor="middle">${day.label}</text>
          </g>
        `;
      });

      svg += `
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#6366f1"/>
              <stop offset="100%" stop-color="#06b6d4"/>
            </linearGradient>
          </defs>
        </svg>
      `;

      container.innerHTML = svg;
    }

    renderCourseDistribution(pendingTasks) {
      const container = document.getElementById('courseDistributionContainer');
      const countsByCourse = {};
      pendingTasks.forEach(t => {
        countsByCourse[t.courseId] = (countsByCourse[t.courseId] || 0) + 1;
      });

      const total = pendingTasks.length || 1;
      container.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:0.75rem; width:100%;">
          ${store.courses.map(c => {
            const count = countsByCourse[c.id] || 0;
            const pct = Math.round((count / total) * 100);
            return `
              <div>
                <div style="display:flex; justify-content:space-between; font-size:0.78rem; margin-bottom:0.25rem;">
                  <span style="font-weight:600; display:flex; align-items:center; gap:0.4rem;">
                    <span style="width:8px; height:8px; border-radius:50%; background:${c.color};"></span>
                    ${c.code}
                  </span>
                  <span style="color:#94a3b8;">${count} tasks (${pct}%)</span>
                </div>
                <div style="width:100%; height:6px; background:rgba(255,255,255,0.08); border-radius:999px; overflow:hidden;">
                  <div style="width:${pct}%; height:100%; background:${c.color}; border-radius:inherit; transition: width 0.4s ease;"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    // --- Quick Inline Add Handler ---
    handleQuickAdd() {
      const title = this.quickTaskInput.value.trim();
      if (!title) return;

      const courseId = this.quickCourseSelect.value || (store.courses[0] && store.courses[0].id);
      const priority = this.quickPrioritySelect.value || 'medium';
      const dateVal = this.quickDueDate.value || formatDateISO(new Date().toISOString());
      const dueDate = `${dateVal}T23:59:00`;

      const newTask = {
        id: 'task_' + Date.now(),
        title,
        courseId,
        type: 'assignment',
        dueDate,
        priority,
        status: 'todo',
        estimatedMinutes: 60,
        weight: null,
        notes: '',
        subtasks: [],
        completedAt: null
      };

      store.addTask(newTask);
      this.quickTaskInput.value = '';
      this.render();
      sfx.click();
      this.showToast(`Recorded: "${title}"`, 'success');
    }

    // --- Modal Add / Edit Controller ---
    openTaskModal(taskId = null, presetDateStr = null) {
      this.activeEditingTaskId = taskId;
      this.formSubtasksContainer.innerHTML = '';

      if (taskId) {
        const t = store.getTask(taskId);
        if (!t) return;
        this.taskModalTitle.textContent = 'Edit Academic Assignment';
        this.taskModalIcon.textContent = '✏️';
        this.formTaskId.value = t.id;
        this.formTitle.value = t.title;
        this.formCourse.value = t.courseId;
        this.formType.value = t.type;
        this.formDueDate.value = formatDateISO(t.dueDate);
        this.formDueTime.value = formatTimeISO(t.dueDate);
        this.formPriority.value = t.priority;
        this.formStatus.value = t.status;
        this.formEstMinutes.value = t.estimatedMinutes || '';
        this.formGradeWeight.value = t.weight || '';
        this.formNotes.value = t.notes || '';

        if (t.subtasks && t.subtasks.length > 0) {
          t.subtasks.forEach(s => this.addSubtaskRow(s.text, s.completed));
        }
      } else {
        this.taskModalTitle.textContent = 'Add Academic Assignment';
        this.taskModalIcon.textContent = '✨';
        this.taskForm.reset();
        this.formTaskId.value = '';
        this.formDueDate.value = presetDateStr || formatDateISO(new Date().toISOString());
        this.formDueTime.value = '23:59';
        this.formPriority.value = 'medium';
        this.formStatus.value = 'todo';
        this.formType.value = 'assignment';
        if (store.courses[0]) this.formCourse.value = store.courses[0].id;
      }

      this.taskModal.classList.add('show');
      this.formTitle.focus();
      sfx.click();
    }

    closeTaskModal() {
      this.taskModal.classList.remove('show');
      this.activeEditingTaskId = null;
    }

    addSubtaskRow(text = '', completed = false) {
      const row = document.createElement('div');
      row.className = 'subtask-edit-row';
      row.innerHTML = `
        <input type="checkbox" ${completed ? 'checked' : ''} class="subtask-edit-done">
        <input type="text" class="subtask-edit-input" placeholder="e.g. Write methodology section" value="${text.replace(/"/g, '&quot;')}">
        <button type="button" class="btn-remove-subtask" title="Remove step">&times;</button>
      `;

      row.querySelector('.btn-remove-subtask').addEventListener('click', () => {
        row.remove();
      });

      this.formSubtasksContainer.appendChild(row);
    }

    handleTaskFormSubmit() {
      const title = this.formTitle.value.trim();
      if (!title) return;

      const courseId = this.formCourse.value;
      const type = this.formType.value;
      const dateVal = this.formDueDate.value;
      const timeVal = this.formDueTime.value || '23:59';
      const dueDate = `${dateVal}T${timeVal}:00`;
      const priority = this.formPriority.value;
      const status = this.formStatus.value;
      const estimatedMinutes = this.formEstMinutes.value ? parseInt(this.formEstMinutes.value, 10) : 60;
      const weight = this.formGradeWeight.value ? parseFloat(this.formGradeWeight.value) : null;
      const notes = this.formNotes.value.trim();

      // Read subtasks
      const subtasks = [];
      this.formSubtasksContainer.querySelectorAll('.subtask-edit-row').forEach((row, idx) => {
        const text = row.querySelector('.subtask-edit-input').value.trim();
        const completed = row.querySelector('.subtask-edit-done').checked;
        if (text) {
          subtasks.push({ id: `sub_${Date.now()}_${idx}`, text, completed });
        }
      });

      if (this.activeEditingTaskId) {
        store.updateTask(this.activeEditingTaskId, {
          title, courseId, type, dueDate, priority, status, estimatedMinutes, weight, notes, subtasks
        });
        this.showToast('Assignment updated', 'success');
      } else {
        const newTask = {
          id: 'task_' + Date.now(),
          title, courseId, type, dueDate, priority, status, estimatedMinutes, weight, notes, subtasks,
          completedAt: status === 'completed' ? new Date().toISOString() : null
        };
        store.addTask(newTask);
        this.showToast('Assignment created', 'success');
      }

      this.closeTaskModal();
      this.render();
      sfx.click();
    }

    // --- Course Manager Modal ---
    openCoursesModal() {
      this.renderCoursesModalList();
      this.coursesModal.classList.add('show');
      sfx.click();
    }

    closeCoursesModal() {
      this.coursesModal.classList.remove('show');
    }

    renderCoursesModalList() {
      this.manageCoursesList.innerHTML = '';
      this.coursesModalCount.textContent = store.courses.length;

      store.courses.forEach(c => {
        const count = store.tasks.filter(t => t.courseId === c.id).length;
        const item = document.createElement('div');
        item.className = 'manage-course-item';
        item.innerHTML = `
          <div class="course-item-left">
            <span class="course-dot" style="background-color: ${c.color}"></span>
            <div>
              <strong style="font-size:0.85rem;">${c.code}</strong>
              <div style="font-size:0.75rem; color:#94a3b8;">${c.name} (${count} assignments)</div>
            </div>
          </div>
          <button class="btn-icon-subtle text-danger btn-delete-course" title="Delete Course" aria-label="Delete Course">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
          </button>
        `;

        item.querySelector('.btn-delete-course').addEventListener('click', () => {
          if (confirm(`Remove course "${c.code} - ${c.name}"?`)) {
            store.deleteCourse(c.id);
            this.renderCourses();
            this.renderCoursesModalList();
            this.renderCurrentView();
            sfx.delete();
          }
        });

        this.manageCoursesList.appendChild(item);
      });
    }

    handleCourseAddSubmit() {
      const code = document.getElementById('newCourseCode').value.trim();
      const name = document.getElementById('newCourseName').value.trim();
      const color = document.getElementById('newCourseColor').value;

      if (!code || !name) return;

      const newCourse = {
        id: 'c_' + Date.now(),
        code,
        name,
        color
      };

      store.addCourse(newCourse);
      this.courseAddForm.reset();
      this.renderCourses();
      this.renderCoursesModalList();
      sfx.click();
      this.showToast(`Course "${code}" enrolled!`, 'success');
    }

    // --- Export & Sync Services ---
    exportICalendar() {
      let icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//ScholarFlow//Academic Task Cockpit//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH'
      ];

      store.tasks.forEach(t => {
        const c = store.getCourse(t.courseId);
        const due = new Date(t.dueDate);
        const formatICSDate = (d) => {
          return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        };

        const dtStart = formatICSDate(due);
        const dtEnd = formatICSDate(new Date(due.getTime() + 30 * 60000));

        icsContent.push('BEGIN:VEVENT');
        icsContent.push(`UID:scholarflow_${t.id}@scholarflow.local`);
        icsContent.push(`DTSTAMP:${formatICSDate(new Date())}`);
        icsContent.push(`DTSTART:${dtStart}`);
        icsContent.push(`DTEND:${dtEnd}`);
        icsContent.push(`SUMMARY:[${c.code}] ${t.title}`);
        icsContent.push(`DESCRIPTION:${t.notes || ''} (Priority: ${t.priority}, Type: ${t.type})`);
        icsContent.push(`STATUS:${t.status === 'completed' ? 'COMPLETED' : 'CONFIRMED'}`);
        icsContent.push('END:VEVENT');
      });

      icsContent.push('END:VCALENDAR');
      const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
      this.downloadBlob(blob, 'scholarflow_academic_deadlines.ics');
      this.showToast('Downloaded .ics calendar file! Import into Google Calendar, Apple Calendar, or Outlook.', 'success');
      sfx.complete();
    }

    exportJSON() {
      const payload = {
        app: 'ScholarFlow',
        version: '1.0',
        exportedAt: new Date().toISOString(),
        courses: store.courses,
        tasks: store.tasks,
        pomoStats: store.pomoStats
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      this.downloadBlob(blob, `scholarflow_backup_${formatDateISO(new Date().toISOString())}.json`);
      this.showToast('Exported offline JSON backup file!', 'success');
      sfx.complete();
    }

    importJSON(e) {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          if (parsed.courses && parsed.tasks) {
            store.courses = parsed.courses;
            store.tasks = parsed.tasks;
            store.pomoStats = parsed.pomoStats || { completedBlocks: 0, totalMinutes: 0, streak: 1 };
            store.save();
            this.render();
            this.showToast('Data restored successfully from backup!', 'success');
            sfx.complete();
          } else {
            alert('Invalid ScholarFlow backup file format.');
          }
        } catch (err) {
          alert('Failed to parse JSON file.');
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    }

    downloadBlob(blob, filename) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    // --- Toast Notifications ---
    showToast(message, type = 'info') {
      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;
      const icon = type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
      toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
      this.toastContainer.appendChild(toast);

      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.25s ease';
        setTimeout(() => toast.remove(), 250);
      }, 3500);
    }
  }

  // Initialize application on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', () => {
    window.scholarApp = new AppUI();
  });

})();
