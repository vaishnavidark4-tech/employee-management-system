// Very small CSV builder (no extra library needed).
// columns: [{ header: 'Task ID', value: (row) => row.taskId }, ...]

const escapeCsvValue = (value) => {
  if (value === null || value === undefined) return '';
  let text = String(value);

  // Prevent "CSV injection" when the file is opened in Excel
  if (/^[=+\-@]/.test(text)) text = `'${text}`;

  // Wrap in quotes if the value has a comma, quote or new line
  if (/[",\r\n]/.test(text)) text = `"${text.replace(/"/g, '""')}"`;
  return text;
};

const toCsv = (rows, columns) => {
  const headerLine = columns.map((col) => escapeCsvValue(col.header)).join(',');
  const lines = rows.map((row) => columns.map((col) => escapeCsvValue(col.value(row))).join(','));
  // ﻿ (BOM) so Excel opens the file with correct UTF-8 encoding
  return `﻿${[headerLine, ...lines].join('\r\n')}`;
};

module.exports = { toCsv };
