import React, { useState, useEffect } from 'react';
import { 
  X, 
  ChatText, 
  Copy, 
  Check, 
  EnvelopeSimple,
  ArrowsClockwise
} from '@phosphor-icons/react';

export default function ViberSnippetModal({
  isOpen,
  onClose,
  ticket,
  onCopyText
}) {
  const [templateType, setTemplateType] = useState('auto');
  const [messageText, setMessageText] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!ticket) return;

    const lawyerName = ticket.name || 'Counsel';
    const rollNo = ticket.rollNo && ticket.rollNo !== '-' ? ticket.rollNo : '';
    const tracking = ticket.trackingNo || '';
    const rollFragment = rollNo ? ` (Roll No. ${rollNo})` : '';

    let generated = '';

    if (ticket.type === 'ID_FOLLOWUP') {
      const sol = (ticket.solution || '').toLowerCase();
      if (sol.includes('delivered')) {
        generated = `Good day Atty. ${lawyerName}. Your IBP National ID${rollFragment} has been successfully delivered via LBC Express${tracking ? ` (Tracking No. ${tracking})` : ''}. For further inquiries, feel free to contact the IBP Reception Helpdesk. Thank you.`;
      } else if (sol.includes('pick-up') || (ticket.subject || '').includes('Pick-up')) {
        generated = `Good day Atty. ${lawyerName}. Regarding your IBP ID inquiry${rollFragment}, your card is ready for claiming at the IBP National Office, 3rd Floor Reception Desk, Pasig City (Monday to Friday, 8:00 AM to 5:00 PM). Please bring a valid government ID, or an authorization letter if sending a representative. Thank you.`;
      } else {
        generated = `Good day Atty. ${lawyerName}. Regarding your IBP National ID follow-up${rollFragment}, your package has been processed for courier dispatch via LBC Express${tracking ? ` with Tracking No. ${tracking}` : ''}. You may verify transit progress at https://www.lbcexpress.com/track/?tracking_no=${tracking}. Thank you.`;
      }
    } else {
      // Finance
      const con = (ticket.concern || '').toLowerCase();
      if (con.includes('dispute') || con.includes('app')) {
        generated = `Good day Atty. ${lawyerName}. Regarding your myIBP App payment inquiry${rollFragment}, your transaction records have been verified and endorsed to the Finance Department for account crediting. Please allow 24 to 48 hours and refresh your myIBP App. Thank you.`;
      } else {
        generated = `Good day Atty. ${lawyerName}. Regarding your request for the scanned copy of your Service Invoice for CY 2026${rollFragment}, your request has been logged and forwarded to the Finance Department. A soft copy will be transmitted to your registered email address. Thank you.`;
      }
    }

    setMessageText(generated);
    setCopied(false);
  }, [ticket, templateType]);

  if (!isOpen || !ticket) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    if (onCopyText) {
      onCopyText(messageText, 'Advisory message copied to clipboard');
    }
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '560px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <ChatText size={22} weight="bold" color="var(--gold-primary)" />
            <span>Generate Viber / Email Advisory</span>
          </div>
          <button 
            type="button" 
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} weight="regular" />
          </button>
        </div>

        <div className="modal-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Recipient:
            </span>
            <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>
              Atty. {ticket.name} {ticket.rollNo && ticket.rollNo !== '-' ? `(Roll #${ticket.rollNo})` : ''}
            </strong>
          </div>

          <div className="form-group">
            <label className="form-label">Advisory Message Text (Ready to Paste):</label>
            <textarea
              className="form-textarea"
              rows={6}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              style={{ lineHeight: 1.6, fontSize: '0.86rem' }}
            />
          </div>

          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Note: Formatted with professional institutional phrasing. Strictly free of informal symbols or emojis.
          </span>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
          >
            Close
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <Check size={16} weight="bold" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy size={16} weight="bold" />
                <span>Copy for Viber / Email</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
