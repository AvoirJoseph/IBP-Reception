import React, { useState, useRef } from 'react';
import { 
  Tray, 
  IdentificationCard, 
  Receipt, 
  Handbag, 
  CalendarCheck,
  Funnel,
  ArrowClockwise,
  SlidersHorizontal,
  Table,
  Columns,
  Check,
  FileArrowUp,
  FileArrowDown,
  Rows
} from '@phosphor-icons/react';

export default function FilterBar({
  activeTab,
  setActiveTab,
  statusFilter,
  setStatusFilter,
  channelFilter,
  setChannelFilter,
  chapterFilter,
  setChapterFilter,
  chapters = [],
  counts = {},
  onResetFilters,
  isFiltered,
  visibleColumns = {},
  onToggleColumn,
  density = 'compact',
  setDensity,
  onImportExcel,
  onExportExcel
}) {
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const fileInputRef = useRef(null);

  const columnLabels = [
    { key: 'rowNo', label: 'Row #' },
    { key: 'ticketId', label: 'Ticket ID' },
    { key: 'date', label: 'Date' },
    { key: 'lawyer', label: 'Lawyer Name & Roll #' },
    { key: 'chapter', label: 'Chapter' },
    { key: 'channel', label: 'Channel' },
    { key: 'category', label: 'Category' },
    { key: 'subject', label: 'Concern / Subject' },
    { key: 'solution', label: 'Solution / Notes' },
    { key: 'status', label: 'Status' },
    { key: 'trackingNo', label: 'LBC Tracking #' },
    { key: 'actions', label: 'Actions' }
  ];

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportExcel && onImportExcel(file);
      e.target.value = '';
    }
  };

  return (
    <div className="sheets-control-panel">
      {/* 1. Google Sheets Style Workbook Tabs */}
      <div className="sheets-tab-bar">
        <div className="sheets-tabs-list">
          {/* All */}
          <button
            type="button"
            className={`sheet-tab-item tab-all ${activeTab === 'ALL' ? 'active' : ''}`}
            onClick={() => setActiveTab('ALL')}
          >
            <span className="tab-title">All</span>
            <span className="tab-badge">{counts.all || 0}</span>
          </button>

          {/* General Inquiries */}
          <button
            type="button"
            className={`sheet-tab-item tab-general ${activeTab === 'GENERAL' ? 'active' : ''}`}
            onClick={() => setActiveTab('GENERAL')}
          >
            <span className="tab-title">General</span>
            <span className="tab-badge">{counts.general || 0}</span>
          </button>

          {/* ID Follow-up */}
          <button
            type="button"
            className={`sheet-tab-item tab-id ${activeTab === 'ID' ? 'active' : ''}`}
            onClick={() => setActiveTab('ID')}
          >
            <span className="tab-title">ID Courier</span>
            <span className="tab-badge">{counts.id || 0}</span>
          </button>

          {/* Finance */}
          <button
            type="button"
            className={`sheet-tab-item tab-finance ${activeTab === 'FINANCE' ? 'active' : ''}`}
            onClick={() => setActiveTab('FINANCE')}
          >
            <span className="tab-title">Finance</span>
            <span className="tab-badge">{counts.finance || 0}</span>
          </button>

          {/* Pick-Up */}
          <button
            type="button"
            className={`sheet-tab-item tab-pickup ${activeTab === 'PICKUP' ? 'active' : ''}`}
            onClick={() => setActiveTab('PICKUP')}
          >
            <span className="tab-title">Pick-Up</span>
            <span className="tab-badge">{counts.pickup || 0}</span>
          </button>

          {/* Today */}
          <button
            type="button"
            className={`sheet-tab-item tab-today ${activeTab === 'TODAY' ? 'active' : ''}`}
            onClick={() => setActiveTab('TODAY')}
          >
            <span className="tab-title">Today</span>
            <span className="tab-badge">{counts.today || 0}</span>
          </button>
        </div>

        {/* Workbook Sync Actions */}
        <div className="sheets-sync-actions">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".xlsx, .xls" 
            style={{ display: 'none' }} 
          />
          <button
            type="button"
            className="btn-sheet-tool"
            onClick={() => fileInputRef.current?.click()}
            title="Import Excel file"
          >
            <FileArrowUp size={14} weight="regular" />
            <span>Import</span>
          </button>
        </div>
      </div>

      {/* 2. Google Sheets Toolbar (Filters, Column Manager, Density) */}
      <div className="sheets-toolbar">
        <div className="toolbar-left">
          {/* Status Filter */}
          <select
            className="toolbar-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by Status"
          >
            <option value="ALL">All Statuses</option>
            <option value="Done">Done</option>
            <option value="Delivered">Delivered</option>
            <option value="Claimed">Claimed / Pick-up</option>
            <option value="Transit">In Transit</option>
            <option value="Pending">Pending</option>
          </select>

          {/* Channel Filter */}
          <select
            className="toolbar-select"
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            aria-label="Filter by Channel"
          >
            <option value="ALL">All Channels</option>
            <option value="VIBER">Viber</option>
            <option value="LANDLINE">Landline</option>
            <option value="EMAIL">Email</option>
            <option value="HOTLINE">Hotline</option>
            <option value="WALK-IN">Walk-In</option>
          </select>

          {/* Chapter Filter */}
          <select
            className="toolbar-select"
            value={chapterFilter}
            onChange={(e) => setChapterFilter(e.target.value)}
            aria-label="Filter by Chapter"
          >
            <option value="ALL">All Chapters</option>
            {chapters.map((ch) => (
              <option key={ch} value={ch}>{ch}</option>
            ))}
          </select>

          {/* Reset Filters */}
          {isFiltered && (
            <button
              type="button"
              className="toolbar-reset-btn"
              onClick={onResetFilters}
              title="Reset all filters"
            >
              <ArrowClockwise size={12} weight="bold" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Toolbar Right: Customization Controls */}
        <div className="toolbar-right">
          {/* Density Toggle (Compact Google Sheets vs Comfortable) */}
          <div className="density-toggle" title="Switch between Google Sheets compact grid and comfortable view">
            <button
              type="button"
              className={`density-btn ${density === 'compact' ? 'active' : ''}`}
              onClick={() => setDensity('compact')}
              title="Compact (Google Sheets Grid)"
            >
              <Rows size={14} weight="regular" />
              <span>Compact</span>
            </button>
            <button
              type="button"
              className={`density-btn ${density === 'comfortable' ? 'active' : ''}`}
              onClick={() => setDensity('comfortable')}
              title="Comfortable cards view"
            >
              <Table size={14} weight="regular" />
              <span>Comfortable</span>
            </button>
          </div>

          {/* Column Customizer Dropdown */}
          <div className="column-customizer-container">
            <button
              type="button"
              className={`btn-toolbar-dropdown ${showColumnMenu ? 'active' : ''}`}
              onClick={() => setShowColumnMenu(!showColumnMenu)}
              title="Customize which columns are displayed in the spreadsheet"
            >
              <Columns size={14} weight="regular" />
              <span>Columns</span>
            </button>

            {showColumnMenu && (
              <div className="column-dropdown-menu">
                <div className="column-menu-header">
                  <span>Show / Hide Columns</span>
                  <button 
                    type="button" 
                    className="close-menu-btn"
                    onClick={() => setShowColumnMenu(false)}
                  >
                    ×
                  </button>
                </div>
                <div className="column-checkboxes-list">
                  {columnLabels.map(({ key, label }) => {
                    const isChecked = visibleColumns[key] !== false;
                    return (
                      <label key={key} className="column-checkbox-item">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => onToggleColumn && onToggleColumn(key)}
                        />
                        <span>{label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
