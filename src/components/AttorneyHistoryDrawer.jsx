import React from 'react';
import { 
  X, 
  User, 
  Copy, 
  IdentificationCard, 
  Receipt, 
  Calendar, 
  MapPin, 
  CheckCircle,
  Package,
  ChatText
} from '@phosphor-icons/react';

export default function AttorneyHistoryDrawer({
  selectedLawyer,
  onClose,
  allTickets,
  onCopyText,
  onOpenViberSnippet
}) {
  if (!selectedLawyer) return null;

  // Find all tickets related to this attorney by roll number or name
  const lawyerRoll = selectedLawyer.rollNo;
  const lawyerName = selectedLawyer.name;

  const historyTickets = allTickets.filter(t => {
    if (lawyerRoll && lawyerRoll !== '-' && t.rollNo && t.rollNo.toString() === lawyerRoll.toString()) {
      return true;
    }
    if (lawyerName && t.name && t.name.toLowerCase().trim() === lawyerName.toLowerCase().trim()) {
      return true;
    }
    return false;
  }).sort((a, b) => (b.date > a.date ? 1 : -1));

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={20} weight="bold" color="var(--gold-primary)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {lawyerName || 'Attorney Profile'}
              </h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {lawyerRoll && lawyerRoll !== '-' && (
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                  Roll #{lawyerRoll}
                </span>
              )}
              {selectedLawyer.chapter && (
                <span>• {selectedLawyer.chapter} Chapter</span>
              )}
            </div>
          </div>

          <button 
            type="button" 
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close drawer"
          >
            <X size={20} weight="regular" />
          </button>
        </div>

        <div className="drawer-body">
          {/* Quick Actions Bar */}
          <div style={{ display: 'flex', gap: '8px', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
            <button
              type="button"
              className="btn-secondary"
              style={{ fontSize: '0.76rem', padding: '6px 10px' }}
              onClick={() => onCopyText(`${lawyerName} (Roll #${lawyerRoll})`, 'Lawyer info copied')}
            >
              <Copy size={13} weight="regular" />
              <span>Copy Info</span>
            </button>
            <div style={{ marginLeft: 'auto', fontSize: '0.76rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
              <strong>{historyTickets.length}</strong>&nbsp;total recorded inquiries
            </div>
          </div>

          {/* Timeline of Inquiries */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
            <h4 style={{ fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
              Inquiry History & Timeline
            </h4>

            {historyTickets.length === 0 ? (
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                No prior tickets recorded for this attorney.
              </p>
            ) : (
              historyTickets.map((t) => {
                const isId = t.type === 'ID_FOLLOWUP';

                return (
                  <div key={t.id} className="timeline-item">
                    <span className="timeline-dot"></span>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span className="timeline-date">{t.date}</span>
                      <span style={{ 
                        fontSize: '0.68rem', 
                        padding: '1px 6px', 
                        borderRadius: 'var(--radius-sm)',
                        background: isId ? 'var(--navy-subtle)' : 'var(--gold-subtle)',
                        color: isId ? '#60A5FA' : 'var(--gold-primary)',
                        fontWeight: 600
                      }}>
                        {isId ? 'ID Tracker' : 'Finance'}
                      </span>
                    </div>

                    <span className="timeline-title">
                      {t.subject || t.concern}
                    </span>

                    <span className="timeline-desc">
                      Resolution: <strong>{t.solution || t.resolved}</strong>
                    </span>

                    {t.trackingNo && (
                      <div style={{ fontSize: '0.74rem', color: '#60A5FA', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <Package size={12} weight="regular" />
                        <span>LBC #{t.trackingNo}</span>
                      </div>
                    )}

                    {t.notes && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '2px' }}>
                        Remarks: {t.notes}
                      </div>
                    )}

                    <div style={{ marginTop: '6px' }}>
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                        onClick={() => onOpenViberSnippet(t)}
                      >
                        <ChatText size={12} weight="regular" />
                        <span>Draft Viber Advisory</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
