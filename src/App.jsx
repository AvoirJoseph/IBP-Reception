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
import { exportTrackerToExcel, parseExcelTrackerFile } from './utils/excelExporter';

export default function App() {
  // Theme state: DEFAULT TO LIGHT MODE as requested
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('ibp_theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Load tickets from local storage or fallback to updated Excel data
  const [generalTickets, setGeneralTickets] = useState(() => {
    const saved = localStorage.getItem('ibp_general_tickets_v2');
    return saved ? JSON.parse(saved) : (initialTrackerData.generalTickets || []);
  });

  const [idTickets, setIdTickets] = useState(() => {
    const saved = localStorage.getItem('ibp_id_tickets_v2');
    return saved ? JSON.parse(saved) : (initialTrackerData.idTickets || []);
  });

  const [financeTickets, setFinanceTickets] = useState(() => {
    const saved = localStorage.getItem('ibp_finance_tickets_v2');
    return saved ? JSON.parse(saved) : (initialTrackerData.financeTickets || []);
  });

  const [attorneys, setAttorneys] = useState(() => {
    const saved = localStorage.getItem('ibp_attorneys_v2');
    return saved ? JSON.parse(saved) : (initialTrackerData.attorneys || []);
  });

  // Persist tickets
  useEffect(() => {
    localStorage.setItem('ibp_general_tickets_v2', JSON.stringify(generalTickets));
  }, [generalTickets]);

  useEffect(() => {
    localStorage.setItem('ibp_id_tickets_v2', JSON.stringify(idTickets));
  }, [idTickets]);

  useEffect(() => {
    localStorage.setItem('ibp_finance_tickets_v2', JSON.stringify(financeTickets));
  }, [financeTickets]);

  useEffect(() => {
    localStorage.setItem('ibp_attorneys_v2', JSON.stringify(attorneys));
  }, [attorneys]);

  // Search & Navigation
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('GENERAL'); // 'GENERAL', 'ID', 'FINANCE', 'ALL', 'PICKUP', 'TODAY'
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [channelFilter, setChannelFilter] = useState('ALL');
  const [chapterFilter, setChapterFilter] = useState('ALL');

  // Customization: Grid Density & Column Visibility (Google Sheets feel)
  const [density, setDensity] = useState(() => {
    return localStorage.getItem('ibp_density') || 'compact';
  });

  useEffect(() => {
    localStorage.setItem('ibp_density', density);
  }, [density]);

  const [visibleColumns, setVisibleColumns] = useState(() => {
    const saved = localStorage.getItem('ibp_columns_config');
    return saved ? JSON.parse(saved) : {
      rowNo: true,
      ticketId: true,
      date: true,
      lawyer: true,
      chapter: true,
      channel: true,
      category: true,
      subject: true,
      solution: true,
      status: true,
      trackingNo: true,
      actions: true
    };
  });

  useEffect(() => {
    localStorage.setItem('ibp_columns_config', JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  const handleToggleColumn = (key) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [key]: prev[key] === false ? true : false
    }));
  };

  // Sorting state
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

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
    if (!text) return;
    navigator.clipboard.writeText(text);
    addToast(label);
  };

  // Combine tickets for universal searches
  const allTickets = useMemo(() => {
    return [...generalTickets, ...idTickets, ...financeTickets];
  }, [generalTickets, idTickets, financeTickets]);

  // Today's tickets count
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTickets = useMemo(() => {
    return allTickets.filter(t => t.date === todayStr || t.date === '2026-09-30' || t.date === '2026-09-28');
  }, [allTickets, todayStr]);

  // Tab counts
  const counts = useMemo(() => {
    return {
      general: generalTickets.length,
      id: idTickets.length,
      finance: financeTickets.length,
      all: allTickets.length,
      pickup: idTickets.filter(t => t.solution === 'Claimed (Pick-up)' || t.subject?.includes('Pick-up')).length,
      today: todayTickets.length
    };
  }, [generalTickets, idTickets, financeTickets, allTickets, todayTickets]);

  // Filtered & Sorted tickets
  const filteredAndSortedTickets = useMemo(() => {
    let list = [];

    // 1. Tab filter
    if (activeTab === 'GENERAL') {
      list = generalTickets;
    } else if (activeTab === 'ID') {
      list = idTickets;
    } else if (activeTab === 'FINANCE') {
      list = financeTickets;
    } else if (activeTab === 'PICKUP') {
      list = idTickets.filter(t => t.solution === 'Claimed (Pick-up)' || t.subject?.includes('Pick-up'));
    } else if (activeTab === 'TODAY') {
      list = todayTickets;
    } else {
      list = allTickets;
    }

    // 2. Status filter
    if (statusFilter !== 'ALL') {
      const sf = statusFilter.toLowerCase();
      list = list.filter(t => {
        const sol = (t.solution || '').toLowerCase();
        const res = (t.resolved || '').toLowerCase();
        const stat = (t.status || '').toLowerCase();
        if (sf === 'done') {
          return res === 'done' || stat === 'done' || (sol.length > 0 && !sol.includes('transit') && !sol.includes('waiting'));
        }
        if (sf === 'delivered') return sol.includes('delivered') || stat.includes('delivered');
        if (sf === 'claimed') return sol.includes('claimed') || sol.includes('pick-up') || stat.includes('claimed');
        if (sf === 'transit') return sol.includes('for delivery') || sol.includes('waiting') || sol.includes('transit') || sol.includes('tracking');
        if (sf === 'pending') return res === 'pending' || stat === 'pending';
        return sol.includes(sf) || res.includes(sf) || stat.includes(sf);
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

    // 6. Sorting
    if (sortConfig.key) {
      list = [...list].sort((a, b) => {
        let valA = a[sortConfig.key] || '';
        let valB = b[sortConfig.key] || '';

        // If numerical rollNo
        if (sortConfig.key === 'rollNo' || sortConfig.key === 'dailyNo') {
          valA = Number(valA) || 0;
          valB = Number(valB) || 0;
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return list;
  }, [activeTab, generalTickets, idTickets, financeTickets, allTickets, todayTickets, statusFilter, channelFilter, chapterFilter, searchQuery, sortConfig]);

  // Unique chapters for filter dropdown
  const chapters = useMemo(() => {
    const set = new Set();
    allTickets.forEach(t => {
      if (t.chapter && t.chapter.trim() && t.chapter !== '-') {
        set.add(t.chapter.trim());
      }
    });
    return Array.from(set).sort();
  }, [allTickets]);

  // Update a ticket inline or from modal
  const handleUpdateTicket = (updatedTicket) => {
    if (updatedTicket.type === 'ID_FOLLOWUP' || updatedTicket.id.startsWith('ID-')) {
      setIdTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
    } else if (updatedTicket.type === 'FINANCE' || updatedTicket.id.startsWith('FIN-')) {
      setFinanceTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
    } else {
      setGeneralTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
    }
    addToast(`Saved changes to ${updatedTicket.id}`);
  };

  // Add Ticket (From Quick Add or Full Modal)
  const handleAddTicket = (newTicket) => {
    if (newTicket.type === 'ID_FOLLOWUP' || newTicket.id.startsWith('ID-')) {
      setIdTickets(prev => [newTicket, ...prev]);
    } else if (newTicket.type === 'FINANCE' || newTicket.id.startsWith('FIN-')) {
      setFinanceTickets(prev => [newTicket, ...prev]);
    } else {
      setGeneralTickets(prev => [newTicket, ...prev]);
    }

    // Auto update attorneys list if new lawyer
    if (newTicket.name && newTicket.name !== 'NOT SPECIFIED') {
      setAttorneys(prev => {
        const exists = prev.some(a => a.name === newTicket.name || (a.rollNo && a.rollNo === newTicket.rollNo));
        if (!exists) {
          return [{
            name: newTicket.name,
            rollNo: newTicket.rollNo !== '-' ? newTicket.rollNo : '',
            chapter: newTicket.chapter || '',
            tickets: [newTicket.id]
          }, ...prev];
        }
        return prev;
      });
    }

    addToast(`Added new inquiry ${newTicket.id}`);
  };

  // Reset Filters
  const handleResetFilters = () => {
    setStatusFilter('ALL');
    setChannelFilter('ALL');
    setChapterFilter('ALL');
    setSearchQuery('');
  };

  const isFiltered = statusFilter !== 'ALL' || channelFilter !== 'ALL' || chapterFilter !== 'ALL' || searchQuery.trim() !== '';

  // Excel Export
  const handleExport = () => {
    exportTrackerToExcel(generalTickets, idTickets, financeTickets);
    addToast('Excel file exported successfully');
  };

  // Excel Import
  const handleImport = async (file) => {
    try {
      const data = await parseExcelTrackerFile(file);
      if (data.generalTickets.length || data.idTickets.length || data.financeTickets.length) {
        setGeneralTickets(data.generalTickets);
        setIdTickets(data.idTickets);
        setFinanceTickets(data.financeTickets);
        if (data.attorneys.length) {
          setAttorneys(data.attorneys);
        }
        addToast(`Imported ${data.generalTickets.length + data.idTickets.length + data.financeTickets.length} records from Excel!`);
      } else {
        alert('Could not find recognizable 2026 sheets in the uploaded file.');
      }
    } catch (err) {
      console.error(err);
      alert('Error parsing Excel file. Please ensure it is a valid .xlsx file.');
    }
  };

  return (
    <div className="app-container">
      {/* Executive Header */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenNewModal={() => setIsNewModalOpen(true)}
        theme={theme}
        setTheme={setTheme}
        todayCount={counts.today}
        onExportExcel={handleExport}
      />

      <main className="main-content">
        {/* KPI Metrics Row */}
        <MetricsRow
          generalTickets={generalTickets}
          idTickets={idTickets}
          financeTickets={financeTickets}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* Google Sheets Style Workbook Tabs & Toolbar */}
        <FilterBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          channelFilter={channelFilter}
          setChannelFilter={setChannelFilter}
          chapterFilter={chapterFilter}
          setChapterFilter={setChapterFilter}
          chapters={chapters}
          counts={counts}
          onResetFilters={handleResetFilters}
          isFiltered={isFiltered}
          visibleColumns={visibleColumns}
          onToggleColumn={handleToggleColumn}
          density={density}
          setDensity={setDensity}
          onImportExcel={handleImport}
          onExportExcel={handleExport}
        />

        {/* Spreadsheet Data Grid */}
        <TicketTable
          tickets={filteredAndSortedTickets}
          activeTab={activeTab}
          onSelectAttorney={(t) => {
            const attorneyObj = attorneys.find(a => 
              (a.rollNo && a.rollNo === t.rollNo) || (a.name && a.name === t.name)
            ) || { name: t.name, rollNo: t.rollNo, chapter: t.chapter, tickets: [t.id] };
            setSelectedLawyer(attorneyObj);
          }}
          onOpenViberSnippet={(t) => setActiveSnippetTicket(t)}
          onUpdateTicket={handleUpdateTicket}
          onCopyText={handleCopyText}
          searchQuery={searchQuery}
          visibleColumns={visibleColumns}
          density={density}
          sortConfig={sortConfig}
          onSort={handleSort}
          onAddQuickTicket={handleAddTicket}
        />
      </main>

      {/* New Ticket Modal */}
      <NewTicketModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSaveTicket={handleAddTicket}
        attorneys={attorneys}
        chapters={chapters}
        todayDailyCount={counts.today}
      />

      {/* Attorney History Drawer */}
      <AttorneyHistoryDrawer
        attorney={selectedLawyer}
        allTickets={allTickets}
        isOpen={Boolean(selectedLawyer)}
        onClose={() => setSelectedLawyer(null)}
        onOpenViberSnippet={(t) => {
          setSelectedLawyer(null);
          setActiveSnippetTicket(t);
        }}
        onCopyText={handleCopyText}
      />

      {/* Viber Snippet Generator Modal */}
      <ViberSnippetModal
        ticket={activeSnippetTicket}
        isOpen={Boolean(activeSnippetTicket)}
        onClose={() => setActiveSnippetTicket(null)}
        onCopyText={handleCopyText}
      />

      {/* Toast Notifications */}
      <Toast toasts={toasts} />
    </div>
  );
}
