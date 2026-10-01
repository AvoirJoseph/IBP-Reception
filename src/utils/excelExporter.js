import * as XLSX from 'xlsx';

export function exportTrackerToExcel(idTickets, financeTickets) {
  const wb = XLSX.utils.book_new();

  // 1. Follow-up (ID) Sheet
  const idRows = [
    ['Column 1', 'DATE', 'SUBJECT', 'ROLL NO', 'NAME', 'CHAPTER', 'LBC TRACKING NUMBER', 'SOLUTION', 'NOTES', 'Column 2'],
    ...idTickets.map((t, idx) => [
      t.dailyNo || (idx + 1),
      t.date || '',
      t.subject || '',
      t.rollNo ? Number(t.rollNo) || t.rollNo : '',
      t.name || '',
      t.chapter || '',
      t.trackingNo ? Number(t.trackingNo) || t.trackingNo : '',
      t.solution || '',
      t.notes || '',
      t.paymentNotes || ''
    ])
  ];

  const wsId = XLSX.utils.aoa_to_sheet(idRows);
  // Auto-width columns
  wsId['!cols'] = [
    { wch: 8 },  // Daily No
    { wch: 12 }, // Date
    { wch: 26 }, // Subject
    { wch: 12 }, // Roll No
    { wch: 38 }, // Name
    { wch: 22 }, // Chapter
    { wch: 20 }, // Tracking
    { wch: 22 }, // Solution
    { wch: 35 }, // Notes
    { wch: 25 }  // Col 2
  ];
  XLSX.utils.book_append_sheet(wb, wsId, 'Follow-up (ID) 2026');

  // 2. FINANCE Sheet
  const finRows = [
    ['NO', 'DATE', 'NAME', 'ROLL NO.', 'CHANNEL', 'CONCERN', 'SOLUTION', 'RESOLVED', 'NOTES'],
    ...financeTickets.map((t, idx) => [
      t.dailyNo || (idx + 1),
      t.date || '',
      t.name || '',
      t.rollNo ? Number(t.rollNo) || t.rollNo : '',
      t.channel || '',
      t.concern || '',
      t.solution || '',
      t.resolved || 'DONE',
      t.notes || ''
    ])
  ];

  const wsFin = XLSX.utils.aoa_to_sheet(finRows);
  wsFin['!cols'] = [
    { wch: 8 },  // No
    { wch: 12 }, // Date
    { wch: 38 }, // Name
    { wch: 12 }, // Roll No
    { wch: 14 }, // Channel
    { wch: 38 }, // Concern
    { wch: 38 }, // Solution
    { wch: 12 }, // Resolved
    { wch: 35 }  // Notes
  ];
  XLSX.utils.book_append_sheet(wb, wsFin, 'FINANCE 2026');

  const today = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `IBP_Helpdesk_Tracker_Export_${today}.xlsx`);
}
