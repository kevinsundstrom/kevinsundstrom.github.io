// Theme Management JavaScript - Shared across all pages
// This file handles dark/light mode functionality for the Kevin Sundstrom website

(function() {
  'use strict';
  
  function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const root = document.documentElement;
    
    // Exit if theme toggle elements are not present on this page
    if (!themeToggle || !themeIcon) {
      return;
    }
    
    // Check for saved theme preference or default to system preference
    function getPreferredTheme() {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        return savedTheme;
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    // Set theme
    function setTheme(theme) {
      root.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
      themeIcon.textContent = theme === 'dark' ? '☀️' : '🌕';
      themeIcon.setAttribute('aria-hidden', 'true');
      themeToggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
      themeToggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
      
      // Add screen reader announcement
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = `Switched to ${theme} mode`;
      document.body.appendChild(announcement);
      setTimeout(() => document.body.removeChild(announcement), 1000);
    }
    
    // Initialize theme
    setTheme(getPreferredTheme());
    
    // Theme toggle event listener
    themeToggle.addEventListener('click', () => {
      const currentTheme = root.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
    });
    
    // Listen for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    });
  }
  
  // Initialize theme when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme);
  } else {
    initTheme();
  }
})();

// Scroll progress bar (lightweight, respects reduced motion)
(function() {
  'use strict';
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const update = () => {
    const doc = document.documentElement;
    const scrollTop = doc.scrollTop || document.body.scrollTop;
    const height = doc.scrollHeight - doc.clientHeight;
    const progress = height > 0 ? scrollTop / height : 0;
    const scale = Math.max(0, Math.min(1, progress));
    if (reduce) {
      bar.style.width = `${scale * 100}%`;
    } else {
      bar.style.transform = `scaleX(${scale})`;
    }
  };
  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
})();