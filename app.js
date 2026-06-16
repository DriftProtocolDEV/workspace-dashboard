// Workspace Dashboard - Premium Static PWA
// Strict: No chrome.* APIs, no secrets, frontend-only.
// Uses popup windows for app-like experience instead of tabs or blocked iframes.

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(registration => {
        console.log('Workspace Dashboard PWA: Service Worker registered', registration.scope);
      })
      .catch(err => {
        console.warn('Service Worker registration failed:', err);
      });
  });
}

// State
let currentAccount = 0;

// Helper to build account-aware URL
function getAccountUrl(baseUrl) {
  if (!baseUrl) return 'https://www.google.com';
  
  // Handle special cases
  if (baseUrl.includes('gemini.google.com')) {
    return `${baseUrl}${currentAccount}`;
  }
  
  // Standard u/account pattern
  if (baseUrl.includes('/u/')) {
    return baseUrl.replace(/\/u\/\d+\//, `/u/${currentAccount}/`);
  }
  
  // Fallback: append authuser
  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}authuser=${currentAccount}`;
}

// Premium window.open for app-like popups (bypasses tab experience)
function launchApp(url, title) {
  const finalUrl = getAccountUrl(url);
  
  // Use specific features to create clean, floating "app" windows
  const features = 'width=1100,height=800,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes';
  
  const popup = window.open(finalUrl, `_blank_${Date.now()}`, features);
  
  if (popup) {
    popup.focus();
    // Optional: update UI to show launched state
    console.log(`Launched ${title} for account ${currentAccount}`);
  } else {
    alert('Popup blocked. Please allow popups for this site and try again.');
  }
}

// Quick Notes - localStorage persistence
const notesTextarea = document.getElementById('quick-notes');
const saveStatus = document.getElementById('save-status');
const clearBtn = document.getElementById('clear-notes');

const NOTES_KEY = 'workspace-dashboard-notes';
let saveTimer = null;

function loadNotes() {
  if (!notesTextarea) return;
  
  const saved = localStorage.getItem(NOTES_KEY);
  if (saved) {
    notesTextarea.value = saved;
    updateSaveStatus('Loaded from device');
    setTimeout(() => updateSaveStatus('Saved locally'), 1200);
  } else {
    updateSaveStatus('Ready');
  }
}

function saveNotes() {
  if (!notesTextarea) return;
  
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    localStorage.setItem(NOTES_KEY, notesTextarea.value);
    updateSaveStatus('Saved');
    
    // Fade the status
    setTimeout(() => {
      if (saveStatus.textContent === 'Saved') {
        updateSaveStatus('Auto-saved');
      }
    }, 1400);
  }, 350);
}

function updateSaveStatus(message) {
  if (saveStatus) {
    saveStatus.textContent = message;
  }
}

function clearNotes() {
  if (!notesTextarea || !confirm('Clear all quick notes?')) return;
  
  notesTextarea.value = '';
  localStorage.removeItem(NOTES_KEY);
  updateSaveStatus('Cleared');
  
  setTimeout(() => updateSaveStatus('Ready'), 900);
}

// Setup Account Switcher
function setupAccountSwitcher() {
  const select = document.getElementById('account-select');
  if (!select) return;
  
  // Restore previous selection
  const saved = localStorage.getItem('workspace-current-account');
  if (saved !== null) {
    currentAccount = parseInt(saved, 10);
    select.value = currentAccount;
  }
  
  select.addEventListener('change', (e) => {
    currentAccount = parseInt(e.target.value, 10);
    localStorage.setItem('workspace-current-account', currentAccount);
    
    // Visual feedback
    const originalColor = select.style.borderColor;
    select.style.borderColor = '#6366f1';
    setTimeout(() => {
      select.style.borderColor = originalColor || '';
    }, 600);
  });
}

// Setup Launcher Buttons (JS-driven popups, no target=_blank anchors)
function setupLauncher() {
  const buttons = document.querySelectorAll('.app-button');
  
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const url = button.getAttribute('data-url');
      const title = button.querySelector('.app-name')?.textContent || 'App';
      
      if (url) {
        // Add subtle pressed state
        button.style.transform = 'scale(0.97)';
        setTimeout(() => {
          button.style.transform = '';
        }, 120);
        
        launchApp(url, title);
      }
    });
    
    // Keyboard accessibility
    button.setAttribute('tabindex', '0');
    button.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        button.click();
      }
    });
  });
}

// Setup Notes
function setupNotes() {
  if (!notesTextarea) return;
  
  loadNotes();
  
  notesTextarea.addEventListener('input', () => {
    updateSaveStatus('Saving...');
    saveNotes();
  });
  
  notesTextarea.addEventListener('focus', () => {
    updateSaveStatus('Editing...');
  });
  
  notesTextarea.addEventListener('blur', () => {
    updateSaveStatus('Saved locally');
  });
  
  if (clearBtn) {
    clearBtn.addEventListener('click', clearNotes);
  }
}

// Keyboard shortcuts (premium app feel)
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Focus notes with /
    if (e.key === '/' && document.activeElement.tagName === 'BODY') {
      e.preventDefault();
      if (notesTextarea) notesTextarea.focus();
    }
    
    // Cmd/Ctrl + K to focus account switcher
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      const select = document.getElementById('account-select');
      if (select) select.focus();
    }
  });
}

// Initialize everything
function init() {
  setupAccountSwitcher();
  setupLauncher();
  setupNotes();
  setupKeyboardShortcuts();
  
  // Optional: show initial save status
  if (saveStatus) {
    setTimeout(() => {
      if (saveStatus.textContent.includes('Loaded') || saveStatus.textContent === 'Ready') {
        // already handled
      }
    }, 800);
  }
  
  console.log('%c[Workspace Dashboard] Premium PWA initialized. Notes in localStorage only. Popups for app experience.', 'color:#64748b');
}

// Boot
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Expose minimal debug API
window.WorkspaceDebug = {
  clearAll: () => {
    localStorage.clear();
    location.reload();
  },
  getCurrentAccount: () => currentAccount
};