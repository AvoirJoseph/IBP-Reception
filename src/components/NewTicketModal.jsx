import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Check, 
  IdentificationCard, 
  Receipt, 
  User, 
  MagnifyingGlass,
  WarningCircle
} from '@phosphor-icons/react';

export default function NewTicketModal({
  isOpen,
  onClose,
  onSaveTicket,
  attorneys,
  chapters,
  options,
  todayDailyCount
}) {
  const [ticketType, setTicketType] = useState('ID_FOLLOWUP'); // or 'FINANCE'
  const [rollNo, setRollNo] = useState('');
  const [name, setName] = useState('');
  const [chapter, setChapter] = useState('Quezon City');
  const [channel, setChannel] = useState('VIBER');
  const [subject, setSubject] = useState('Follow-up Courier');
  const [concern, setConcern] = useState('SCANNED COPY OF SERVICE INVOICE');
  const [solution, setSolution] = useState('Delivered');
  const [trackingNo, setTrackingNo] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  // Autocomplete state
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const rollInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Reset defaults
      setRollNo('');
      setName('');
      setChapter('Quezon City');
      setChannel('VIBER');
      setSubject('Follow-up Courier');
      setConcern('SCANNED COPY OF SERVICE INVOICE');
      setSolution(ticketType === 'ID_FOLLOWUP' ? 'Delivered' : 'SUGGESTED TO WAIT THE SOFT COPY SENT TO EMAIL');
      setTrackingNo('');
      setNotes('');
      setPaymentNotes('');
      setSuggestions([]);
      setShowSuggestions(false);

      setTimeout(() => {
        if (rollInputRef.current) rollInputRef.current.focus();
      }, 100);
    }
  }, [isOpen, ticketType]);

  // Autocomplete filtering
  const handleRollChange = (val) => {
    setRollNo(val);
    if (val.trim().length > 1) {
      const query = val.toLowerCase().trim();
      const matches = attorneys.filter(a => 
        (a.rollNo && a.rollNo.toString().includes(query)) ||
        (a.name && a.name.toLowerCase().includes(query))
      ).slice(0, 6);
      setSuggestions(matches);
      setShowSuggestions(matches.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectAttorney = (att) => {
    setRollNo(att.rollNo);
    setName(att.name);
    if (att.chapter) setChapter(att.chapter);
    setShowSuggestions(false);
  };

  // Keyboard escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter or select a lawyer name.');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const newDailyNo = todayDailyCount + 1;

    const newTicket = {
      id: ticketType === 'ID_FOLLOWUP' 
        ? `ID-${Math.floor(1000 + Math.random() * 9000)}`
        : `FIN-${Math.floor(1000 + Math.random() * 9000)}`,
      type: ticketType,
      dailyNo: newDailyNo,
      date: todayStr,
      rollNo: rollNo.trim() || '-',
      name: name.trim().toUpperCase(),
      chapter: chapter,
      channel: ticketType === 'FINANCE' ? channel : 'VIBER',
      subject: ticketType === 'ID_FOLLOWUP' ? subject : null,
      concern: ticketType === 'FINANCE' ? concern : null,
      solution: solution,
      trackingNo: ticketType === 'ID_FOLLOWUP' ? trackingNo.trim() : '',
      notes: notes.trim(),
      paymentNotes: paymentNotes.trim(),
      resolved: 'DONE'
    };

    onSaveTicket(newTicket);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <IdentificationCard size={22} weight="bold" color="var(--gold-primary)" />
            <span>Log New Lawyer Inquiry</span>
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

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Category Switcher */}
            <div className="form-group">
              <label className="form-label">Select Department / Inquiry Category</label>
              <div className="tab-group" style={{ width: '100%' }}>
                <button
                  type="button"
                  style={{ flex: 1, justifyContent: 'center' }}
                  className={`tab-btn ${ticketType === 'ID_FOLLOWUP' ? 'active' : ''}`}
                  onClick={() => {
                    setTicketType('ID_FOLLOWUP');
                    setSolution('Delivered');
                  }}
                >
                  <IdentificationCard size={16} weight="regular" />
                  <span>ID Dispatch & Courier</span>
                </button>
                <button
                  type="button"
                  style={{ flex: 1, justifyContent: 'center' }}
                  className={`tab-btn ${ticketType === 'FINANCE' ? 'active' : ''}`}
                  onClick={() => {
                    setTicketType('FINANCE');
                    setSolution('SUGGESTED TO WAIT THE SOFT COPY SENT TO EMAIL');
                  }}
                >
                  <Receipt size={16} weight="regular" />
                  <span>Finance, Dues & Invoices</span>
                </button>
              </div>
            </div>

            {/* Lawyer Autocomplete Section */}
            <div className="form-grid-2">
              <div className="form-group autocomplete-box">
                <label className="form-label">
                  Roll of Attorneys No. <span style={{ color: 'var(--gold-primary)' }}>*</span>
                </label>
                <input
                  ref={rollInputRef}
                  type="text"
                  className="form-input"
                  placeholder="e.g. 97957"
                  value={rollNo}
                  onChange={(e) => handleRollChange(e.target.value)}
                  autoComplete="off"
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div className="suggestions-dropdown">
                    {suggestions.map((att, idx) => (
                      <div 
                        key={idx} 
                        className="suggestion-item"
                        onClick={() => selectAttorney(att)}
                      >
                        <div>
                          <span className="suggestion-roll">Roll #{att.rollNo}</span>
                          <div style={{ fontWeight: 600, fontSize: '0.78rem' }}>{att.name}</div>
                        </div>
                        {att.chapter && (
                          <span className="suggestion-chapter">{att.chapter}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Lawyer Full Name <span style={{ color: 'var(--gold-primary)' }}>*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="LAST NAME, FIRST NAME MIDDLE NAME"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Chapter & Channel */}
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">IBP Chapter</label>
                <select 
                  className="form-select"
                  value={chapter}
                  onChange={(e) => setChapter(e.target.value)}
                >
                  {chapters.map((ch) => (
                    <option key={ch} value={ch}>{ch}</option>
                  ))}
                </select>
              </div>

              {ticketType === 'FINANCE' ? (
                <div className="form-group">
                  <label className="form-label">Communication Channel</label>
                  <select
                    className="form-select"
                    value={channel}
                    onChange={(e) => setChannel(e.target.value)}
                  >
                    {options.financeChannels.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">LBC Tracking Number</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="12-digit number e.g. 174305584683"
                    value={trackingNo}
                    onChange={(e) => setTrackingNo(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Dynamic Specifics for ID vs Finance */}
            {ticketType === 'ID_FOLLOWUP' ? (
              <>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Inquiry Subject / Action</label>
                    <select
                      className="form-select"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    >
                      {options.idSubjects.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Dispatch Status / Solution</label>
                    <select
                      className="form-select"
                      value={solution}
                      onChange={(e) => setSolution(e.target.value)}
                    >
                      {options.idSolutions.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Courier Payment Note</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. already paid the courier / done paid"
                      value={paymentNotes}
                      onChange={(e) => setPaymentNotes(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Reception Notes & Remarks</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Personally Claimed / Delivered to Guard"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Financial Concern</label>
                    <select
                      className="form-select"
                      value={concern}
                      onChange={(e) => setConcern(e.target.value)}
                    >
                      {options.financeConcerns.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Action / Solution Provided</label>
                    <select
                      className="form-select"
                      value={solution}
                      onChange={(e) => setSolution(e.target.value)}
                    >
                      {options.financeSolutions.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Notes & Follow-up Details</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. email sent 6.26.26 / LBC c/o Atty. Mendiola"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              <Check size={16} weight="bold" />
              <span>Save & Log Ticket</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
