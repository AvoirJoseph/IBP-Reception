import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import MetricsRow from './components/MetricsRow';
import FilterBar from './components/FilterBar';
import TicketTable from './components/TicketTable';
import NewTicketModal from './components/NewTicketModal';
import AttorneyHistoryDrawer from './components/AttorneyHistoryDrawer';
import ViberSnippetModal from './components/ViberSnippetModal';
import Toast from './components/Toast';
import { initialTrackerData } from './data/initialData';
import { exportTrackerToExcel } from './utils/excelExporter';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('ibp_theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Load tickets from local storage or fallback to initial pre-loaded Excel records
  const [idTickets, setIdTickets] = useState(() => {
    const saved = localStorage.getItem('ibp_id_tickets');
    return saved ? JSON.parse(saved) : initialTrackerData.idTickets;
  });

  const [financeTickets, setFinanceTickets] = useState(() => {
    const saved = localStorage.getItem('ibp_finance_tickets');
    return saved ? JSON.parse(saved) : initialTrackerData.financeTickets;
  });

  const [attorneys, setAttorneys] = useState(() => {
    const saved = localStorage.getItem('ibp_attorneys');
    return saved ? JSON.parse(saved) : initialTrackerData.attorneys;
  });

  // Persist tickets
  useEffect(() => {
    localStorage.setItem('ibp_id_tickets', JSON.stringify(idTickets));
  }, [idTickets]);

  useEffect(() => {
    localStorage.setItem('ibp_finance_tickets', JSON.stringify(financeTickets));
  }, [financeTickets]);

  useEffect(() => {
    localStorage.setItem('ibp_attorneys', JSON.stringify(attorneys));
  }, [attorneys]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL', 'ID', 'FINANCE', 'PICKUP', 'TODAY'
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [channelFilter, setChannelFilter] = useState('ALL');
  const [chapterFilter, setChapterFilter] = useState('ALL');

  // Modals & Drawers
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [activeSnippetTicket, setActiveSnippetTicket] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Toast Helper
  const addToast = (message) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const handleCopyText = (text, label = 'Copied to clipboard') => {
    navigator.clipboard.writeText(text);
    addToast(label);
  };

  // Combine tickets for universal searches
  const allTickets = useMemo(() => {
    return [...idTickets, ...financeTickets].sort((a, b) => {
      // Sort newest dates first
      return (b.date || '') > (a.date || '') ? 1 : -1;
    });
  }, [idTickets, financeTickets]);

  // Today's tickets count
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTickets = useMemo(() => {
    return allTickets.filter(t => t.date === todayStr || t.date === '2026-05-21');
  }, [allTickets, todayStr]);

  // Tab counts
  const counts = useMemo(() => {
    return {
      all: allTickets.length,
      id: idTickets.length,
      finance: financeTickets.length,
      pickup: idTickets.filter(t => t.solution === 'Claimed (Pick-up)' || t.subject?.includes('Pick-up')).length,
      today: todayTickets.length
    };
  }, [allTickets, idTickets, financeTickets, todayTickets]);

  // Filtered tickets based on active tab, search query, status, channel, chapter
  const filteredTickets = useMemo(() => {
    let list = allTickets;

    // 1. Tab filter
    if (activeTab === 'ID') {
      list = idTickets;
    } else if (activeTab === 'FINANCE') {
      list = financeTickets;
    } else if (activeTab === 'PICKUP') {
      list = idTickets.filter(t => t.solution === 'Claimed (Pick-up)' || t.subject?.includes('Pick-up'));
    } else if (activeTab === 'TODAY') {
      list = todayTickets;
    }

    // 2. Status filter
    if (statusFilter !== 'ALL') {
      list = list.filter(t => {
        const sol = (t.solution || t.resolved || '').toLowerCase();
        return sol.includes(statusFilter.toLowerCase());
      });
    }

    // 3. Channel filter
    if (channelFilter !== 'ALL') {
      list = list.filter(t => {
        const ch = (t.channel || '').toUpperCase();
        return ch.includes(channelFilter.toUpperCase());
      });
    }

    // 4. Chapter filter
    if (chapterFilter !== 'ALL') {
      list = list.filter(t => t.chapter === chapterFilter);
    }

    // 5. Global Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(t => {
        return (
          (t.name && t.name.toLowerCase().includes(q)) ||
          (t.rollNo && t.rollNo.toString().includes(q)) ||
          (t.trackingNo && t.trackingNo.toString().includes(q)) ||
          (t.chapter && t.chapter.toLowerCase().includes(q)) ||
          (t.subject && t.subject.toLowerCase().includes(q)) ||
          (t.concern && t.concern.toLowerCase().includes(q)) ||
          (t.solution && t.solution.toLowerCase().includes(q)) ||
          (t.id && t.id.toLowerCase().includes(q))
        );
      });
    }

    return list;
  }, [allTickets, idTickets, financeTickets, activeTab, statusFilter, channelFilter, chapterFilter, searchQuery, todayTickets]);

  // Reset Filters
  const handleResetFilters = () => {
    setStatusFilter('ALL');
    setChannelFilter('ALL');
    setChapterFilter('ALL');
    setSearchQuery('');
  };

  const isFiltered = statusFilter !== 'ALL' || channelFilter !== 'ALL' || chapterFilter !== 'ALL' || searchQuery !== '';

  // Save new ticket
  const handleSaveTicket = (newTicket) => {
    if (newTicket.type === 'ID_FOLLOWUP') {
      setIdTickets(prev => [newTicket, ...prev]);
    } else {
      setFinanceTickets(prev => [newTicket, ...prev]);
    }

    // Update attorney directory if not already recorded
    if (newTicket.rollNo && newTicket.rollNo !== '-') {
      setAttorneys(prev => {
        const exists = prev.some(a => a.rollNo.toString() === newTicket.rollNo.toString());
        if (!exists) {
          return [...prev, { rollNo: newTicket.rollNo, name: newTicket.name, chapter: newTicket.chapter }];
        }
        return prev;
      });
    }

    addToast(`Ticket #${newTicket.id} logged successfully`);
  };

  // Toggle or cycle status
  const handleStatusChange = (ticket) => {
    const isId = ticket.type === 'ID_FOLLOWUP';
    if (isId) {
      // Cycle: Waiting -> For delivery -> Delivered -> Claimed (Pick-up)
      const flow = ['Waiting', 'For delivery', 'Delivered', 'Claimed (Pick-up)'];
      const curIdx = flow.indexOf(ticket.solution);
      const nextSol = flow[(curIdx + 1) % flow.length];

      setIdTickets(prev => prev.map(t => {
        if (t.id === ticket.id) {
          return { ...t, solution: nextSol, resolved: nextSol === 'Delivered' || nextSol === 'Claimed (Pick-up)' ? 'DONE' : 'PENDING' };
        }
        return t;
      }));
      addToast(`Status updated to ${nextSol}`);
    } else {
      const nextRes = ticket.resolved === 'DONE' ? 'PENDING' : 'DONE';
      setFinanceTickets(prev => prev.map(t => {
        if (t.id === ticket.id) {
          return { ...t, resolved: nextRes };
        }
        return t;
      }));
      addToast(`Status updated to ${nextRes}`);
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    exportTrackerToExcel(idTickets, financeTickets);
    addToast('Official IBP Helpdesk Excel file exported');
  };

  return (
    <div className="app-container">
      {/* Header Bar */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenNewModal={() => setIsNewModalOpen(true)}
        theme={theme}
        setTheme={setTheme}
        todayCount={todayTickets.length}
        onExportExcel={handleExportExcel}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {/* Quick Counters Row */}
        <MetricsRow
          idTickets={idTickets}
          financeTickets={financeTickets}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* Tab & Filter Controls */}
        <FilterBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          channelFilter={channelFilter}
          setChannelFilter={setChannelFilter}
          chapterFilter={chapterFilter}
          setChapterFilter={setChapterFilter}
          chapters={initialTrackerData.chapters}
          counts={counts}
          onResetFilters={handleResetFilters}
          isFiltered={isFiltered}
        />

        {/* Dynamic Inquiries Data Table */}
        <TicketTable
          tickets={filteredTickets}
          onSelectAttorney={(lawyer) => setSelectedLawyer(lawyer)}
          onOpenViberSnippet={(t) => setActiveSnippetTicket(t)}
          onStatusChange={handleStatusChange}
          onCopyText={handleCopyText}
          searchQuery={searchQuery}
        />
      </main>

      {/* New Ticket Intake Modal */}
      <NewTicketModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSaveTicket={handleSaveTicket}
        attorneys={attorneys}
        chapters={initialTrackerData.chapters}
        options={initialTrackerData.options}
        todayDailyCount={todayTickets.length}
      />

      {/* Attorney History Timeline Drawer */}
      <AttorneyHistoryDrawer
        selectedLawyer={selectedLawyer}
        onClose={() => setSelectedLawyer(null)}
        allTickets={allTickets}
        onCopyText={handleCopyText}
        onOpenViberSnippet={(t) => setActiveSnippetTicket(t)}
      />

      {/* Viber / Email Advisory Snippet Modal */}
      <ViberSnippetModal
        isOpen={Boolean(activeSnippetTicket)}
        onClose={() => setActiveSnippetTicket(null)}
        ticket={activeSnippetTicket}
        onCopyText={handleCopyText}
      />

      {/* Active Toast Notifications */}
      <Toast toasts={toasts} />
    </div>
  );
}
