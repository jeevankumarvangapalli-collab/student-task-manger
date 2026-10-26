/**
 * ScholarFlow: DevBot AI Chat Controller (Powered by Google Gemini LLM)
 * Connects frontend to the Express backend (/api/chat, /api/ai/breakdown)
 * with graceful fallback to direct Gemini client calls or interactive demo responses.
 */

(function () {
  'use strict';

  class DevBotController {
    constructor() {
      this.storageKey = 'scholarflow_devbot_history';
      this.settingsKey = 'scholarflow_devbot_settings';
      this.backendUrl = this.loadBackendUrl();
      this.directApiKey = this.loadDirectApiKey();
      this.history = this.loadHistory();
      this.isBackendOnline = false;
      this.isGenerating = false;

      this.initElements();
      this.bindEvents();
      this.checkBackendHealth();
      this.renderHistory();
    }

    loadBackendUrl() {
      try {
        const settings = JSON.parse(localStorage.getItem(this.settingsKey) || '{}');
        return settings.backendUrl || 'http://localhost:5000';
      } catch (e) {
        return 'http://localhost:5000';
      }
    }

    loadDirectApiKey() {
      try {
        const settings = JSON.parse(localStorage.getItem(this.settingsKey) || '{}');
        return settings.geminiApiKey || '';
      } catch (e) {
        return '';
      }
    }

    saveSettings(backendUrl, geminiApiKey) {
      const settings = {
        backendUrl: backendUrl.trim().replace(/\/$/, ''),
        geminiApiKey: geminiApiKey.trim()
      };
      this.backendUrl = settings.backendUrl;
      this.directApiKey = settings.geminiApiKey;
      localStorage.setItem(this.settingsKey, JSON.stringify(settings));
      this.checkBackendHealth();
    }

    loadHistory() {
      try {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) return JSON.parse(saved);
      } catch (e) {}
      return [
        {
          role: 'model',
          content: "👋 Hi! I'm **DevBot**, your academic AI mentor powered by **Google Gemini**.\n\nI can:\n- ⚡ **Deconstruct complex assignments** into timed subtasks\n- 📅 **Build customized study schedules** to beat deadlines\n- 🐞 **Debug code & explain tough coursework**\n- 🎯 **Prioritize your daily academic workload**\n\nTry clicking one of the prompt chips below, or ask me anything!",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];
    }

    saveHistory() {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.history));
      } catch (e) {}
    }

    initElements() {
      // Main View Elements
      this.viewDevbot = document.getElementById('viewDevbot');
      this.chatMessagesContainer = document.getElementById('devbotMessagesList');
      this.chatInput = document.getElementById('devbotChatInput');
      this.btnSend = document.getElementById('btnDevbotSend');
      this.btnClear = document.getElementById('btnDevbotClearChat');
      this.quickPromptChips = document.querySelectorAll('.devbot-prompt-chip');
      this.statusIndicator = document.getElementById('devbotBackendStatus');

      // Floating Drawer Elements
      this.floatingTrigger = document.getElementById('btnFloatingDevBot');
      this.drawer = document.getElementById('devbotDrawer');
      this.btnCloseDrawer = document.getElementById('btnCloseDevbotDrawer');
      this.drawerMessagesList = document.getElementById('devbotDrawerMessagesList');
      this.drawerInput = document.getElementById('devbotDrawerInput');
      this.btnDrawerSend = document.getElementById('btnDevbotDrawerSend');

      // Task Modal AI Breakdown Button
      this.btnMagicBreakdown = document.getElementById('btnDevBotBreakdownTask');
    }

    bindEvents() {
      // Main View Send
      if (this.btnSend && this.chatInput) {
        this.btnSend.addEventListener('click', () => this.handleSendMessage(this.chatInput));
        this.chatInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.handleSendMessage(this.chatInput);
          }
        });
      }

      // Floating Drawer Send
      if (this.btnDrawerSend && this.drawerInput) {
        this.btnDrawerSend.addEventListener('click', () => this.handleSendMessage(this.drawerInput));
        this.drawerInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.handleSendMessage(this.drawerInput);
          }
        });
      }

      // Drawer Toggle
      if (this.floatingTrigger && this.drawer) {
        this.floatingTrigger.addEventListener('click', () => this.toggleDrawer(true));
      }
      if (this.btnCloseDrawer && this.drawer) {
        this.btnCloseDrawer.addEventListener('click', () => this.toggleDrawer(false));
      }

      // Clear History
      if (this.btnClear) {
        this.btnClear.addEventListener('click', () => {
          if (confirm('Clear DevBot conversation history?')) {
            this.history = [];
            this.saveHistory();
            this.renderHistory();
          }
        });
      }

      // Quick Prompt Chips
      if (this.quickPromptChips) {
        this.quickPromptChips.forEach(chip => {
          chip.addEventListener('click', () => {
            const promptText = chip.getAttribute('data-prompt') || chip.textContent.trim();
            if (this.chatInput) {
              this.chatInput.value = promptText;
              this.handleSendMessage(this.chatInput);
            }
          });
        });
      }

      // Magic Breakdown in Task Modal
      if (this.btnMagicBreakdown) {
        this.btnMagicBreakdown.addEventListener('click', () => this.handleMagicBreakdown());
      }
    }

    toggleDrawer(show) {
      if (!this.drawer) return;
      if (show) {
        this.drawer.classList.add('open');
        this.renderHistory();
        if (this.drawerInput) setTimeout(() => this.drawerInput.focus(), 150);
      } else {
        this.drawer.classList.remove('open');
      }
    }

    async checkBackendHealth() {
      try {
        const res = await fetch(`${this.backendUrl}/api/health`, { method: 'GET', signal: AbortSignal.timeout(2500) });
        if (res.ok) {
          const data = await res.json();
          this.isBackendOnline = true;
          this.updateStatusBadge(true, data.geminiConfigured ? 'Backend & Gemini Active' : 'Backend Active (Demo Key)');
          return;
        }
      } catch (e) {
        // Backend not reachable
      }

      this.isBackendOnline = false;
      if (this.directApiKey) {
        this.updateStatusBadge(true, 'Direct Gemini API');
      } else {
        this.updateStatusBadge(false, 'Local Demo Mode (Backend Offline)');
      }
    }

    updateStatusBadge(isOnline, label) {
      const badges = document.querySelectorAll('.devbot-status-badge');
      badges.forEach(b => {
        b.className = `devbot-status-badge ${isOnline ? 'online' : 'offline'}`;
        b.innerHTML = `<span class="status-dot"></span><span>${label}</span>`;
      });
    }

    getStudentContext() {
      if (window.scholarApp && window.scholarApp.store) {
        const store = window.scholarApp.store;
        const pending = store.tasks.filter(t => t.status !== 'completed');
        const urgent = pending.filter(t => t.priority === 'urgent' || t.priority === 'high');
        const nextDue = [...pending].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0];

        return {
          pendingCount: pending.length,
          urgentCount: urgent.length,
          courses: store.courses.map(c => ({ code: c.code, name: c.name })),
          nextDueTask: nextDue ? { title: nextDue.title, dueDate: nextDue.dueDate } : null
        };
      }
      return {};
    }

    async handleSendMessage(inputElement) {
      if (this.isGenerating) return;
      const text = inputElement.value.trim();
      if (!text) return;

      inputElement.value = '';
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Add user message
      this.history.push({ role: 'user', content: text, time: timeStr });
      this.saveHistory();
      this.renderHistory();

      this.isGenerating = true;
      this.showTypingIndicator();

      try {
        let reply = '';
        const studentContext = this.getStudentContext();

        // 1. Try Backend API first if online
        if (this.isBackendOnline) {
          try {
            const res = await fetch(`${this.backendUrl}/api/chat`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                message: text,
                history: this.history.slice(-6),
                studentContext,
                apiKey: this.directApiKey || null
              })
            });

            if (res.ok) {
              const data = await res.json();
              reply = data.text;
            }
          } catch (e) {
            console.warn('[DevBot] Backend request failed, falling back:', e);
          }
        }

        // 2. Direct Gemini Call if user provided key in UI and backend wasn't used
        if (!reply && this.directApiKey) {
          reply = await this.callGeminiDirect(text, studentContext);
        }

        // 3. Fallback Smart Local Response
        if (!reply) {
          reply = this.getLocalSmartReply(text);
        }

        this.history.push({
          role: 'model',
          content: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        this.saveHistory();
      } catch (err) {
        this.history.push({
          role: 'model',
          content: `⚠️ Sorry, an error occurred while generating a response: ${err.message}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      } finally {
        this.isGenerating = false;
        this.removeTypingIndicator();
        this.renderHistory();
      }
    }

    async callGeminiDirect(text, context) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.directApiKey}`;
      const systemPrompt = "You are DevBot, an encouraging academic coach inside ScholarFlow. Break down assignments, suggest study techniques, and keep answers concise.";
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] }
        })
      });

      if (!res.ok) {
        throw new Error(`Gemini direct call failed (${res.status})`);
      }
      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response returned.';
    }

    getLocalSmartReply(userText) {
      const lower = userText.toLowerCase();

      if (lower.includes('break down') || lower.includes('subtask') || lower.includes('split') || lower.includes('steps')) {
        return `🤖 **DevBot Task Breakdown Framework**\n\nHere is a 4-step action plan to conquer this assignment:\n\n1. **Step 1: Scope & Rubric Audit** (~20 mins)\n   - Extract test criteria, requirements, and reference notes.\n2. **Step 2: Core Architecture Draft** (~50 mins)\n   - Implement fundamental logic or write section 1.\n3. **Step 3: Edge Cases & Polish** (~40 mins)\n   - Verify against sample inputs, test corner cases, and proofread.\n4. **Step 4: Final Submission Packaging** (~15 mins)\n   - Verify formatting and push to submission portal.\n\n*(Tip: Run \`npm start\` in \`backend/\` to activate real-time Gemini LLM generation!)*`;
      }

      if (lower.includes('study plan') || lower.includes('schedule') || lower.includes('exam')) {
        return `📅 **Recommended 3-Day Study Schedule**\n\n- **Day 1 (Foundation)**: 2x 25m Pomodoro sessions on core formulas & definitions.\n- **Day 2 (Application)**: 3x 25m Pomodoro sessions solving previous exam questions under timed conditions.\n- **Day 3 (Consolidation)**: 1x 30m rapid flashcard review + error journal pass.\n\n*Pro tip: Space your sessions out and take a 5-minute break between blocks!*`;
      }

      if (lower.includes('prioritize') || lower.includes('today') || lower.includes('first')) {
        return `🎯 **Daily Academic Prioritization**\n\n1. **Tackle the Nearest Deadline**: Clear anything due in < 24 hours first to remove cognitive load.\n2. **The "Frog" of the Day**: Pick your hardest high-weight assignment and knock out just 1 Pomodoro (25m) on it before lunch.\n3. **Quick Wins**: Spend 20 minutes closing minor discussion posts or reading confirmations.\n\nWhat assignment would you like to start with right now?`;
      }

      return `👋 I'm **DevBot**, your academic AI companion!\n\nI can help you:\n- ⚡ **Break down big homeworks & coding projects** into timed checkpoints\n- 📅 **Build customized study plans** for upcoming exams\n- 💡 **Explain tough concepts & debug homework code**\n- 🎯 **Prioritize your daily academic workload**\n\nAsk me a question or try one of the prompt chips below!`;
    }

    async handleMagicBreakdown() {
      const titleInput = document.getElementById('formTitle');
      const courseSelect = document.getElementById('formCourse');
      const notesInput = document.getElementById('formNotes');

      const title = titleInput ? titleInput.value.trim() : '';
      if (!title) {
        alert('Please enter an Assignment Title first so DevBot can analyze it!');
        if (titleInput) titleInput.focus();
        return;
      }

      const courseName = courseSelect && courseSelect.selectedOptions[0] ? courseSelect.selectedOptions[0].text : '';
      const notes = notesInput ? notesInput.value.trim() : '';

      const btn = this.btnMagicBreakdown;
      const originalHTML = btn.innerHTML;
      btn.innerHTML = `<span class="spinner-small"></span> Decomposing with Gemini...`;
      btn.disabled = true;

      try {
        let subtasks = [];

        // Try backend
        if (this.isBackendOnline) {
          const res = await fetch(`${this.backendUrl}/api/ai/breakdown`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title,
              course: courseName,
              notes,
              apiKey: this.directApiKey || null
            })
          });

          if (res.ok) {
            const data = await res.json();
            if (data.subtasks && data.subtasks.length > 0) {
              subtasks = data.subtasks;
            }
          }
        }

        // Fallback default subtasks
        if (!subtasks || subtasks.length === 0) {
          subtasks = [
            { text: `Review requirements and rubric for ${title}`, estimatedMinutes: 20 },
            { text: 'Gather reference materials, formulas, and starter files', estimatedMinutes: 25 },
            { text: 'Implement primary core solution / draft key sections', estimatedMinutes: 60 },
            { text: 'Verify correctness against test criteria & finalize submission', estimatedMinutes: 30 }
          ];
        }

        // Populate into UI modal checklist
        if (window.scholarApp && window.scholarApp.addSubtaskRow) {
          subtasks.forEach(s => {
            window.scholarApp.addSubtaskRow(`${s.text} (${s.estimatedMinutes}m)`, false);
          });
          window.scholarApp.showToast(`✨ DevBot added ${subtasks.length} AI checkpoints!`, 'success');
        }
      } catch (err) {
        console.error('Breakdown error:', err);
        alert('Failed to generate AI breakdown: ' + err.message);
      } finally {
        btn.innerHTML = originalHTML;
        btn.disabled = false;
      }
    }

    showTypingIndicator() {
      const containers = [this.chatMessagesContainer, this.drawerMessagesList];
      containers.forEach(c => {
        if (!c) return;
        const typingEl = document.createElement('div');
        typingEl.className = 'devbot-msg msg-model typing-indicator-msg';
        typingEl.id = 'devbotTypingIndicator';
        typingEl.innerHTML = `
          <div class="msg-avatar">🤖</div>
          <div class="msg-bubble">
            <span class="typing-dots"><span></span><span></span><span></span></span>
            <span class="text-xs text-muted" style="margin-left:0.5rem;">DevBot is thinking...</span>
          </div>
        `;
        c.appendChild(typingEl);
        c.scrollTop = c.scrollHeight;
      });
    }

    removeTypingIndicator() {
      document.querySelectorAll('#devbotTypingIndicator').forEach(el => el.remove());
    }

    renderHistory() {
      const containers = [this.chatMessagesContainer, this.drawerMessagesList];

      containers.forEach(container => {
        if (!container) return;
        container.innerHTML = '';

        this.history.forEach(item => {
          const msgEl = document.createElement('div');
          msgEl.className = `devbot-msg msg-${item.role}`;

          const isBot = item.role === 'model';
          const avatar = isBot ? '🤖' : '🎓';

          msgEl.innerHTML = `
            <div class="msg-avatar" title="${isBot ? 'DevBot (Gemini)' : 'You'}">${avatar}</div>
            <div class="msg-body">
              <div class="msg-header">
                <span class="msg-sender">${isBot ? 'DevBot AI' : 'You'}</span>
                <span class="msg-time">${item.time || ''}</span>
              </div>
              <div class="msg-bubble">${this.formatMarkdown(item.content)}</div>
            </div>
          `;

          // Add copy code buttons
          msgEl.querySelectorAll('pre code').forEach(codeBlock => {
            const pre = codeBlock.parentElement;
            const copyBtn = document.createElement('button');
            copyBtn.className = 'btn-copy-code';
            copyBtn.textContent = 'Copy';
            copyBtn.addEventListener('click', () => {
              navigator.clipboard.writeText(codeBlock.innerText);
              copyBtn.textContent = 'Copied!';
              setTimeout(() => { copyBtn.textContent = 'Copy'; }, 2000);
            });
            pre.appendChild(copyBtn);
          });

          container.appendChild(msgEl);
        });

        container.scrollTop = container.scrollHeight;
      });
    }

    formatMarkdown(text) {
      if (!text) return '';

      // Escape raw HTML entities
      let html = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      // Code blocks ```lang\ncode\n```
      html = html.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
        return `<pre class="code-block"><code class="language-${lang}">${code.trim()}</code></pre>`;
      });

      // Inline code `code`
      html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

      // Bold **text**
      html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

      // Italic *text*
      html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

      // Headers ### Title
      html = html.replace(/^### (.*$)/gim, '<h4 class="chat-md-h4">$1</h4>');
      html = html.replace(/^## (.*$)/gim, '<h3 class="chat-md-h3">$1</h3>');

      // Bullet lists
      html = html.replace(/^\s*-\s+(.*$)/gim, '<li class="chat-li">$1</li>');
      html = html.replace(/(<li class="chat-li">.*<\/li>)/gms, '<ul class="chat-ul">$1</ul>');

      // Line breaks
      html = html.replace(/\n/g, '<br>');
      // Clean duplicate br inside lists
      html = html.replace(/<\/li><br>/g, '</li>');
      html = html.replace(/<\/ul><br>/g, '</ul>');

      return html;
    }
  }

  // Attach to window and auto-initialize when DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    window.devBotApp = new DevBotController();
  });
})();
