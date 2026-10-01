import React, { useEffect } from 'react';
import { 
  Scales, 
  MagnifyingGlass, 
  Plus, 
  Sun, 
  Moon, 
  FileArrowDown,
  ClockCounterClockwise
} from '@phosphor-icons/react';

export default function Header({ 
  searchQuery, 
  setSearchQuery, 
  onOpenNewModal, 
  theme, 
  setTheme, 
  todayCount,
  onExportExcel
}) {
  // Global shortcut '/' to focus search, and 'Ctrl+N' to open new modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        const searchInput = document.getElementById('global-search-input');
        if (searchInput) searchInput.focus();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        onOpenNewModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenNewModal]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('ibp_theme', nextTheme);
  };

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <header className="header">
      <div className="header-inner">
        {/* Brand */}
        <div className="brand-section">
          <div className="brand-crest">
            <Scales size={24} weight="bold" />
          </div>
          <div className="brand-titles">
            <div className="brand-title">
              IBP Helpdesk Tracker
              <span className="brand-tag">Reception</span>
            </div>
            <span className="brand-subtitle">Integrated Bar of the Philippines — National Office</span>
          </div>
        </div>

        {/* Global Search */}
        <div className="header-search">
          <div className="search-input-wrapper">
            <MagnifyingGlass size={18} weight="regular" className="search-icon" />
            <input
              id="global-search-input"
              type="text"
              className="search-input"
              placeholder="Search by Roll No, Lawyer Name, Chapter, or Tracking #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <kbd className="search-shortcut">/</kbd>
          </div>
        </div>

        {/* Actions & Utilities */}
        <div className="header-actions">
          <div className="today-badge" title="Live status for today's intake queue">
            <span className="today-dot"></span>
            <span>{currentDateFormatted}</span>
            <span style={{ opacity: 0.6 }}>|</span>
            <strong>{todayCount} Inquiries Today</strong>
          </div>

          <button 
            type="button" 
            className="btn-secondary"
            onClick={onExportExcel}
            title="Export live records to official Excel file"
          >
            <FileArrowDown size={18} weight="regular" />
            <span>Export Excel</span>
          </button>

          <button
            type="button"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label="Toggle visual theme"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <Sun size={18} weight="regular" />
            ) : (
              <Moon size={18} weight="regular" />
            )}
          </button>

          <button
            type="button"
            className="btn-primary"
            onClick={onOpenNewModal}
            title="Log a new inquiry (Ctrl+N)"
          >
            <Plus size={18} weight="bold" />
            <span>New Inquiry</span>
          </button>
        </div>
      </div>
    </header>
  );
}
