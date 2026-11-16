import React, { useState, useRef } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  ClipboardPaste, 
  Plus, 
  Trash2, 
  Download, 
  Search, 
  Check, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { FieldConfig, RecordData } from '../types';
import { parseExcelFile, autoMapColumns, exportSampleExcel } from '../services/excelService';

interface DataModalProps {
  isOpen: boolean;
  fields: FieldConfig[];
  records: RecordData[];
  onClose: () => void;
  onUpdateRecords: (records: RecordData[]) => void;
  onAutoCreateFieldsFromHeaders: (headers: string[]) => void;
}

export const DataModal: React.FC<DataModalProps> = ({
  isOpen,
  fields,
  records,
  onClose,
  onUpdateRecords,
  onAutoCreateFieldsFromHeaders
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showPasteBox, setShowPasteBox] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Lưu trữ headers phát hiện từ file Excel gần nhất để mapping
  const [detectedHeaders, setDetectedHeaders] = useState<string[]>([]);
  const [showMappingPanel, setShowMappingPanel] = useState(false);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Lấy danh sách tất cả các keys xuất hiện trong bảng dữ liệu
  const allDataKeys = Array.from(new Set([
    ...fields.map(f => f.key),
    ...records.flatMap(r => Object.keys(r))
  ])).filter(Boolean);

  // Xử lý upload file Excel / CSV
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImportStatus('Đang đọc dữ liệu từ file Excel...');
      const { headers, records: importedRecords } = await parseExcelFile(file);

      if (importedRecords.length === 0) {
        setImportStatus('Không tìm thấy dữ liệu trong file!');
        return;
      }

      setDetectedHeaders(headers);
      const autoMap = autoMapColumns(headers, fields);
      setColumnMapping(autoMap);
      setShowMappingPanel(true);

      // Lưu tạm records
      onUpdateRecords(importedRecords);
      setImportStatus(`Đã nhập thành công ${importedRecords.length} dòng dữ liệu!`);
    } catch (err: any) {
      console.error(err);
      setImportStatus(`Lỗi khi đọc file: ${err.message || 'Không đúng định dạng'}`);
    } finally {
      e.target.value = '';
    }
  };

  // Áp dụng gán cột (Apply Mapping)
  const applyMapping = () => {
    // Biến đổi records dựa trên mapping: key đích = giá trị cột nguồn
    const updated = records.map(row => {
      const newRow: RecordData = { ...row };
      fields.forEach(field => {
        const sourceHeader = columnMapping[field.key];
        if (sourceHeader && row[sourceHeader] !== undefined) {
          newRow[field.key] = row[sourceHeader];
        }
      });
      return newRow;
    });

    onUpdateRecords(updated);
    setShowMappingPanel(false);
    setImportStatus('Đã đồng bộ dữ liệu vào các trường thành công!');
  };

  // Tự động tạo trường mới cho các cột chưa có
  const handleAutoCreateFields = () => {
    if (detectedHeaders.length > 0) {
      onAutoCreateFieldsFromHeaders(detectedHeaders);
      setShowMappingPanel(false);
      setImportStatus('Đã tự động tạo các trường trên biểu mẫu tương ứng với file Excel!');
    }
  };

  // Xử lý paste nhanh từ clipboard
  const handleProcessPasted = () => {
    if (!pastedText.trim()) return;

    const lines = pastedText.split(/\r?\n/).filter(line => line.trim() !== '');
    const newRecords: RecordData[] = [];

    // Lấy danh sách trường đang hiện làm cột đích
    const targetFields = fields.filter(f => f.visible);

    lines.forEach((line) => {
      const parts = line.includes('\t') ? line.split('\t') : line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)|;/);
      const row: RecordData = {};

      parts.forEach((val, idx) => {
        const cleanVal = val.replace(/^"|"$/g, '').trim();
        if (idx < targetFields.length) {
          row[targetFields[idx].key] = cleanVal;
        } else {
          row[`Cột_${idx + 1}`] = cleanVal;
        }
      });

      if (Object.values(row).some(v => v !== '')) {
        newRecords.push(row);
      }
    });

    if (newRecords.length > 0) {
      onUpdateRecords([...records, ...newRecords]);
      setPastedText('');
      setShowPasteBox(false);
      setImportStatus(`Đã thêm ${newRecords.length} dòng từ clipboard!`);
    }
  };

  const handleCellChange = (rowIndex: number, key: string, value: string) => {
    const updated = [...records];
    updated[rowIndex] = { ...updated[rowIndex], [key]: value };
    onUpdateRecords(updated);
  };

  const handleAddRow = () => {
    const emptyRow: RecordData = {};
    fields.forEach(f => { emptyRow[f.key] = ''; });
    onUpdateRecords([...records, emptyRow]);
  };

  const handleDeleteRow = (index: number) => {
    const updated = records.filter((_, idx) => idx !== index);
    onUpdateRecords(updated);
  };

  const handleClearAll = () => {
    if (confirm('Bạn có chắc chắn muốn xóa toàn bộ danh sách dữ liệu này không?')) {
      onUpdateRecords([]);
      setImportStatus(null);
    }
  };

  // Lọc dữ liệu tìm kiếm
  const filteredRecords = records.filter(row => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return Object.values(row).some(val => String(val || '').toLowerCase().includes(term));
  });

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Modal */}
        <div className="px-6 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Danh Sách Dữ Liệu In Hàng Loạt</h3>
              <p className="text-xs text-slate-500">Tải file Excel (.xlsx), CSV, dán trực tiếp hoặc thêm thủ công</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thanh công cụ hành động */}
        <div className="px-6 py-2.5 bg-indigo-50/60 border-b border-indigo-100 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            {/* Nhập file Excel */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Nhập File Excel / CSV</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              className="hidden"
              onChange={handleFileUpload}
            />

            {/* Dán từ clipboard */}
            <button
              onClick={() => setShowPasteBox(!showPasteBox)}
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition"
            >
              <ClipboardPaste className="w-3.5 h-3.5 text-blue-600" />
              <span>Dán nhanh từ Excel</span>
            </button>

            {/* Thêm dòng */}
            <button
              onClick={handleAddRow}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm dòng</span>
            </button>

            {/* Tải file mẫu */}
            <button
              onClick={() => exportSampleExcel(fields)}
              className="bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition"
              title="Tải file Excel mẫu với các cột tương ứng biểu mẫu"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Tải file Excel mẫu</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Ô tìm kiếm */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1 bg-white border border-slate-300 rounded-lg text-xs w-44 focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              onClick={handleClearAll}
              disabled={records.length === 0}
              className="text-xs text-rose-600 hover:text-rose-700 disabled:opacity-40 font-medium flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa tất cả</span>
            </button>
          </div>
        </div>

        {/* Thông báo trạng thái nhập */}
        {importStatus && (
          <div className="px-6 py-2 bg-blue-50 text-blue-800 text-xs flex items-center justify-between border-b border-blue-100 shrink-0">
            <span>{importStatus}</span>
            <button onClick={() => setImportStatus(null)} className="text-blue-500 hover:text-blue-700">✕</button>
          </div>
        )}

        {/* Khung Dán Nhanh từ Excel (Clipboard Box) */}
        {showPasteBox && (
          <div className="px-6 py-3 bg-slate-100 border-b border-slate-200 shrink-0 animate-in fade-in duration-100">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Sao chép các dòng trong Excel và dán trực tiếp vào ô bên dưới:
            </label>
            <textarea
              rows={3}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Nguyễn Văn A	Hà Nội	0912345678&#10;Trần Thị B	Đà Nẵng	0987654321"
              className="w-full p-2.5 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
            />
            <div className="mt-2 flex justify-end gap-2">
              <button
                onClick={() => setShowPasteBox(false)}
                className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded-md"
              >
                Hủy
              </button>
              <button
                onClick={handleProcessPasted}
                className="px-3.5 py-1 text-xs bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition"
              >
                Thêm vào bảng
              </button>
            </div>
          </div>
        )}

        {/* Bảng Ánh Xạ Cột (Column Mapping Panel) sau khi đọc Excel */}
        {showMappingPanel && detectedHeaders.length > 0 && (
          <div className="px-6 py-3.5 bg-amber-50/80 border-b border-amber-200 shrink-0 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Liên kết cột file Excel vào các trường trên biểu mẫu (Column Mapping):</span>
              </div>
              <button
                onClick={handleAutoCreateFields}
                className="text-xs bg-amber-600 hover:bg-amber-700 text-white font-semibold px-2.5 py-1 rounded-md flex items-center gap-1 transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Tự động tạo trường mới từ các cột Excel</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-1">
              {fields.map(field => (
                <div key={field.id} className="bg-white p-2 rounded-lg border border-amber-200 text-xs">
                  <span className="font-semibold text-slate-700 block truncate">{field.label}:</span>
                  <select
                    value={columnMapping[field.key] || ''}
                    onChange={(e) => setColumnMapping(prev => ({ ...prev, [field.key]: e.target.value }))}
                    className="mt-1 w-full p-1 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none"
                  >
                    <option value="">-- Chưa gán cột --</option>
                    {detectedHeaders.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setShowMappingPanel(false)}
                className="px-3 py-1 text-xs text-slate-600 hover:bg-amber-100 rounded"
              >
                Bỏ qua
              </button>
              <button
                onClick={applyMapping}
                className="px-4 py-1 text-xs bg-emerald-600 text-white font-semibold rounded hover:bg-emerald-700 flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Xác nhận liên kết</span>
              </button>
            </div>
          </div>
        )}

        {/* Bảng dữ liệu chính */}
        <div className="flex-1 overflow-auto p-4 sm:p-6">
          {records.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center">
              <FileSpreadsheet className="w-12 h-12 stroke-1 mb-2 text-slate-300" />
              <p className="font-semibold text-slate-600 text-sm">Chưa có bản ghi in nào</p>
              <p className="text-slate-400 mt-1 max-w-sm">
                Hãy tải lên một file Excel (.xlsx), dán dữ liệu hoặc bấm "Thêm dòng" ở trên để nhập thông tin in hàng loạt.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 bg-slate-100 z-10 shadow-xs">
                <tr className="border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-3 w-10 text-center">#</th>
                  {allDataKeys.map(key => {
                    const field = fields.find(f => f.key === key);
                    return (
                      <th key={key} className="py-2.5 px-3 min-w-[140px]">
                        <div className="flex items-center gap-1">
                          <span>{field ? field.label : key}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({key})</span>
                        </div>
                      </th>
                    );
                  })}
                  <th className="py-2.5 px-3 w-12 text-center">Xóa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition">
                    <td className="py-2 px-3 text-center text-slate-400 font-mono font-medium">
                      {idx + 1}
                    </td>
                    {allDataKeys.map(key => (
                      <td key={key} className="py-1 px-2">
                        <input
                          type="text"
                          value={row[key] || ''}
                          onChange={(e) => handleCellChange(idx, key, e.target.value)}
                          placeholder="..."
                          className="w-full px-2 py-1 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-slate-200 focus:border-blue-500 rounded text-slate-800 transition"
                        />
                      </td>
                    ))}
                    <td className="py-1 px-3 text-center">
                      <button
                        onClick={() => handleDeleteRow(idx)}
                        className="p-1 text-slate-300 hover:text-rose-600 rounded transition"
                        title="Xóa dòng"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer Modal */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            Tổng cộng: <strong className="text-slate-900 font-bold">{records.length}</strong> bản ghi sẽ được in
          </span>
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-xs font-semibold transition shadow-xs"
          >
            Hoàn tất & Áp dụng
          </button>
        </div>
      </div>
    </div>
  );
};
