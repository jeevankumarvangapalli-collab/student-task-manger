/**
 * ScholarFlow: Backend API Routes
 * Mounts endpoints for DevBot (Gemini LLM calls) and academic data persistence (Supabase / local).
 */

const express = require('express');
const router = express.Router();
const geminiService = require('../services/geminiService');
const { createSupabaseClient } = require('../../supabase/client');

// Initialize optional Supabase client if configured in environment
const supabase = createSupabaseClient();

// In-memory data store for fallback when Supabase credentials are not provided
let memoryTasks = [];
let memoryCourses = [];

/**
 * Health Check & Capabilities Discovery
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    geminiModel: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    supabaseConfigured: Boolean(process.env.SUPABASE_URL && (process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY))
  });
});

/**
 * DevBot Conversational Gemini LLM Endpoint
 * POST /api/chat
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, history, studentContext, apiKey } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message text is required.' });
    }

    const response = await geminiService.generateDevBotResponse({
      message,
      history: history || [],
      studentContext: studentContext || {},
      apiKey: apiKey || null
    });

    res.json(response);
  } catch (err) {
    console.error('[API /chat error]', err);
    res.status(500).json({ error: 'Internal server error while processing DevBot request.' });
  }
});

/**
 * DevBot Assignment Breakdown via Gemini LLM
 * POST /api/ai/breakdown
 */
router.post('/ai/breakdown', async (req, res) => {
  try {
    const { title, course, notes, apiKey } = req.body;

    if (!title || typeof title !== 'string') {
      return res.status(400).json({ error: 'Assignment title is required to break it down.' });
    }

    const response = await geminiService.breakdownAssignment({
      title,
      course: course || '',
      notes: notes || '',
      apiKey: apiKey || null
    });

    res.json(response);
  } catch (err) {
    console.error('[API /ai/breakdown error]', err);
    res.status(500).json({ error: 'Failed to break down assignment.' });
  }
});

/**
 * DevBot Smart Study Plan Generation via Gemini LLM
 * POST /api/ai/study-plan
 */
router.post('/ai/study-plan', async (req, res) => {
  try {
    const { tasks, days, apiKey } = req.body;

    const response = await geminiService.generateStudyPlan({
      tasks: tasks || [],
      days: days || 5,
      apiKey: apiKey || null
    });

    res.json(response);
  } catch (err) {
    console.error('[API /ai/study-plan error]', err);
    res.status(500).json({ error: 'Failed to generate study plan.' });
  }
});

/**
 * Tasks CRUD (Proxies to Supabase if available, else in-memory)
 */
router.get('/tasks', async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase.from('tasks').select('*').order('due_date', { ascending: true });
      if (error) throw error;
      return res.json(data);
    }
    res.json(memoryTasks);
  } catch (err) {
    console.error('[GET /tasks error]', err);
    res.json(memoryTasks);
  }
});

router.post('/tasks', async (req, res) => {
  try {
    const task = req.body;
    if (!task.id) task.id = 'task_' + Date.now();

    if (supabase) {
      const { data, error } = await supabase.from('tasks').upsert([task]);
      if (error) throw error;
      return res.status(201).json({ success: true, task });
    }

    memoryTasks = memoryTasks.filter(t => t.id !== task.id).concat(task);
    res.status(201).json({ success: true, task });
  } catch (err) {
    console.error('[POST /tasks error]', err);
    res.status(500).json({ error: 'Failed to save task' });
  }
});

router.delete('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (supabase) {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
      return res.json({ success: true, deletedId: id });
    }

    memoryTasks = memoryTasks.filter(t => t.id !== id);
    res.json({ success: true, deletedId: id });
  } catch (err) {
    console.error('[DELETE /tasks error]', err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

/**
 * Courses CRUD
 */
router.get('/courses', async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase.from('courses').select('*');
      if (error) throw error;
      return res.json(data);
    }
    res.json(memoryCourses);
  } catch (err) {
    res.json(memoryCourses);
  }
});

module.exports = router;
