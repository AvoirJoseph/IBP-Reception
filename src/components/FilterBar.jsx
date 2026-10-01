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
          {/* 2026 General Inquiries */}
          <button
            type="button"
            className={`sheet-tab-item tab-general ${activeTab === 'GENERAL' ? 'active' : ''}`}
            onClick={() => setActiveTab('GENERAL')}
            title="General receptionist intake log (2026 sheet)"
          >
            <span className="tab-indicator green"></span>
            <span className="tab-title">2026 (Inquiries)</span>
            <span className="tab-badge">{counts.general || 0}</span>
          </button>

          {/* Follow-up (ID) 2026 */}
          <button
            type="button"
            className={`sheet-tab-item tab-id ${activeTab === 'ID' ? 'active' : ''}`}
            onClick={() => setActiveTab('ID')}
            title="ID dispatch and courier tracker"
          >
            <span className="tab-indicator blue"></span>
            <span className="tab-title">Follow-up (ID) 2026</span>
            <span className="tab-badge">{counts.id || 0}</span>
          </button>

          {/* FINANCE 2026 */}
          <button
            type="button"
            className={`sheet-tab-item tab-finance ${activeTab === 'FINANCE' ? 'active' : ''}`}
            onClick={() => setActiveTab('FINANCE')}
            title="Finance, official receipts, and invoices"
          >
            <span className="tab-indicator purple"></span>
            <span className="tab-title">FINANCE 2026</span>
            <span className="tab-badge">{counts.finance || 0}</span>
          </button>

          {/* All Records Combined */}
          <button
            type="button"
            className={`sheet-tab-item tab-all ${activeTab === 'ALL' ? 'active' : ''}`}
            onClick={() => setActiveTab('ALL')}
            title="All 2026 records combined across all sheets"
          >
            <span className="tab-indicator amber"></span>
            <span className="tab-title">All Records</span>
            <span className="tab-badge">{counts.all || 0}</span>
          </button>

          {/* Pick-Up Filter */}
          <button
            type="button"
            className={`sheet-tab-item tab-pickup ${activeTab === 'PICKUP' ? 'active' : ''}`}
            onClick={() => setActiveTab('PICKUP')}
            title="Claimed or queued for 3rd floor office pick-up"
          >
            <span className="tab-indicator indigo"></span>
            <span className="tab-title">Pick-Up Only</span>
            <span className="tab-badge">{counts.pickup || 0}</span>
          </button>

          {/* Today's Log */}
          <button
            type="button"
            className={`sheet-tab-item tab-today ${activeTab === 'TODAY' ? 'active' : ''}`}
            onClick={() => setActiveTab('TODAY')}
            title="Entries for today"
          >
            <span className="tab-indicator red"></span>
            <span className="tab-title">Today's Log</span>
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
            title="Upload/Sync updated HELPDESK Tracker.xlsx file"
          >
            <FileArrowUp size={15} weight="regular" />
            <span>Import Excel</span>
          </button>

          <button
            type="button"
            className="btn-sheet-tool export"
            onClick={onExportExcel}
            title="Export all sheets to official Excel .xlsx file"
          >
            <FileArrowDown size={15} weight="regular" />
            <span>Export .xlsx</span>
          </button>
        </div>
      </div>

      {/* 2. Google Sheets Toolbar (Filters, Column Manager, Density) */}
      <div className="sheets-toolbar">
        <div className="toolbar-left">
          <div className="toolbar-label">
            <Funnel size={14} weight="regular" />
            <span>Filter:</span>
          </div>

          {/* Status Filter */}
          <select
            className="toolbar-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by Status"
          >
            <option value="ALL">All Statuses</option>
            <option value="Delivered">Delivered</option>
            <option value="Claimed (Pick-up)">Claimed (Pick-up)</option>
            <option value="For delivery">For Delivery / In Transit</option>
            <option value="DONE">DONE</option>
            <option value="PENDING">PENDING</option>
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
              <ArrowClockwise size={13} weight="bold" />
              <span>Clear Filters</span>
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
