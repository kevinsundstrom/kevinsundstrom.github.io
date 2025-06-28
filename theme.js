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
      themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
      themeToggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
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