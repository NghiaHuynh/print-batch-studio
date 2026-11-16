import assert from 'node:assert';
import * as XLSX from 'xlsx';

// Test 1: XLSX basic parsing
const ws = XLSX.utils.aoa_to_sheet([
  ['Họ và Tên', 'Chức Vụ', 'Địa Chỉ'],
  ['Nguyễn Văn An', 'Giám Đốc', 'Hà Nội'],
  ['Trần Thị B', 'Nhân Viên', 'TP.HCM']
]);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Test');
const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
const readWb = XLSX.read(buf, { type: 'buffer' });
const sheetData = XLSX.utils.sheet_to_json(readWb.Sheets[readWb.SheetNames[0]]);
assert.strictEqual(sheetData.length, 2, 'Should parse 2 data rows');
assert.strictEqual(sheetData[0]['Họ và Tên'], 'Nguyễn Văn An');

console.log('✅ SheetJS Excel generation and parsing verified successfully!');
