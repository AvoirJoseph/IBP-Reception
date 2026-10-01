import React from 'react';
import { 
  IdentificationCard, 
  Receipt, 
  Truck, 
  Handbag,
  Clock,
  ChatsCircle,
  CheckCircle
} from '@phosphor-icons/react';

export default function MetricsRow({ 
  generalTickets = [], 
  idTickets = [], 
  financeTickets = [], 
  activeTab, 
  setActiveTab 
}) {
  const totalInquiries = generalTickets.length + idTickets.length + financeTickets.length;
  
  const idTransitCount = idTickets.filter(t => 
    t.solution === 'For delivery' || t.solution === 'Waiting' || t.solution === 'To send tracking no.'
  ).length;

  const idDeliveredCount = idTickets.filter(t => 
    (t.solution || '').toLowerCase().includes('delivered')
  ).length;
  
  const idPickupCount = idTickets.filter(t => 
    t.solution === 'Claimed (Pick-up)' || t.subject?.includes('Pick-up')
  ).length;

  const generalDoneCount = generalTickets.filter(t => 
    t.resolved === 'DONE' || (t.solution && t.solution.length > 0)
  ).length;

  const finCount = financeTickets.length;

  return (
    <div className="metrics-row">
      {/* 1. All Records */}
      <div 
        className={`metric-card ${activeTab === 'ALL' ? 'active-metric' : ''}`}
        style={{ cursor: 'pointer' }}
        onClick={() => setActiveTab('ALL')}
      >
        <div className="metric-info">
          <span className="metric-label">All Active Records</span>
          <span className="metric-value">{totalInquiries}</span>
          <span className="metric-sub">Across all 2026 sheets</span>
        </div>
        <div className="metric-icon-box today">
          <Clock size={20} weight="regular" />
        </div>
      </div>

      {/* 2. 2026 General Inquiries */}
      <div 
        className={`metric-card ${activeTab === 'GENERAL' ? 'active-metric' : ''}`}
        style={{ cursor: 'pointer' }}
        onClick={() => setActiveTab('GENERAL')}
      >
        <div className="metric-info">
          <span className="metric-label">2026 Inquiries</span>
          <span className="metric-value">{generalTickets.length}</span>
          <span className="metric-sub">
            <strong style={{ color: 'var(--status-delivered-text)' }}>{generalDoneCount}</strong> answered / resolved
          </span>
        </div>
        <div className="metric-icon-box general">
          <ChatsCircle size={20} weight="regular" />
        </div>
      </div>

      {/* 3. ID Follow-up */}
      <div 
        className={`metric-card ${activeTab === 'ID' ? 'active-metric' : ''}`}
        style={{ cursor: 'pointer' }}
        onClick={() => setActiveTab('ID')}
      >
        <div className="metric-info">
          <span className="metric-label">ID Courier Tracker</span>
          <span className="metric-value">{idTickets.length}</span>
          <span className="metric-sub">
            <strong style={{ color: 'var(--status-delivered-text)' }}>{idDeliveredCount}</strong> delivered,{' '}
            <strong style={{ color: 'var(--status-transit-text)' }}>{idTransitCount}</strong> in transit
          </span>
        </div>
        <div className="metric-icon-box id">
          <IdentificationCard size={20} weight="regular" />
        </div>
      </div>

      {/* 4. Finance & Receipts */}
      <div 
        className={`metric-card ${activeTab === 'FINANCE' ? 'active-metric' : ''}`}
        style={{ cursor: 'pointer' }}
        onClick={() => setActiveTab('FINANCE')}
      >
        <div className="metric-info">
          <span className="metric-label">Finance & Invoices</span>
          <span className="metric-value">{finCount}</span>
          <span className="metric-sub">Official receipt & fee inquiries</span>
        </div>
        <div className="metric-icon-box finance">
          <Receipt size={20} weight="regular" />
        </div>
      </div>

      {/* 5. Pick-Up */}
      <div 
        className={`metric-card ${activeTab === 'PICKUP' ? 'active-metric' : ''}`}
        style={{ cursor: 'pointer' }}
        onClick={() => setActiveTab('PICKUP')}
      >
        <div className="metric-info">
          <span className="metric-label">Office Pick-Up</span>
          <span className="metric-value">{idPickupCount}</span>
          <span className="metric-sub">Claimed at 3rd Floor Reception</span>
        </div>
        <div className="metric-icon-box transit">
          <Handbag size={20} weight="regular" />
        </div>
      </div>
    </div>
  );
}
