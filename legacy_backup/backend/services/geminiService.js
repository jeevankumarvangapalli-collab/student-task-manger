/**
 * ScholarFlow: Gemini LLM Service Module
 * Handles API calls to Google Gemini models for the DevBot academic & coding assistant.
 */

const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * System instruction defining DevBot's persona, capabilities, and constraints.
 */
const SYSTEM_PROMPT = `
You are "DevBot", an elite AI academic mentor and student task breakdown assistant inside ScholarFlow.
Your core mission is to help students overcome procrastination, manage academic deadlines, decompose large programming projects and coursework into bite-sized subtasks, and explain concepts clearly.

Guidelines:
1. Be concise, actionable, and encouraging. Students are busy and stressed.
2. Use markdown formatting: bold key points, bullet lists for action items, and fenced code blocks with language identifiers for code.
3. When suggesting task breakdowns, propose practical 20-60 minute milestones that can be tackled using the Pomodoro technique.
4. Keep explanations clear, grounded in active recall and spaced repetition principles.
5. If the student shares code or homework problems, provide gentle guidance or step-by-step solutions without unnecessary fluff.
`.trim();

/**
 * Calls the Google Gemini API with native fetch.
 * Works seamlessly in Node.js 18+ without bulky SDK version conflicts.
 */
async function callGemini(contents, systemText = SYSTEM_PROMPT, customApiKey = null, model = DEFAULT_MODEL) {
  const apiKey = (customApiKey || process.env.GEMINI_API_KEY || '').trim();

  if (!apiKey) {
    return {
      success: false,
      isMock: true,
      text: getMockDevBotResponse(contents[contents.length - 1]?.parts?.[0]?.text || '')
    };
  }

  const endpoint = `${GEMINI_API_BASE}/${model}:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: contents,
    systemInstruction: {
      parts: [{ text: systemText }]
    },
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1500,
      topP: 0.95
    }
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
      console.error('[Gemini Service] API Error:', errorMsg);
      return {
        success: false,
        error: errorMsg,
        text: `⚠️ **Gemini API Error:** ${errorMsg}\n\nPlease verify your \`GEMINI_API_KEY\` in \`backend/.env\` or the UI settings.`
      };
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    const outputText = candidate?.content?.parts?.[0]?.text || 'No response generated.';

    return {
      success: true,
      text: outputText,
      usage: data.usageMetadata || null
    };
  } catch (err) {
    console.error('[Gemini Service] Network error:', err);
    return {
      success: false,
      error: err.message,
      text: `⚠️ **Connection Error:** Could not contact Gemini API (${err.message}). Check your network connection.`
    };
  }
}

/**
 * Conversational DevBot response generation with student context awareness.
 */
async function generateDevBotResponse({ message, history = [], studentContext = {}, apiKey = null }) {
  // Format message history for Gemini API
  const formattedContents = [];

  // Add contextual student overview if provided
  let contextBrief = '';
  if (studentContext && Object.keys(studentContext).length > 0) {
    const pendingCount = studentContext.pendingCount || 0;
    const urgentCount = studentContext.urgentCount || 0;
    const courses = (studentContext.courses || []).map(c => `${c.code} (${c.name})`).join(', ');
    const nextDue = studentContext.nextDueTask ? `"${studentContext.nextDueTask.title}" (Due: ${studentContext.nextDueTask.dueDate})` : 'None';
    
    contextBrief = `[Student Dashboard Context: Pending Assignments: ${pendingCount}, Urgent/Overdue: ${urgentCount}, Enrolled Courses: ${courses || 'None'}, Next Deadline: ${nextDue}]\n\n`;
  }

  // Append recent history (last 8 turns for efficiency)
  const recentHistory = history.slice(-8);
  for (const item of recentHistory) {
    formattedContents.push({
      role: item.role === 'user' ? 'user' : 'model',
      parts: [{ text: item.content }]
    });
  }

  // Append latest user message with context prefix
  const finalPrompt = contextBrief ? `${contextBrief}Student says: ${message}` : message;
  formattedContents.push({
    role: 'user',
    parts: [{ text: finalPrompt }]
  });

  return await callGemini(formattedContents, SYSTEM_PROMPT, apiKey);
}

/**
 * Intelligent Assignment Breakdown into Actionable Subtasks
 */
async function breakdownAssignment({ title, course = '', notes = '', apiKey = null }) {
  const breakdownInstruction = `
You are an expert academic project breakdown engine.
Given an assignment or coding project, generate 3 to 6 concrete, sequential subtasks.
Each subtask must have:
- "text": a clear, actionable verb-driven step (e.g. "Implement SQLite schema and migrations")
- "estimatedMinutes": realistic time in minutes (between 15 and 90)

Input:
Assignment Title: "${title}"
Course/Subject: "${course}"
Additional Notes: "${notes}"

CRITICAL: Return ONLY a valid JSON array of objects. Do not write markdown intro, do not write explanations.
Example output format:
[
  { "text": "Set up project repository and install dependencies", "estimatedMinutes": 20 },
  { "text": "Design core data structure and interfaces", "estimatedMinutes": 45 },
  { "text": "Implement main business logic and test with sample cases", "estimatedMinutes": 60 },
  { "text": "Write documentation and format final submission", "estimatedMinutes": 30 }
]
`.trim();

  const contents = [
    {
      role: 'user',
      parts: [{ text: breakdownInstruction }]
    }
  ];

  const result = await callGemini(contents, 'You are a JSON-only response generator.', apiKey);

  if (!result.success || result.isMock) {
    return {
      success: true,
      isMock: Boolean(result.isMock),
      subtasks: getFallbackSubtasks(title)
    };
  }

  try {
    let cleanJson = result.text.trim();
    // Strip code fences if present
    if (cleanJson.startsWith('```json')) cleanJson = cleanJson.slice(7);
    if (cleanJson.startsWith('```')) cleanJson = cleanJson.slice(3);
    if (cleanJson.endsWith('```')) cleanJson = cleanJson.slice(0, -3);
    cleanJson = cleanJson.trim();

    const parsed = JSON.parse(cleanJson);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return {
        success: true,
        subtasks: parsed.map((item, idx) => ({
          id: `sub_${Date.now()}_${idx}`,
          text: item.text || item.title || `Step ${idx + 1}`,
          estimatedMinutes: item.estimatedMinutes || 45,
          completed: false
        }))
      };
    }
  } catch (err) {
    console.warn('[Gemini Service] Failed to parse JSON breakdown, using fallback:', err);
  }

  return {
    success: true,
    subtasks: getFallbackSubtasks(title)
  };
}

/**
 * Generates an intelligent study schedule based on deadlines.
 */
async function generateStudyPlan({ tasks = [], days = 5, apiKey = null }) {
  const taskListText = tasks
    .filter(t => t.status !== 'completed')
    .map(t => `- [${t.priority.toUpperCase()}] "${t.title}" (Due: ${t.dueDate}, Est: ${t.estimatedMinutes || 60}m)`)
    .join('\n');

  const prompt = `
Create a structured ${days}-day study plan for a student with the following pending coursework:
${taskListText || 'No pending tasks recorded yet.'}

Format the response cleanly with day-by-day headings (e.g. "### Day 1: [Focus Area]"), specific time blocks (e.g. "2x 25m Pomodoro sessions"), and actionable recommendations to avoid cramming.
`.trim();

  return await callGemini(
    [{ role: 'user', parts: [{ text: prompt }] }],
    SYSTEM_PROMPT,
    apiKey
  );
}

/**
 * Simulated DevBot intelligent responses when running in demo/offline mode without an API key.
 */
function getMockDevBotResponse(userMsg) {
  const lower = userMsg.toLowerCase();

  if (lower.includes('break down') || lower.includes('subtask') || lower.includes('split')) {
    return `🤖 **DevBot Assignment Breakdown**\n\nI can break down any assignment into targeted Pomodoro sprints! Here is a recommended 4-step framework:\n\n1. **Setup & Requirements Audit** (~25m)\n   - Review syllabus guidelines, rubric, and input criteria.\n2. **Architecture & Core Draft** (~50m)\n   - Implement the foundational logic, draft outlines, or solve core equation sets.\n3. **Refinement & Testing** (~45m)\n   - Verify against sample test cases or peer review guidelines.\n4. **Final Proof & Submission Packaging** (~20m)\n   - Generate PDF/ZIP, double-check naming conventions, and submit.\n\n*(💡 Connect your free Gemini API Key in \`backend/.env\` or the Settings menu to unlock real-time dynamic Gemini LLM generation!)*`;
  }

  if (lower.includes('study plan') || lower.includes('schedule') || lower.includes('exam')) {
    return `📅 **DevBot Smart Study Recommendation**\n\nBased on cognitive science and active recall principles:\n\n- **Today**: Dedicate 2x 25-minute Pomodoros to your most urgent upcoming deadline.\n- **Tomorrow**: Active recall review session (flashcards/practice problems) for high-weight coursework.\n- **Pre-Exam (48h prior)**: Timed simulation under test conditions; avoid passive re-reading.\n\n*Pro tip: Keep your 5-day study streak alive by hitting at least two 25-minute focus intervals today!*`;
  }

  return `👋 Hi there! I'm **DevBot**, your academic AI assistant powered by Google Gemini.\n\nI can help you:\n- ⚡ **Break down assignments** into bite-sized checkpoints\n- 📅 **Build customized study schedules** for exam season\n- 💡 **Explain complex concepts & debug code**\n- 🎯 **Prioritize your daily coursework**\n\n*(✨ Notice: Running in quick-start demo mode. Add your \`GEMINI_API_KEY\` to \`backend/.env\` or paste it in the chat settings to enable live Gemini LLM streaming!)*`;
}

function getFallbackSubtasks(title) {
  return [
    { id: `sub_${Date.now()}_1`, text: `Analyze rubric and requirements for "${title}"`, estimatedMinutes: 20, completed: false },
    { id: `sub_${Date.now()}_2`, text: 'Gather reference materials, starter code, or lecture notes', estimatedMinutes: 30, completed: false },
    { id: `sub_${Date.now()}_3`, text: 'Execute main implementation / draft primary sections', estimatedMinutes: 60, completed: false },
    { id: `sub_${Date.now()}_4`, text: 'Review against guidelines, polish, and submit', estimatedMinutes: 25, completed: false }
  ];
}

module.exports = {
  callGemini,
  generateDevBotResponse,
  breakdownAssignment,
  generateStudyPlan
};
