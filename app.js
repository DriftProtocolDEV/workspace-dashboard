const STORAGE_KEYS = {
  notes: 'workspace-notes',
  account: 'workspace-active-account'
};

const state = {
  currentAccount: 0
};

function updateAppLinks(account) {
  const links = document.querySelectorAll('[data-app-url-template]');
  links.forEach((link) => {
    const template = link.getAttribute('data-app-url-template');
    if (!template) return;
    link.setAttribute('href', template.replace('{account}', String(account)));
  });
}

function saveQuickNotes() {
  const notesEl = document.getElementById('quick-notes');
  const statusEl = document.getElementById('notes-save-status');
  if (!notesEl || !statusEl) return;
  localStorage.setItem(STORAGE_KEYS.notes, notesEl.value);
  statusEl.textContent = 'Saved';
}

function loadQuickNotes() {
  const notesEl = document.getElementById('quick-notes');
  const statusEl = document.getElementById('notes-save-status');
  if (!notesEl || !statusEl) return;
  notesEl.value = localStorage.getItem(STORAGE_KEYS.notes) || '';
  statusEl.textContent = 'Ready';
}

function loadAccount() {
  const storedAccount = localStorage.getItem(STORAGE_KEYS.account);
  if (!storedAccount) return 0;
  const parsed = Number.parseInt(storedAccount, 10);
  return Number.isNaN(parsed) ? 0 : Math.min(Math.max(parsed, 0), 3);
}

function setupEventListeners() {
  const accountSelect = document.getElementById('account-select');
  const notesEl = document.getElementById('quick-notes');
  const clearBtn = document.getElementById('notes-clear-btn');
  const statusEl = document.getElementById('notes-save-status');

  if (!accountSelect || !notesEl || !clearBtn || !statusEl) return;

  accountSelect.addEventListener('change', (event) => {
    const selected = Number.parseInt(event.target.value, 10);
    state.currentAccount = Number.isNaN(selected) ? 0 : selected;
    localStorage.setItem(STORAGE_KEYS.account, String(state.currentAccount));
    updateAppLinks(state.currentAccount);
  });

  notesEl.addEventListener('input', () => {
    statusEl.textContent = 'Saving...';
    clearTimeout(window.quickNotesTimer);
    window.quickNotesTimer = setTimeout(saveQuickNotes, 300);
  });

  clearBtn.addEventListener('click', () => {
    notesEl.value = '';
    localStorage.removeItem(STORAGE_KEYS.notes);
    statusEl.textContent = 'Cleared';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  state.currentAccount = loadAccount();
  const accountSelect = document.getElementById('account-select');
  if (accountSelect) {
    accountSelect.value = String(state.currentAccount);
  }

  updateAppLinks(state.currentAccount);
  loadQuickNotes();
  setupEventListeners();

  // PWA Service Worker registration (preserved)
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('sw.js')
        .then((reg) => console.log('Workspace Dashboard PWA: SW registered', reg.scope))
        .catch((err) => console.warn('SW registration failed', err));
    });
  }
});