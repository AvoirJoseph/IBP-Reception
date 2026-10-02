import React, { useState } from 'react';
import { 
  Copy, 
  ArrowSquareOut, 
  ChatText, 
  User, 
  CheckCircle, 
  Clock, 
  Package, 
  EnvelopeSimple, 
  PhoneCall, 
  DeviceMobile,
  Buildings,
  Archive,
  CaretUp,
  CaretDown,
  PencilSimple,
  Check,
  X,
  Plus
} from '@phosphor-icons/react';

export default function TicketTable({
  tickets,
  activeTab,
  onSelectAttorney,
  onOpenViberSnippet,
  onUpdateTicket,
  onDeleteTicket,
  onCopyText,
  searchQuery,
  visibleColumns = {},
  density = 'compact',
  sortConfig,
  onSort,
  onAddQuickTicket,
  categories = [],
  channels = []
}) {
  // Inline editing state: { ticketId, field }
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');

  // Quick Add Row State
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickRow, setQuickRow] = useState({
    date: new Date().toISOString().split('T')[0],
    name: '',
    rollNo: '',
    chapter: '',
    channel: 'VIBER',
    category: 'HELPDESK',
    subject: '',
    solution: '',
    trackingNo: '',
    notes: '',
    status: 'DONE'
  });

  const handleStartEdit = (ticket, field, currentVal) => {
    setEditingCell({ ticketId: ticket.id, field });
    setEditValue(currentVal || '');
  };

  const handleSaveEdit = (ticket) => {
    if (!editingCell) return;
    const { field } = editingCell;
    const updated = { ...ticket, [field]: editValue };

    // Auto-sync status and resolved if solution was edited
    if (field === 'solution') {
      const lower = editValue.toLowerCase();
      if (lower.includes('delivered') || lower === 'done' || lower === 'resolved') {
        updated.resolved = 'DONE';
      }
    }

    onUpdateTicket && onUpdateTicket(updated);
    setEditingCell(null);
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
  };

  const handleQuickAddSubmit = (e) => {
    e.preventDefault();
    if (!quickRow.name.trim() && !quickRow.rollNo.trim()) {
      alert('Please enter at least a Lawyer Name or Roll Number');
      return;
    }

    let type = 'GENERAL';
    if (activeTab === 'ID') type = 'ID_FOLLOWUP';
    else if (activeTab === 'FINANCE') type = 'FINANCE';

    onAddQuickTicket && onAddQuickTicket({
      ...quickRow,
      type,
      sheetName: activeTab === 'ID' ? 'Follow-up (ID) 2026' : activeTab === 'FINANCE' ? 'FINANCE 2026' : '2026',
      concern: quickRow.subject,
      resolved: quickRow.status === 'Delivered' || quickRow.status === 'DONE' ? 'DONE' : 'PENDING'
    });

    // Reset quick row
    setQuickRow({
      date: new Date().toISOString().split('T')[0],
      name: '',
      rollNo: '',
      chapter: '',
      channel: 'VIBER',
      category: 'HELPDESK',
      subject: '',
      solution: '',
      trackingNo: '',
      notes: '',
      status: 'DONE'
    });
    setIsQuickAddOpen(false);
  };

  const getChannelBadge = (channel) => {
    if (!channel) return null;
    const ch = channel.toUpperCase();
    let label = channel;
    let badgeClass = 'channel-badge';

    if (ch.includes('VIBER')) {
      badgeClass += ' viber';
      label = 'Viber';
    } else if (ch.includes('EMAIL')) {
      badgeClass += ' email';
      label = 'Email';
    } else if (ch.includes('HOTLINE') || ch.includes('LANDLINE') || ch.includes('TELEPHONE')) {
      badgeClass += ' hotline';
      label = ch.includes('HOTLINE') ? 'Hotline' : 'Landline';
    } else if (ch.includes('WALK')) {
      label = 'Walk-in';
    }

    return (
      <span className={badgeClass}>
        <span>{label}</span>
      </span>
    );
  };

  const getNormalizedStatus = (ticket) => {
    const raw = (ticket.status || '').toLowerCase();
    const sol = (ticket.solution || '').toLowerCase();
    const subj = (ticket.subject || ticket.concern || '').toLowerCase();
    const res = (ticket.resolved || '').toLowerCase();

    if (raw === 'delivered' || sol.includes('delivered')) {
      return { label: 'Delivered', key: 'delivered' };
    }
    if (raw.includes('pick-up') || raw.includes('claimed') || sol.includes('pick-up') || sol.includes('claimed') || subj.includes('pick-up')) {
      return { label: 'Claimed', key: 'pickup' };
    }
    if (sol.includes('for delivery') || sol.includes('waiting') || sol.includes('transit') || sol.includes('tracking') || raw.includes('transit')) {
      return { label: 'In Transit', key: 'transit' };
    }
    if (res === 'done' || raw === 'done' || (sol.length > 0 && !sol.includes('pending'))) {
      return { label: 'Done', key: 'done' };
    }
    return { label: 'Pending', key: 'pending' };
  };

  const getStatusChip = (ticket) => {
    const { label, key } = getNormalizedStatus(ticket);

    // Quick inline select for status
    if (editingCell?.ticketId === ticket.id && editingCell?.field === 'status_select') {
      return (
        <select
          autoFocus
          className="cell-inline-select"
          value={label}
          onChange={(e) => {
            const val = e.target.value;
            const updated = { 
              ...ticket, 
              status: val,
              resolved: (val === 'Delivered' || val === 'Done' || val === 'Claimed') ? 'DONE' : 'PENDING'
            };
            onUpdateTicket && onUpdateTicket(updated);
            setEditingCell(null);
          }}
          onBlur={() => setEditingCell(null)}
        >
          <option value="Done">Done</option>
          <option value="Delivered">Delivered</option>
          <option value="Claimed">Claimed</option>
          <option value="In Transit">In Transit</option>
          <option value="Pending">Pending</option>
        </select>
      );
    }

    return (
      <span 
        className={`status-pill status-${key}`}
        title="Click to change status"
        onClick={() => setEditingCell({ ticketId: ticket.id, field: 'status_select' })}
      >
        <span className="status-dot" />
        <span>{label}</span>
      </span>
    );
  };

  const renderSortHeader = (label, key, width = 'auto') => {
    const isSorted = sortConfig?.key === key;
    const direction = sortConfig?.direction;

    return (
      <th 
        style={{ width, cursor: 'pointer', userSelect: 'none' }}
        onClick={() => onSort && onSort(key)}
        className={isSorted ? 'sorted-header' : ''}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
          <span>{label}</span>
          <span className="sort-icon-box">
            {isSorted ? (
              direction === 'asc' ? <CaretUp size={12} weight="bold" /> : <CaretDown size={12} weight="bold" />
            ) : (
              <CaretDown size={10} style={{ opacity: 0.2 }} />
            )}
          </span>
        </div>
      </th>
    );
  };

  return (
    <div className={`table-container ${density === 'compact' ? 'table-compact-mode' : ''}`}>
      {/* Sheets Action Sub-bar */}
      <div className="table-header-bar">
        <div className="table-left-meta">
          <span className="table-count-label">
            <strong>{tickets.length}</strong> inquiries
          </span>
        </div>

        <div className="table-right-actions">
          <button
            type="button"
            className={`btn-table-action ${isQuickAddOpen ? 'active' : ''}`}
            onClick={() => setIsQuickAddOpen(!isQuickAddOpen)}
            title="Add a new row"
          >
            <Plus size={14} weight="bold" />
            <span>{isQuickAddOpen ? 'Cancel' : 'Add Row'}</span>
          </button>
        </div>
      </div>

      {/* Quick Add Row Drawer / Top Bar */}
      {isQuickAddOpen && (
        <form className="quick-add-bar" onSubmit={handleQuickAddSubmit}>
          <div className="quick-add-grid">
            <div className="quick-field">
              <label>Date</label>
              <input
                type="date"
                value={quickRow.date}
                onChange={(e) => setQuickRow({ ...quickRow, date: e.target.value })}
                required
              />
            </div>

            <div className="quick-field field-grow">
              <label>Lawyer Name</label>
              <input
                type="text"
                placeholder="e.g. ATTY. DELA CRUZ, JUAN"
                value={quickRow.name}
                onChange={(e) => setQuickRow({ ...quickRow, name: e.target.value.toUpperCase() })}
                required
              />
            </div>

            <div className="quick-field" style={{ width: '100px' }}>
              <label>Roll #</label>
              <input
                type="text"
                placeholder="e.g. 78910"
                value={quickRow.rollNo}
                onChange={(e) => setQuickRow({ ...quickRow, rollNo: e.target.value })}
              />
            </div>

            <div className="quick-field" style={{ width: '110px' }}>
              <label>Channel</label>
              <select
                value={quickRow.channel}
                onChange={(e) => setQuickRow({ ...quickRow, channel: e.target.value })}
              >
                <option value="VIBER">VIBER</option>
                <option value="LANDLINE">LANDLINE</option>
                <option value="EMAIL">EMAIL</option>
                <option value="HOTLINE">HOTLINE</option>
                <option value="TEXT">TEXT</option>
                <option value="WALK-IN">WALK-IN</option>
              </select>
            </div>

            <div className="quick-field field-grow">
              <label>Concern / Subject</label>
              <input
                type="text"
                placeholder="Inquiry concern..."
                value={quickRow.subject}
                onChange={(e) => setQuickRow({ ...quickRow, subject: e.target.value })}
                required
              />
            </div>

            <div className="quick-field field-grow">
              <label>Solution / Action</label>
              <input
                type="text"
                placeholder="Provided info / Sent copy..."
                value={quickRow.solution}
                onChange={(e) => setQuickRow({ ...quickRow, solution: e.target.value })}
              />
            </div>

            <div className="quick-field" style={{ width: '120px' }}>
              <label>Status</label>
              <select
                value={quickRow.status}
                onChange={(e) => setQuickRow({ ...quickRow, status: e.target.value })}
              >
                <option value="DONE">DONE</option>
                <option value="Delivered">Delivered</option>
                <option value="Claimed (Pick-up)">Claimed (Pick-up)</option>
                <option value="For delivery">For delivery</option>
                <option value="PENDING">PENDING</option>
              </select>
            </div>

            <div className="quick-actions">
              <button type="submit" className="btn-quick-save">
                <Check size={14} weight="bold" />
                <span>Save</span>
              </button>
              <button 
                type="button" 
                className="btn-quick-cancel"
                onClick={() => setIsQuickAddOpen(false)}
              >
                <X size={14} weight="bold" />
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Main Data Table */}
      {tickets.length === 0 ? (
        <div className="table-empty">
          <Archive size={36} weight="light" className="empty-icon" />
          <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '8px' }}>
            No records match the current view
          </h4>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {searchQuery 
              ? `No inquiries matching "${searchQuery}". Clear search or change filters.`
              : 'This sheet has no records.'}
          </p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                {visibleColumns.rowNo !== false && (
                  <th style={{ width: '42px', textAlign: 'center' }}>#</th>
                )}
                {visibleColumns.ticketId !== false && renderSortHeader('ID', 'id', '85px')}
                {visibleColumns.date !== false && renderSortHeader('Date', 'date', '90px')}
                {visibleColumns.lawyer !== false && renderSortHeader('Lawyer', 'name', '200px')}
                {visibleColumns.chapter !== false && renderSortHeader('Chapter', 'chapter', '125px')}
                {visibleColumns.channel !== false && renderSortHeader('Channel', 'channel', '95px')}
                {visibleColumns.category !== false && renderSortHeader('Category', 'category', '100px')}
                {visibleColumns.subject !== false && renderSortHeader('Concern', 'subject', '220px')}
                {visibleColumns.solution !== false && renderSortHeader('Resolution', 'solution', '220px')}
                {visibleColumns.status !== false && renderSortHeader('Status', 'status', '110px')}
                {visibleColumns.trackingNo !== false && renderSortHeader('Tracking #', 'trackingNo', '135px')}
                {visibleColumns.actions !== false && (
                  <th style={{ width: '75px', textAlign: 'right' }}>Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {tickets.map((t, index) => {
                const isId = t.type === 'ID_FOLLOWUP';
                const lbcTrackUrl = t.trackingNo 
                  ? `https://www.lbcexpress.com/track/?tracking_no=${t.trackingNo}` 
                  : null;

                return (
                  <tr key={t.id}>
                    {/* Row # */}
                    {visibleColumns.rowNo !== false && (
                      <td style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }}>
                        {index + 1}
                      </td>
                    )}

                    {/* Ticket # */}
                    {visibleColumns.ticketId !== false && (
                      <td>
                        <span className="cell-ticket-id">
                          {t.id}
                        </span>
                      </td>
                    )}

                    {/* Date */}
                    {visibleColumns.date !== false && (
                      <td style={{ whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                        {t.date || '—'}
                      </td>
                    )}

                    {/* Lawyer / Member */}
                    {visibleColumns.lawyer !== false && (
                      <td>
                        <div className="cell-lawyer">
                          <span 
                            className="lawyer-name" 
                            onClick={() => onSelectAttorney && onSelectAttorney(t)}
                            title="View attorney profile"
                          >
                            {t.name || 'NOT SPECIFIED'}
                          </span>
                          {t.rollNo && t.rollNo !== '-' && (
                            <span 
                              className="roll-tag"
                              title="Copy roll #"
                              onClick={(e) => {
                                e.stopPropagation();
                                onCopyText && onCopyText(t.rollNo, `Roll #${t.rollNo} copied`);
                              }}
                            >
                              #{t.rollNo}
                            </span>
                          )}
                        </div>
                      </td>
                    )}

                    {/* Chapter */}
                    {visibleColumns.chapter !== false && (
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        {t.chapter ? (
                          <span>{t.chapter}</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                    )}

                    {/* Channel */}
                    {visibleColumns.channel !== false && (
                      <td>
                        {editingCell?.ticketId === t.id && editingCell?.field === 'channel' ? (
                          <select
                            autoFocus
                            className="cell-inline-select"
                            value={t.channel || 'VIBER'}
                            onChange={(e) => {
                              onUpdateTicket && onUpdateTicket({ ...t, channel: e.target.value });
                              setEditingCell(null);
                            }}
                            onBlur={() => setEditingCell(null)}
                          >
                            <option value="VIBER">VIBER</option>
                            <option value="LANDLINE">LANDLINE</option>
                            <option value="EMAIL">EMAIL</option>
                            <option value="HOTLINE">HOTLINE</option>
                            <option value="TEXT">TEXT</option>
                            <option value="WALK-IN">WALK-IN</option>
                          </select>
                        ) : (
                          <div 
                            onClick={() => handleStartEdit(t, 'channel', t.channel)}
                            title="Click to change channel"
                            style={{ cursor: 'pointer' }}
                          >
                            {getChannelBadge(t.channel)}
                          </div>
                        )}
                      </td>
                    )}

                    {/* Category */}
                    {visibleColumns.category !== false && (
                      <td>
                        <span className="category-pill">
                          {t.category || (isId ? 'ID' : 'HELPDESK')}
                        </span>
                      </td>
                    )}

                    {/* Concern / Subject (Inline Editable) */}
                    {visibleColumns.subject !== false && (
                      <td>
                        {editingCell?.ticketId === t.id && editingCell?.field === 'subject' ? (
                          <div className="inline-edit-box">
                            <input
                              autoFocus
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveEdit(t);
                                if (e.key === 'Escape') handleCancelEdit();
                              }}
                            />
                            <button type="button" onClick={() => handleSaveEdit(t)} title="Save">
                              <Check size={12} weight="bold" />
                            </button>
                            <button type="button" onClick={handleCancelEdit} title="Cancel">
                              <X size={12} weight="bold" />
                            </button>
                          </div>
                        ) : (
                          <div 
                            className="editable-cell-content"
                            onClick={() => handleStartEdit(t, 'subject', t.subject || t.concern)}
                            title="Click to edit subject"
                          >
                            <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                              {t.subject || t.concern || '—'}
                            </span>
                            <PencilSimple size={11} className="cell-hover-pencil" />
                          </div>
                        )}
                      </td>
                    )}

                    {/* Solution / Resolution (Inline Editable) */}
                    {visibleColumns.solution !== false && (
                      <td>
                        {editingCell?.ticketId === t.id && editingCell?.field === 'solution' ? (
                          <div className="inline-edit-box">
                            <input
                              autoFocus
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveEdit(t);
                                if (e.key === 'Escape') handleCancelEdit();
                              }}
                            />
                            <button type="button" onClick={() => handleSaveEdit(t)} title="Save">
                              <Check size={12} weight="bold" />
                            </button>
                            <button type="button" onClick={handleCancelEdit} title="Cancel">
                              <X size={12} weight="bold" />
                            </button>
                          </div>
                        ) : (
                          <div 
                            className="editable-cell-content"
                            onClick={() => handleStartEdit(t, 'solution', t.solution)}
                            title="Click to edit solution / resolution"
                          >
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                              {t.solution || (t.notes ? `Note: ${t.notes}` : '—')}
                            </span>
                            <PencilSimple size={11} className="cell-hover-pencil" />
                          </div>
                        )}
                      </td>
                    )}

                    {/* Status */}
                    {visibleColumns.status !== false && (
                      <td>
                        {getStatusChip(t)}
                      </td>
                    )}

                    {/* LBC Tracking */}
                    {visibleColumns.trackingNo !== false && (
                      <td>
                        {editingCell?.ticketId === t.id && editingCell?.field === 'trackingNo' ? (
                          <div className="inline-edit-box">
                            <input
                              autoFocus
                              type="text"
                              placeholder="Tracking #..."
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveEdit(t);
                                if (e.key === 'Escape') handleCancelEdit();
                              }}
                            />
                            <button type="button" onClick={() => handleSaveEdit(t)} title="Save">
                              <Check size={12} weight="bold" />
                            </button>
                            <button type="button" onClick={handleCancelEdit} title="Cancel">
                              <X size={12} weight="bold" />
                            </button>
                          </div>
                        ) : t.trackingNo ? (
                          <div className="tracking-wrapper">
                            <a 
                              href={lbcTrackUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="tracking-link"
                              title="Track package"
                            >
                              <span>{t.trackingNo}</span>
                              <ArrowSquareOut size={11} weight="regular" />
                            </a>
                            <button
                              type="button"
                              className="copy-mini-btn"
                              title="Copy tracking #"
                              onClick={() => onCopyText && onCopyText(t.trackingNo, 'Tracking # copied')}
                            >
                              <Copy size={11} weight="regular" />
                            </button>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>—</span>
                        )}
                      </td>
                    )}

                    {/* Actions */}
                    {visibleColumns.actions !== false && (
                      <td>
                        <div className="row-actions">
                          <button
                            type="button"
                            className="action-icon-btn viber"
                            title="Generate Viber advisory message"
                            onClick={() => onOpenViberSnippet && onOpenViberSnippet(t)}
                          >
                            <ChatText size={15} weight="regular" />
                          </button>

                          <button
                            type="button"
                            className="action-icon-btn"
                            title="View Lawyer Profile & History"
                            onClick={() => onSelectAttorney && onSelectAttorney(t)}
                          >
                            <User size={15} weight="regular" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
