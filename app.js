// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

// Hybrid App Launcher (Tab vs App Window)
function launchApp(url) {
  const isExtension = (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id);
  
  if (isExtension) {
    window.open(url, '_blank');
  } else {
    window.open(url, '_blank', 'width=1100,height=800,menubar=no,toolbar=no,location=no,status=no');
  }
}

// Quick Notes Autosave Logic
const notesArea = document.getElementById('notes-area');
const clearBtn = document.getElementById('clear-btn');

window.addEventListener('DOMContentLoaded', () => {
  const savedNotes = localStorage.getItem('workspace_notes');
  if (savedNotes) {
    notesArea.value = savedNotes;
  }
});

notesArea.addEventListener('input', () => {
  localStorage.setItem('workspace_notes', notesArea.value);
});

clearBtn.addEventListener('click', () => {
  if(confirm('Clear all quick notes?')) {
    notesArea.value = '';
    localStorage.removeItem('workspace_notes');
  }
});
