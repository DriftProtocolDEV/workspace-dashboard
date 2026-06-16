// Workspace Dashboard - Static PWA Version
// Adapted from the rich extension dashboard to work as a pure static site on GitHub Pages.
// No chrome.* APIs. Embedding relies on user's browser cookies + fallbacks.
// Launcher tries to load Google apps in the central iframe; blocked ones show fallback + "Open tab".

const state = {
  currentAccount: 0,
  currentTab: 'dashboard'
};

function withActiveGoogleAccount(url) {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.endsWith('google.com')) return url;
    const account = state.currentAccount;
    const map = {
      'mail.google.com': `https://mail.google.com/mail/u/${account}/`,
      'calendar.google.com': `https://calendar.google.com/calendar/u/${account}/r`,
      'drive.google.com': `https://drive.google.com/drive/u/${account}/my-drive`,
      'docs.google.com': `https://docs.google.com/document/u/${account}/`,
      'sheets.google.com': `https://docs.google.com/spreadsheets/u/${account}/`,
      'slides.google.com': `https://docs.google.com/presentation/u/${account}/`
    };
    if (map[parsed.hostname]) return map[parsed.hostname];
    parsed.searchParams.set('authuser', account);
    return parsed.toString();
  } catch (e) {
    return url;
  }
}

function openInWorkspace(url, title = 'Workspace') {
  const iframe = document.getElementById('workspace-iframe');
  const fallback = document.getElementById('workspace-frame-fallback');
  const urlDisplay = document.getElementById('workspace-url-display');
  const titleEl = document.getElementById('active-app-title');
  const badge = document.getElementById('active-account-badge');

  const finalUrl = withActiveGoogleAccount(url);

  urlDisplay.value = finalUrl;
  titleEl.textContent = title;
  badge.textContent = `Session ${state.currentAccount}`;
  fallback.classList.add('hidden');

  iframe.src = finalUrl;

  // 7s fallback if content likely blocked (common for Gmail/Drive/Calendar in static PWA)
  clearTimeout(window._fallbackTimer);
  window._fallbackTimer = setTimeout(() => {
    if (!iframe.contentWindow || iframe.src === 'about:blank') {
      fallback.classList.remove('hidden');
    }
  }, 7000);
}

function saveQuickNotes() {
  const notes = document.getElementById('quick-notes');
  localStorage.setItem('workspace-notes', notes.value);
  document.getElementById('notes-save-status').textContent = 'Saved';
}

function loadQuickNotes() {
  const notes = document.getElementById('quick-notes');
  notes.value = localStorage.getItem('workspace-notes') || '';
  document.getElementById('notes-save-status').textContent = 'Ready';
}

function setupEventListeners() {
  // Account switcher
  const accountSelect = document.getElementById('account-select');
  accountSelect.value = state.currentAccount;
  accountSelect.addEventListener('change', (e) => {
    state.currentAccount = parseInt(e.target.value, 10);
    // Refresh current view with new account
    const currentUrl = document.getElementById('workspace-url-display').value || 'https://calendar.google.com/calendar/r';
    openInWorkspace(currentUrl, document.getElementById('active-app-title').textContent);
  });

  // Notes
  const notesEl = document.getElementById('quick-notes');
  const clearNotesBtn = document.getElementById('notes-clear-btn');
  notesEl.addEventListener('input', () => {
    document.getElementById('notes-save-status').textContent = 'Saving...';
    clearTimeout(window._notesTimer);
    window._notesTimer = setTimeout(saveQuickNotes, 400);
  });
  clearNotesBtn.addEventListener('click', () => {
    notesEl.value = '';
    localStorage.removeItem('workspace-notes');
    document.getElementById('notes-save-status').textContent = 'Cleared';
  });

  // Header buttons
  document.getElementById('workspace-refresh-btn').addEventListener('click', () => {
    const url = document.getElementById('workspace-url-display').value;
    if (url) openInWorkspace(url, document.getElementById('active-app-title').textContent);
  });
  document.getElementById('workspace-open-btn').addEventListener('click', () => {
    const url = document.getElementById('workspace-url-display').value;
    if (url) window.open(url, '_blank');
  });
  document.getElementById('copy-url-btn').addEventListener('click', () => {
    const url = document.getElementById('workspace-url-display').value;
    navigator.clipboard.writeText(url);
  });

  // Launcher buttons
  document.querySelectorAll('.quick-link-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const url = btn.getAttribute('data-url');
      const title = btn.getAttribute('data-title') || 'App';
      openInWorkspace(url, title);
    });
  });

  // Sandbox nav form (search / direct URL)
  const navForm = document.getElementById('sandbox-nav-form');
  const queryInput = document.getElementById('sandbox-query-input');
  navForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let destination = queryInput.value.trim();
    if (!destination.startsWith('http')) {
      destination = `https://www.google.com/search?q=${encodeURIComponent(destination)}`;
    }
    openInWorkspace(destination, 'Search');
    queryInput.value = '';
  });

  // Sidebar toggle (simple for static)
  const menuBtn = document.getElementById('menu-toggle-btn');
  const sidebar = document.getElementById('sidebar-left');
  menuBtn.addEventListener('click', () => {
    sidebar.style.display = sidebar.style.display === 'none' ? 'flex' : 'none';
  });

  // Launcher toggle
  const launcherBtn = document.getElementById('launcher-toggle-btn');
  const launcher = document.getElementById('sandbox-panel');
  launcherBtn.addEventListener('click', () => {
    launcher.style.display = launcher.style.display === 'none' ? 'flex' : 'none';
  });
  document.getElementById('sandbox-close-btn').addEventListener('click', () => {
    launcher.style.display = 'none';
  });

  // Fallback buttons
  document.getElementById('workspace-retry-btn').addEventListener('click', () => {
    const url = document.getElementById('workspace-url-display').value;
    if (url) openInWorkspace(url, document.getElementById('active-app-title').textContent);
  });
  document.getElementById('workspace-fallback-open-btn').addEventListener('click', () => {
    const url = document.getElementById('workspace-url-display').value;
    if (url) window.open(url, '_blank');
  });

  // Keyboard support
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement.tagName === 'BODY') {
      e.preventDefault();
      document.getElementById('sandbox-query-input').focus();
    }
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadQuickNotes();
  setupEventListeners();

  // Initial view - open Calendar by default (works reasonably in iframe)
  openInWorkspace('https://calendar.google.com/calendar/r', 'Calendar');

  // PWA Service Worker registration (from the bill)
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js')
        .then(reg => console.log('Workspace Dashboard PWA: SW registered', reg.scope))
        .catch(err => console.warn('SW registration failed', err));
    });
  }

  // Expose debug helper
  window.workspaceDebug = () => ({ currentAccount: state.currentAccount });
});

console.log('%c[Workspace Dashboard] Static PWA ready. Rich launcher + iframe workspace + local notes. Embedding limited without extension privileges.', 'color:#64748b');