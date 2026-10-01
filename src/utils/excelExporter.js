import * as XLSX from 'xlsx';

export function excelDateToJS(serial) {
  if (!serial) return '';
  if (typeof serial === 'string') return serial.trim();
  if (typeof serial === 'number') {
    const utc_days = Math.floor(serial - 25569);
    const date_info = new Date(utc_days * 86400 * 1000);
    return date_info.toISOString().split('T')[0];
  }
  return '';
}

export function exportTrackerToExcel(generalTickets = [], idTickets = [], financeTickets = []) {
  const wb = XLSX.utils.book_new();

  // 1. General 2026 Sheet
  const genRows = [
    ['NO', 'DATE', 'NAME', 'ROLL NO.', 'CHANNEL', 'CATEGORY', 'CONCERN', 'SOLUTION', 'RESOLVED'],
    ...generalTickets.map((t, idx) => [
      t.dailyNo || (idx + 1),
      t.date || '',
      t.name || '',
      t.rollNo ? (Number(t.rollNo) || t.rollNo) : '',
      t.channel || 'VIBER',
      t.category || 'HELPDESK',
      t.concern || t.subject || '',
      t.solution || '',
      t.resolved || 'DONE'
    ])
  ];
  const wsGen = XLSX.utils.aoa_to_sheet(genRows);
  wsGen['!cols'] = [
    { wch: 8 },  // NO
    { wch: 12 }, // DATE
    { wch: 38 }, // NAME
    { wch: 12 }, // ROLL NO.
    { wch: 14 }, // CHANNEL
    { wch: 16 }, // CATEGORY
    { wch: 42 }, // CONCERN
    { wch: 46 }, // SOLUTION
    { wch: 12 }  // RESOLVED
  ];
  XLSX.utils.book_append_sheet(wb, wsGen, '2026');

  // 2. Follow-up (ID) 2026 Sheet
  const idRows = [
    ['Column 1', 'DATE', 'SUBJECT', 'ROLL NO', 'NAME', 'CHAPTER', 'LBC TRACKING NUMBER', 'SOLUTION', 'NOTES'],
    ...idTickets.map((t, idx) => [
      t.dailyNo || (idx + 1),
      t.date || '',
      t.subject || t.concern || '',
      t.rollNo ? (Number(t.rollNo) || t.rollNo) : '',
      t.name || '',
      t.chapter || '',
      t.trackingNo ? (Number(t.trackingNo) || t.trackingNo) : '',
      t.solution || '',
      t.notes || ''
    ])
  ];
  const wsId = XLSX.utils.aoa_to_sheet(idRows);
  wsId['!cols'] = [
    { wch: 10 }, // Column 1
    { wch: 12 }, // DATE
    { wch: 28 }, // SUBJECT
    { wch: 12 }, // ROLL NO
    { wch: 38 }, // NAME
    { wch: 22 }, // CHAPTER
    { wch: 22 }, // LBC TRACKING NUMBER
    { wch: 22 }, // SOLUTION
    { wch: 38 }  // NOTES
  ];
  XLSX.utils.book_append_sheet(wb, wsId, 'Follow-up (ID) 2026');

  // 3. FINANCE 2026 Sheet
  const finRows = [
    ['NO', 'DATE', 'NAME', 'ROLL NO.', 'CHANNEL', 'CONCERN', 'SOLUTION', 'RESOLVED', 'NOTES'],
    ...financeTickets.map((t, idx) => [
      t.dailyNo || (idx + 1),
      t.date || '',
      t.name || '',
      t.rollNo ? (Number(t.rollNo) || t.rollNo) : '',
      t.channel || 'VIBER',
      t.concern || t.subject || '',
      t.solution || '',
      t.resolved || 'DONE',
      t.notes || ''
    ])
  ];
  const wsFin = XLSX.utils.aoa_to_sheet(finRows);
  wsFin['!cols'] = [
    { wch: 8 },  // NO
    { wch: 12 }, // DATE
    { wch: 38 }, // NAME
    { wch: 12 }, // ROLL NO.
    { wch: 14 }, // CHANNEL
    { wch: 42 }, // CONCERN
    { wch: 46 }, // SOLUTION
    { wch: 12 }, // RESOLVED
    { wch: 38 }  // NOTES
  ];
  XLSX.utils.book_append_sheet(wb, wsFin, 'FINANCE 2026');

  const today = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `IBP_Helpdesk_Tracker_${today}.xlsx`);
}

export function parseExcelTrackerFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, { type: 'array' });
        
        let generalTickets = [];
        let idTickets = [];
        let financeTickets = [];

        // Parse '2026' sheet if exists
        const s2026Name = wb.SheetNames.find(n => n.trim() === '2026');
        if (s2026Name) {
          const rows = XLSX.utils.sheet_to_json(wb.Sheets[s2026Name]);
          generalTickets = rows.map((r, i) => ({
            id: 'GEN-' + String(i + 1).padStart(4, '0'),
            type: 'GENERAL',
            sheetName: '2026',
            dailyNo: r['NO'] || (i + 1),
            date: excelDateToJS(r['DATE']),
            name: (r['NAME'] || '').toString().trim(),
            rollNo: (r['ROLL NO.'] || r['ROLL NO'] || '').toString().trim(),
            channel: (r['CHANNEL'] || 'VIBER').toString().trim().toUpperCase(),
            category: (r['CATEGORY'] || 'HELPDESK').toString().trim().toUpperCase(),
            concern: (r['CONCERN'] || '').toString().trim(),
            solution: (r['SOLUTION'] || '').toString().trim(),
            resolved: (r['RESOLVED'] || 'DONE').toString().trim().toUpperCase(),
            subject: r['CONCERN'] || '',
            chapter: '',
            trackingNo: '',
            notes: ''
          }));
        }

        // Parse 'Follow-up (ID) 2026'
        const sIdName = wb.SheetNames.find(n => n.includes('Follow-up (ID)') || n.includes('ID (Follow-up)'));
        if (sIdName) {
          const rows = XLSX.utils.sheet_to_json(wb.Sheets[sIdName]);
          idTickets = rows.map((r, i) => ({
            id: 'ID-' + String(i + 1).padStart(4, '0'),
            type: 'ID_FOLLOWUP',
            sheetName: 'Follow-up (ID) 2026',
            dailyNo: r['Column 1'] || r['NO'] || (i + 1),
            date: excelDateToJS(r['DATE']),
            subject: (r['SUBJECT'] || '').toString().trim(),
            rollNo: (r['ROLL NO'] || r['ROLL NO.'] || '').toString().trim(),
            name: (r['NAME'] || '').toString().trim(),
            chapter: (r['CHAPTER'] || '').toString().trim(),
            trackingNo: (r['LBC TRACKING NUMBER'] || '').toString().trim(),
            solution: (r['SOLUTION'] || '').toString().trim(),
            notes: (r['NOTES'] || '').toString().trim(),
            concern: r['SUBJECT'] || '',
            channel: 'VIBER',
            category: 'ID',
            resolved: (r['SOLUTION'] && r['SOLUTION'].toLowerCase().includes('delivered')) ? 'DONE' : 'PENDING'
          }));
        }

        // Parse 'FINANCE 2026'
        const sFinName = wb.SheetNames.find(n => n.includes('FINANCE'));
        if (sFinName) {
          const rows = XLSX.utils.sheet_to_json(wb.Sheets[sFinName]);
          financeTickets = rows.map((r, i) => ({
            id: 'FIN-' + String(i + 1).padStart(4, '0'),
            type: 'FINANCE',
            sheetName: 'FINANCE 2026',
            dailyNo: r['NO'] || (i + 1),
            date: excelDateToJS(r['DATE']),
            name: (r['NAME'] || '').toString().trim(),
            rollNo: (r['ROLL NO.'] || r['ROLL NO'] || '').toString().trim(),
            channel: (r['CHANNEL'] || 'VIBER').toString().trim().toUpperCase(),
            category: 'FINANCE',
            concern: (r['CONCERN'] || '').toString().trim(),
            solution: (r['SOLUTION'] || '').toString().trim(),
            resolved: (r['RESOLVED'] || 'DONE').toString().trim().toUpperCase(),
            notes: (r['NOTES'] || '').toString().trim(),
            subject: r['CONCERN'] || '',
            chapter: '',
            trackingNo: ''
          }));
        }

        // Build Attorneys index
        const attorneyMap = {};
        [...generalTickets, ...idTickets, ...financeTickets].forEach(t => {
          if (!t.name || t.name === 'NOT SPECIFIED') return;
          const key = t.rollNo && t.rollNo !== '-' ? 'ROLL_' + t.rollNo : 'NAME_' + t.name.toUpperCase();
          if (!attorneyMap[key]) {
            attorneyMap[key] = {
              name: t.name,
              rollNo: t.rollNo && t.rollNo !== '-' ? t.rollNo : '',
              chapter: t.chapter || '',
              tickets: []
            };
          }
          if (!attorneyMap[key].chapter && t.chapter) {
            attorneyMap[key].chapter = t.chapter;
          }
          attorneyMap[key].tickets.push(t.id);
        });

        resolve({
          generalTickets,
          idTickets,
          financeTickets,
          attorneys: Object.values(attorneyMap),
          sheetNames: wb.SheetNames
        });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}
