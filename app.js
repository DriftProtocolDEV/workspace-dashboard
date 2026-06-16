// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js');
  });
}

// Handle Quick Notes LocalStorage
const notesArea = document.getElementById('notes-area');
const clearBtn = document.getElementById('clear-btn');

// Load saved notes on startup
window.addEventListener('DOMContentLoaded', () => {
  const savedNotes = localStorage.getItem('workspace_notes');
  if (savedNotes) {
    notesArea.value = savedNotes;
  }
});

// Save notes automatically as you type
notesArea.addEventListener('input', () => {
  localStorage.setItem('workspace_notes', notesArea.value);
});

// Clear notes button
clearBtn.addEventListener('click', () => {
  if(confirm('Clear all notes?')) {
    notesArea.value = '';
    localStorage.removeItem('workspace_notes');
  }
});
