// Register Service Worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

// HYBRID LAUNCHER: Handles Extensions vs PWA
function launchApp(url) {
  // Check if we are running inside a Chrome Extension context
  const isExtension = (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id);
  
  if (isExtension) {
    // If inside the side panel extension, open in a standard new tab safely
    window.open(url, '_blank');
  } else {
    // If running as the standalone PWA, open as a native-looking floating window
    window.open(url, '_blank', 'width=1100,height=800,menubar=no,toolbar=no,location=no,status=no');
  }
}

// QUICK NOTES LOGIC
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
