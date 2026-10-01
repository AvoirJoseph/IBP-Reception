import React from 'react';
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
  Archive
} from '@phosphor-icons/react';

export default function TicketTable({
  tickets,
  onSelectAttorney,
  onOpenViberSnippet,
  onStatusChange,
  onCopyText,
  searchQuery
}) {
  const getChannelBadge = (channel) => {
    if (!channel) return null;
    const ch = channel.toUpperCase();
    let icon = <DeviceMobile size={13} weight="regular" />;
    let badgeClass = 'channel-badge';

    if (ch.includes('VIBER')) {
      badgeClass += ' viber';
      icon = <ChatText size={13} weight="regular" />;
    } else if (ch.includes('EMAIL')) {
      badgeClass += ' email';
      icon = <EnvelopeSimple size={13} weight="regular" />;
    } else if (ch.includes('HOTLINE') || ch.includes('LANDLINE') || ch.includes('TELEPHONE')) {
      badgeClass += ' hotline';
      icon = <PhoneCall size={13} weight="regular" />;
    } else if (ch.includes('WALK')) {
      icon = <Buildings size={13} weight="regular" />;
    }

    return (
      <span className={badgeClass}>
        {icon}
        <span>{channel}</span>
      </span>
    );
  };

  const getStatusChip = (ticket) => {
    const status = ticket.solution || ticket.resolved || 'PENDING';
    const sLower = status.toLowerCase();

    let chipClass = 'status-chip';
    let icon = <Clock size={12} weight="bold" />;

    if (sLower.includes('delivered') || sLower === 'done' || sLower === 'resolved') {
      chipClass += ' delivered';
      icon = <CheckCircle size={12} weight="bold" />;
    } else if (sLower.includes('pick-up') || sLower.includes('claimed')) {
      chipClass += ' pickup';
      icon = <Package size={12} weight="bold" />;
    } else if (sLower.includes('delivery') || sLower.includes('transit')) {
      chipClass += ' transit';
      icon = <Clock size={12} weight="bold" />;
    } else {
      chipClass += ' pending';
    }

    return (
      <span 
        className={chipClass}
        title="Click to toggle status"
        onClick={() => onStatusChange && onStatusChange(ticket)}
        style={{ cursor: 'pointer' }}
      >
        {icon}
        <span>{status}</span>
      </span>
    );
  };

  if (tickets.length === 0) {
    return (
      <div className="table-container">
        <div className="table-empty">
          <Archive size={40} weight="light" className="empty-icon" />
          <h4 style={{ fontWeight: 600, color: 'var(--text-primary)' }}>No matching records found</h4>
          <p style={{ fontSize: '0.82rem' }}>
            {searchQuery 
              ? `No inquiries matched "${searchQuery}". Try searching by Roll Number or Lawyer Name.`
              : 'There are no inquiries in this category.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="table-container">
      <div className="table-header-bar">
        <span className="table-count-label">
          Showing <strong>{tickets.length}</strong> inquiries
        </span>
        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
          Tip: Click any lawyer's name to view their complete inquiry history
        </span>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '90px' }}>Ticket #</th>
              <th style={{ width: '100px' }}>Date</th>
              <th style={{ width: '240px' }}>Lawyer</th>
              <th style={{ width: '130px' }}>Channel / Type</th>
              <th style={{ minWidth: '200px' }}>Inquiry / Subject</th>
              <th style={{ minWidth: '180px' }}>Resolution / Solution</th>
              <th style={{ width: '140px' }}>Status</th>
              <th style={{ width: '180px' }}>LBC Tracking</th>
              <th style={{ width: '90px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => {
              const isId = t.type === 'ID_FOLLOWUP';
              const lbcTrackUrl = t.trackingNo 
                ? `https://www.lbcexpress.com/track/?tracking_no=${t.trackingNo}` 
                : null;

              return (
                <tr key={t.id}>
                  {/* Ticket # */}
                  <td>
                    <span className="cell-ticket-id">
                      {t.id}
                      {t.dailyNo && (
                        <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                          Daily #{t.dailyNo}
                        </span>
                      )}
                    </span>
                  </td>

                  {/* Date */}
                  <td style={{ whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                    {t.date}
                  </td>

                  {/* Lawyer */}
                  <td>
                    <div className="cell-lawyer">
                      <span 
                        className="lawyer-name" 
                        onClick={() => onSelectAttorney && onSelectAttorney(t)}
                        title="Click to view full inquiry history"
                      >
                        <User size={13} weight="regular" style={{ opacity: 0.6 }} />
                        {t.name || 'Not Specified'}
                      </span>
                      <div className="lawyer-meta">
                        {t.rollNo && t.rollNo !== '-' && (
                          <span className="roll-tag">Roll #{t.rollNo}</span>
                        )}
                        {t.chapter && (
                          <span className="chapter-tag">• {t.chapter}</span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Channel / Type */}
                  <td>
                    {isId ? (
                      <span className="channel-badge" style={{ background: 'var(--navy-subtle)', color: '#60A5FA', borderColor: 'rgba(96, 165, 250, 0.2)' }}>
                        <Package size={13} weight="regular" />
                        <span>ID Dispatch</span>
                      </span>
                    ) : (
                      getChannelBadge(t.channel)
                    )}
                  </td>

                  {/* Concern / Subject */}
                  <td>
                    <div style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: '2px' }}>
                      {t.subject || t.concern || '—'}
                    </div>
                    {t.notes && (
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        Note: {t.notes}
                      </div>
                    )}
                  </td>

                  {/* Resolution / Solution */}
                  <td>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block' }}>
                      {t.solution || '—'}
                    </span>
                    {t.paymentNotes && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--gold-primary)', display: 'block', marginTop: '2px' }}>
                        Courier fee: {t.paymentNotes}
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td>
                    {getStatusChip(t)}
                  </td>

                  {/* LBC Tracking */}
                  <td>
                    {t.trackingNo ? (
                      <div className="tracking-wrapper">
                        <a 
                          href={lbcTrackUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="tracking-link"
                          title="Open official LBC Express tracking page"
                        >
                          <span>{t.trackingNo}</span>
                          <ArrowSquareOut size={13} weight="regular" />
                        </a>
                        <button
                          type="button"
                          className="copy-mini-btn"
                          title="Copy tracking number"
                          onClick={() => onCopyText && onCopyText(t.trackingNo, 'LBC Tracking # copied to clipboard')}
                        >
                          <Copy size={12} weight="regular" />
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>
                        {isId ? (t.solution === 'Claimed (Pick-up)' ? 'Claimed at Office' : 'Not Assigned') : 'N/A'}
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td>
                    <div className="row-actions">
                      <button
                        type="button"
                        className="action-icon-btn viber"
                        title="Generate Viber / Email advisory message"
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
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
