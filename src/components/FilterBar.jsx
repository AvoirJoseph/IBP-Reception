import React from 'react';
import { 
  Tray, 
  IdentificationCard, 
  Receipt, 
  Handbag, 
  CalendarCheck,
  Funnel,
  ArrowClockwise
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
  chapters,
  counts,
  onResetFilters,
  isFiltered
}) {
  return (
    <div className="filter-card">
      <div className="filter-top">
        {/* Main Tab Switches */}
        <div className="tab-group" role="tablist">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'ALL' ? 'active' : ''}`}
            onClick={() => setActiveTab('ALL')}
          >
            <Tray size={16} weight="regular" />
            <span>All Records</span>
            <span className="tab-count">{counts.all}</span>
          </button>

          <button
            type="button"
            className={`tab-btn ${activeTab === 'ID' ? 'active' : ''}`}
            onClick={() => setActiveTab('ID')}
          >
            <IdentificationCard size={16} weight="regular" />
            <span>ID Follow-Up</span>
            <span className="tab-count">{counts.id}</span>
          </button>

          <button
            type="button"
            className={`tab-btn ${activeTab === 'FINANCE' ? 'active' : ''}`}
            onClick={() => setActiveTab('FINANCE')}
          >
            <Receipt size={16} weight="regular" />
            <span>Finance & Invoices</span>
            <span className="tab-count">{counts.finance}</span>
          </button>

          <button
            type="button"
            className={`tab-btn ${activeTab === 'PICKUP' ? 'active' : ''}`}
            onClick={() => setActiveTab('PICKUP')}
          >
            <Handbag size={16} weight="regular" />
            <span>Office Pick-Up</span>
            <span className="tab-count">{counts.pickup}</span>
          </button>

          <button
            type="button"
            className={`tab-btn ${activeTab === 'TODAY' ? 'active' : ''}`}
            onClick={() => setActiveTab('TODAY')}
          >
            <CalendarCheck size={16} weight="regular" />
            <span>Today's Queue</span>
            <span className="tab-count">{counts.today}</span>
          </button>
        </div>

        {/* Filter Controls Row */}
        <div className="filter-controls">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
            <Funnel size={14} weight="regular" />
            <span>Filter by:</span>
          </div>

          {/* Status Filter */}
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by Status"
          >
            <option value="ALL">All Statuses</option>
            <option value="Delivered">Delivered</option>
            <option value="Claimed (Pick-up)">Claimed (Pick-up)</option>
            <option value="For delivery">For Delivery / In Transit</option>
            <option value="Waiting">Waiting / To Send Tracking</option>
            <option value="DONE">Done / Resolved</option>
          </select>

          {/* Channel Filter (especially for Finance) */}
          <select
            className="filter-select"
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            aria-label="Filter by Channel"
          >
            <option value="ALL">All Channels</option>
            <option value="VIBER">Viber (63%)</option>
            <option value="EMAIL">Email</option>
            <option value="HOTLINE">Hotline</option>
            <option value="LANDLINE">Landline</option>
            <option value="MESSENGER">Messenger</option>
            <option value="WALK-IN">Walk-In</option>
          </select>

          {/* Chapter Filter */}
          <select
            className="filter-select"
            value={chapterFilter}
            onChange={(e) => setChapterFilter(e.target.value)}
            aria-label="Filter by Chapter"
          >
            <option value="ALL">All Chapters</option>
            {chapters.map((ch) => (
              <option key={ch} value={ch}>{ch}</option>
            ))}
          </select>

          {isFiltered && (
            <button
              type="button"
              className="filter-reset-btn"
              onClick={onResetFilters}
              title="Reset all filters"
            >
              <ArrowClockwise size={13} weight="regular" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
