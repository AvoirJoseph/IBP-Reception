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
        onClick={() => setActiveTab('ALL')}
        title="View all records"
      >
        <div className="metric-info">
          <span className="metric-label">All Inquiries</span>
          <div className="metric-val-row">
            <span className="metric-value">{totalInquiries}</span>
          </div>
        </div>
        <div className="metric-icon-box today">
          <Clock size={18} weight="regular" />
        </div>
      </div>

      {/* 2. General */}
      <div 
        className={`metric-card ${activeTab === 'GENERAL' ? 'active-metric' : ''}`}
        onClick={() => setActiveTab('GENERAL')}
        title="View general inquiries"
      >
        <div className="metric-info">
          <span className="metric-label">General</span>
          <div className="metric-val-row">
            <span className="metric-value">{generalTickets.length}</span>
            <span className="metric-sub-pill success">{generalDoneCount} done</span>
          </div>
        </div>
        <div className="metric-icon-box general">
          <ChatsCircle size={18} weight="regular" />
        </div>
      </div>

      {/* 3. ID Follow-up */}
      <div 
        className={`metric-card ${activeTab === 'ID' ? 'active-metric' : ''}`}
        onClick={() => setActiveTab('ID')}
        title="View ID courier tracking"
      >
        <div className="metric-info">
          <span className="metric-label">ID Courier</span>
          <div className="metric-val-row">
            <span className="metric-value">{idTickets.length}</span>
            <span className="metric-sub-pill info">{idDeliveredCount} delivered</span>
            {idTransitCount > 0 && (
              <span className="metric-sub-pill warning">{idTransitCount} transit</span>
            )}
          </div>
        </div>
        <div className="metric-icon-box id">
          <IdentificationCard size={18} weight="regular" />
        </div>
      </div>

      {/* 4. Finance & Receipts */}
      <div 
        className={`metric-card ${activeTab === 'FINANCE' ? 'active-metric' : ''}`}
        onClick={() => setActiveTab('FINANCE')}
        title="View finance & receipt records"
      >
        <div className="metric-info">
          <span className="metric-label">Finance</span>
          <div className="metric-val-row">
            <span className="metric-value">{finCount}</span>
          </div>
        </div>
        <div className="metric-icon-box finance">
          <Receipt size={18} weight="regular" />
        </div>
      </div>

      {/* 5. Pick-Up */}
      <div 
        className={`metric-card ${activeTab === 'PICKUP' ? 'active-metric' : ''}`}
        onClick={() => setActiveTab('PICKUP')}
        title="View reception office pick-ups"
      >
        <div className="metric-info">
          <span className="metric-label">Office Pick-up</span>
          <div className="metric-val-row">
            <span className="metric-value">{idPickupCount}</span>
          </div>
        </div>
        <div className="metric-icon-box transit">
          <Handbag size={18} weight="regular" />
        </div>
      </div>
    </div>
  );
}
