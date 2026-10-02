import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Check, 
  IdentificationCard, 
  Receipt, 
  User, 
  MagnifyingGlass,
  WarningCircle,
  ChatsCircle
} from '@phosphor-icons/react';

export default function NewTicketModal({
  isOpen,
  onClose,
  onSaveTicket,
  attorneys = [],
  chapters = [],
  options = {},
  todayDailyCount = 0
}) {
  const [ticketType, setTicketType] = useState('GENERAL'); // 'GENERAL', 'ID_FOLLOWUP', 'FINANCE'
  const [rollNo, setRollNo] = useState('');
  const [name, setName] = useState('');
  const [chapter, setChapter] = useState('Quezon City');
  const [channel, setChannel] = useState('VIBER');
  const [category, setCategory] = useState('HELPDESK');
  const [subject, setSubject] = useState('');
  const [solution, setSolution] = useState('DONE');
  const [trackingNo, setTrackingNo] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('DONE');

  // Autocomplete state
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const rollInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setRollNo('');
      setName('');
      setChapter('Quezon City');
      setChannel('VIBER');
      setCategory('HELPDESK');
      setSubject('');
      setSolution('DONE');
      setTrackingNo('');
      setNotes('');
      setStatus('DONE');
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
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);

    let prefix = 'GEN-';
    let sheetName = '2026';
    if (ticketType === 'ID_FOLLOWUP') {
      prefix = 'ID-';
      sheetName = 'Follow-up (ID) 2026';
    } else if (ticketType === 'FINANCE') {
      prefix = 'FIN-';
      sheetName = 'FINANCE 2026';
    }

    const newTicket = {
      id: `${prefix}${randomSuffix}`,
      type: ticketType,
      sheetName,
      dailyNo: newDailyNo,
      date: todayStr,
      rollNo: rollNo.trim() || '-',
      name: name.trim().toUpperCase(),
      chapter: chapter,
      channel: channel,
      category: ticketType === 'GENERAL' ? category : (ticketType === 'ID_FOLLOWUP' ? 'ID' : 'FINANCE'),
      subject: subject.trim() || (ticketType === 'ID_FOLLOWUP' ? 'Follow-up Courier' : 'Inquiry'),
      concern: subject.trim(),
      solution: solution.trim(),
      trackingNo: ticketType === 'ID_FOLLOWUP' ? trackingNo.trim() : '',
      notes: notes.trim(),
      resolved: status === 'Delivered' || status === 'DONE' ? 'DONE' : 'PENDING'
    };

    onSaveTicket(newTicket);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <IdentificationCard size={20} weight="bold" color="var(--gold-primary)" />
            <span>New Inquiry</span>
          </div>
          <button 
            type="button" 
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} weight="regular" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Sheet Category Switcher */}
            <div className="form-group">
              <label className="form-label">Category</label>
              <div className="tab-group" style={{ width: '100%' }}>
                <button
                  type="button"
                  style={{ flex: 1, justifyContent: 'center' }}
                  className={`tab-btn ${ticketType === 'GENERAL' ? 'active' : ''}`}
                  onClick={() => {
                    setTicketType('GENERAL');
                    setSubject('');
                    setSolution('DONE');
                  }}
                >
                  <ChatsCircle size={15} weight="regular" />
                  <span>General</span>
                </button>

                <button
                  type="button"
                  style={{ flex: 1, justifyContent: 'center' }}
                  className={`tab-btn ${ticketType === 'ID_FOLLOWUP' ? 'active' : ''}`}
                  onClick={() => {
                    setTicketType('ID_FOLLOWUP');
                    setSubject('Follow-up Courier');
                    setSolution('Delivered');
                  }}
                >
                  <IdentificationCard size={15} weight="regular" />
                  <span>ID Courier</span>
                </button>

                <button
                  type="button"
                  style={{ flex: 1, justifyContent: 'center' }}
                  className={`tab-btn ${ticketType === 'FINANCE' ? 'active' : ''}`}
                  onClick={() => {
                    setTicketType('FINANCE');
                    setSubject('Service Invoice Request');
                    setSolution('Endorsed to Finance');
                  }}
                >
                  <Receipt size={15} weight="regular" />
                  <span>Finance</span>
                </button>
              </div>
            </div>

            {/* Lawyer Autocomplete Section */}
            <div className="form-grid-2">
              <div className="form-group autocomplete-box">
                <label className="form-label">
                  Roll # <span style={{ color: 'var(--gold-primary)' }}>*</span>
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
                        <span style={{ fontWeight: 600 }}>{att.name}</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Roll #{att.rollNo} {att.chapter ? `• ${att.chapter}` : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Lawyer Name <span style={{ color: 'var(--gold-primary)' }}>*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. DELA CRUZ, JUAN"
                  value={name}
                  onChange={(e) => setName(e.target.value.toUpperCase())}
                  required
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Chapter</label>
                <select
                  className="form-input"
                  value={chapter}
                  onChange={(e) => setChapter(e.target.value)}
                >
                  {chapters.map((ch) => (
                    <option key={ch} value={ch}>{ch}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Channel Received</label>
                <select
                  className="form-input"
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                >
                  <option value="VIBER">VIBER</option>
                  <option value="LANDLINE">LANDLINE</option>
                  <option value="EMAIL">EMAIL</option>
                  <option value="HOTLINE">HOTLINE</option>
                  <option value="TEXT">TEXT</option>
                  <option value="WALK-IN">WALK-IN</option>
                </select>
              </div>
            </div>

            {ticketType === 'GENERAL' && (
              <div className="form-group">
                <label className="form-label">Department / Category</label>
                <select
                  className="form-input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="HELPDESK">HELPDESK</option>
                  <option value="NCLA">NCLA (Legal Aid)</option>
                  <option value="RECORDS">RECORDS</option>
                  <option value="FINANCE">FINANCE</option>
                  <option value="CBD">CBD</option>
                  <option value="MCLE">MCLE</option>
                  <option value="IT">IT</option>
                  <option value="ACCOUNTING">ACCOUNTING</option>
                </select>
              </div>
            )}

            {/* Concern / Subject */}
            <div className="form-group">
              <label className="form-label">
                Concern / Subject Matter <span style={{ color: 'var(--gold-primary)' }}>*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. FOLLOW-UP RENEWAL OF ID or SCANNED COPY OF SERVICE INVOICE"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            {/* Solution / Action Taken */}
            <div className="form-group">
              <label className="form-label">Solution / Action Taken</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Delivered or Transfer to NCLA Dept or Sent via Email"
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
              />
            </div>

            {/* Conditional ID Tracking fields */}
            {ticketType === 'ID_FOLLOWUP' && (
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">LBC Tracking Number (12 digits)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 174305584683"
                    value={trackingNo}
                    onChange={(e) => setTrackingNo(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-input"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="Delivered">Delivered</option>
                    <option value="Claimed (Pick-up)">Claimed (Pick-up)</option>
                    <option value="For delivery">For delivery</option>
                    <option value="To send tracking no.">To send tracking no.</option>
                    <option value="PENDING">PENDING</option>
                  </select>
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="form-group">
              <label className="form-label">Internal Reception Notes</label>
              <textarea
                className="form-input"
                rows="2"
                placeholder="Additional instructions or notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              ></textarea>
            </div>
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
              <span>Log to {ticketType === 'GENERAL' ? '2026' : ticketType === 'ID_FOLLOWUP' ? 'ID' : 'Finance'} Sheet</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
