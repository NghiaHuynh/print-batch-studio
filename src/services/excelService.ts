import * as XLSX from 'xlsx';
import { FieldConfig, RecordData } from '../types';

export interface ExcelImportResult {
  headers: string[];
  records: RecordData[];
}

export function parseExcelFile(file: File): Promise<ExcelImportResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
        
        // Lấy sheet đầu tiên
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Chuyển thành mảng 2 chiều
        const rawJson: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

        if (!rawJson || rawJson.length === 0) {
          throw new Error('File Excel rỗng, không tìm thấy dữ liệu!');
        }

        // Dòng đầu tiên là tiêu đề (Headers)
        const headerRow = rawJson[0] as any[];
        const headers: string[] = headerRow.map((col, idx) => {
          const str = String(col || '').trim();
          return str || `Cột_${idx + 1}`;
        });

        // Các dòng sau là dữ liệu
        const records: RecordData[] = [];
        for (let r = 1; r < rawJson.length; r++) {
          const row = rawJson[r];
          // Bỏ qua dòng trống hoàn toàn
          if (!row || row.every((c: any) => c === '' || c === null || c === undefined)) {
            continue;
          }

          const record: RecordData = {};
          headers.forEach((h, colIdx) => {
            let val = row[colIdx];
            if (val === null || val === undefined) val = '';
            // Định dạng ngày tháng nếu là object Date
            if (val instanceof Date) {
              val = val.toLocaleDateString('vi-VN');
            }
            record[h] = String(val).trim();
          });
          records.push(record);
        }

        resolve({ headers, records });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsBinaryString(file);
  });
}

// Tự động liên kết các cột trong Excel với danh sách Field
export function autoMapColumns(headers: string[], fields: FieldConfig[]): Record<string, string> {
  const mapping: Record<string, string> = {}; // key: field.key, value: header

  fields.forEach(field => {
    // 1. Khớp chính xác key
    const exactMatch = headers.find(h => h.toLowerCase() === field.key.toLowerCase());
    if (exactMatch) {
      mapping[field.key] = exactMatch;
      return;
    }

    // 2. Khớp với nhãn (label)
    const labelMatch = headers.find(h => h.toLowerCase() === field.label.toLowerCase());
    if (labelMatch) {
      mapping[field.key] = labelMatch;
      return;
    }

    // 3. Khớp từ khóa thông minh
    const lowerKey = field.key.toLowerCase();
    const lowerLabel = field.label.toLowerCase();

    const smartMatch = headers.find(h => {
      const lowerH = h.toLowerCase();
      if ((lowerKey.includes('name') || lowerLabel.includes('tên')) && (lowerH.includes('tên') || lowerH.includes('name'))) return true;
      if ((lowerKey.includes('addr') || lowerLabel.includes('địa chỉ')) && (lowerH.includes('địa chỉ') || lowerH.includes('address'))) return true;
      if ((lowerKey.includes('phone') || lowerLabel.includes('thoại')) && (lowerH.includes('sđt') || lowerH.includes('phone') || lowerH.includes('điện thoại'))) return true;
      if ((lowerKey.includes('code') || lowerLabel.includes('mã')) && (lowerH.includes('mã') || lowerH.includes('code') || lowerH.includes('id'))) return true;
      if ((lowerKey.includes('title') || lowerLabel.includes('chức vụ')) && (lowerH.includes('chức vụ') || lowerH.includes('vị trí') || lowerH.includes('title'))) return true;
      return false;
    });

    if (smartMatch) {
      mapping[field.key] = smartMatch;
    }
  });

  return mapping;
}

// Xuất file Excel mẫu dựa trên các trường hiện tại của biểu mẫu
export function exportSampleExcel(fields: FieldConfig[], fileName: string = 'Mau_Danh_Sach_In.xlsx') {
  const visibleFields = fields.filter(f => f.visible);
  const headers = visibleFields.map(f => f.label || f.key);
  
  // Dòng mẫu 1 & 2
  const sampleRow1 = visibleFields.map(f => {
    if (f.type === 'qr' || f.type === 'barcode') return `CODE-${Math.floor(1000 + Math.random() * 9000)}`;
    if (f.key.includes('name') || f.label.includes('Tên')) return 'Nguyễn Văn An';
    if (f.key.includes('address') || f.label.includes('Địa chỉ')) return '123 Đường Lê Lợi, Quận 1, TP.HCM';
    if (f.key.includes('phone') || f.label.includes('Điện thoại')) return '0912345678';
    return `Giá trị mẫu ${f.label}`;
  });

  const sampleRow2 = visibleFields.map(f => {
    if (f.type === 'qr' || f.type === 'barcode') return `CODE-${Math.floor(1000 + Math.random() * 9000)}`;
    if (f.key.includes('name') || f.label.includes('Tên')) return 'Trần Thị Bích Ngọc';
    if (f.key.includes('address') || f.label.includes('Địa chỉ')) return '45 Phố Huế, Hoàn Kiếm, Hà Nội';
    if (f.key.includes('phone') || f.label.includes('Điện thoại')) return '0988765432';
    return `Giá trị mẫu 2`;
  });

  const ws = XLSX.utils.aoa_to_sheet([headers, sampleRow1, sampleRow2]);
  
  // Tự động set chiều rộng cột
  const colWidths = headers.map(h => ({ wch: Math.max(h.length + 5, 18) }));
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'DanhSach');
  XLSX.writeFile(wb, fileName);
}
