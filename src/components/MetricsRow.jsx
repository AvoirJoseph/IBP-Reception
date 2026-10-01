import React from 'react';
import { 
  IdentificationCard, 
  Receipt, 
  Truck, 
  Handbag,
  Clock
} from '@phosphor-icons/react';

export default function MetricsRow({ idTickets, financeTickets, activeTab, setActiveTab }) {
  const totalInquiries = idTickets.length + financeTickets.length;
  
  const idTransitCount = idTickets.filter(t => 
    t.solution === 'For delivery' || t.solution === 'Waiting' || t.solution === 'To send tracking no.'
  ).length;

  const idDeliveredCount = idTickets.filter(t => t.solution === 'Delivered').length;
  
  const idPickupCount = idTickets.filter(t => 
    t.solution === 'Claimed (Pick-up)' || t.subject?.includes('Pick-up')
  ).length;

  const finInvoiceCount = financeTickets.filter(t => 
    t.concern?.includes('SERVICE INVOICE') || t.concern?.includes('INVOICE')
  ).length;

  return (
    <div className="metrics-row">
      <div 
        className="metric-card"
        style={{ cursor: 'pointer' }}
        onClick={() => setActiveTab('ALL')}
      >
        <div className="metric-info">
          <span className="metric-label">All Active Records</span>
          <span className="metric-value">{totalInquiries}</span>
          <span className="metric-sub">Across all logged inquiries</span>
        </div>
        <div className="metric-icon-box today">
          <Clock size={22} weight="regular" />
        </div>
      </div>

      <div 
        className="metric-card"
        style={{ cursor: 'pointer' }}
        onClick={() => setActiveTab('ID')}
      >
        <div className="metric-info">
          <span className="metric-label">ID Tracker Queue</span>
          <span className="metric-value">{idTickets.length}</span>
          <span className="metric-sub">
            <strong style={{ color: 'var(--status-delivered-text)' }}>{idDeliveredCount}</strong> delivered,{' '}
            <strong style={{ color: 'var(--status-transit-text)' }}>{idTransitCount}</strong> in transit
          </span>
        </div>
        <div className="metric-icon-box id">
          <IdentificationCard size={22} weight="regular" />
        </div>
      </div>

      <div 
        className="metric-card"
        style={{ cursor: 'pointer' }}
        onClick={() => setActiveTab('FINANCE')}
      >
        <div className="metric-info">
          <span className="metric-label">Finance & Invoices</span>
          <span className="metric-value">{financeTickets.length}</span>
          <span className="metric-sub">
            <strong>{finInvoiceCount}</strong> service invoice inquiries
          </span>
        </div>
        <div className="metric-icon-box finance">
          <Receipt size={22} weight="regular" />
        </div>
      </div>

      <div 
        className="metric-card"
        style={{ cursor: 'pointer' }}
        onClick={() => setActiveTab('PICKUP')}
      >
        <div className="metric-info">
          <span className="metric-label">National Office Pick-Up</span>
          <span className="metric-value">{idPickupCount}</span>
          <span className="metric-sub">Claimed or queued at 3rd Floor</span>
        </div>
        <div className="metric-icon-box transit">
          <Handbag size={22} weight="regular" />
        </div>
      </div>
    </div>
  );
}
