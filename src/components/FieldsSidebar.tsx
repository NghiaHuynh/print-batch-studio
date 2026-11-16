import React, { useState } from 'react';
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  EyeOff, 
  Trash2, 
  QrCode, 
  Barcode, 
  Type, 
  Layers, 
  Info,
  Sparkles,
  Stamp
} from 'lucide-react';
import { FieldConfig, FieldType, RecordData } from '../types';

interface FieldsSidebarProps {
  fields: FieldConfig[];
  selectedFieldId: string | null;
  records: RecordData[];
  previewIndex: number;
  onSelectField: (id: string) => void;
  onToggleFieldVisibility: (id: string) => void;
  onDeleteField: (id: string) => void;
  onAddField: (type: FieldType, label: string, key: string) => void;
  onPrevRecord: () => void;
  onNextRecord: () => void;
  onSetPreviewIndex: (index: number) => void;
}

export const FieldsSidebar: React.FC<FieldsSidebarProps> = ({
  fields,
  selectedFieldId,
  records,
  previewIndex,
  onSelectField,
  onToggleFieldVisibility,
  onDeleteField,
  onAddField,
  onPrevRecord,
  onNextRecord,
  onSetPreviewIndex
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldKey, setNewFieldKey] = useState('');
  const [newFieldType, setNewFieldType] = useState<FieldType>('text');

  const handleCreateField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldLabel.trim()) return;
    const finalKey = newFieldKey.trim() || newFieldLabel.trim().toLowerCase().replace(/[^a-z0-9]/gi, '_');
    onAddField(newFieldType, newFieldLabel.trim(), finalKey);
    setNewFieldLabel('');
    setNewFieldKey('');
    setShowAddModal(false);
  };

  const currentRecord = records[previewIndex] || {};

  return (
    <aside className="w-full lg:w-72 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col shrink-0 z-20 max-h-56 lg:max-h-full overflow-hidden select-none">
      {/* Phần 1: Tiêu đề & Nút thêm trường */}
      <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">Trường dữ liệu ({fields.length})</h2>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Thêm trường</span>
        </button>
      </div>

      {/* Danh sách các trường dữ liệu kéo thả */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {fields.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs">
            Chưa có trường nào. Bấm <b>Thêm trường</b> để bắt đầu thiết kế.
          </div>
        ) : (
          fields.map((field) => {
            const isSelected = field.id === selectedFieldId;
            return (
              <div
                key={field.id}
                onClick={() => onSelectField(field.id)}
                className={`flex items-center justify-between p-2 rounded-xl border text-left transition cursor-pointer ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/70 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`p-1.5 rounded-lg shrink-0 ${
                    field.type === 'qr' ? 'bg-indigo-100 text-indigo-700' :
                    field.type === 'barcode' ? 'bg-purple-100 text-purple-700' :
                    field.type === 'seal' ? 'bg-rose-100 text-rose-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {field.type === 'qr' ? <QrCode className="w-3.5 h-3.5" /> :
                     field.type === 'barcode' ? <Barcode className="w-3.5 h-3.5" /> :
                     field.type === 'seal' ? <Stamp className="w-3.5 h-3.5" /> :
                     <Type className="w-3.5 h-3.5" />}
                  </div>
                  <div className="min-w-0 truncate">
                    <p className="text-xs font-semibold text-slate-800 truncate">{field.label}</p>
                    <p className="text-[10px] font-mono text-slate-400 truncate">Cột: {field.key}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onToggleFieldVisibility(field.id)}
                    className={`p-1 rounded-md transition ${field.visible ? 'text-slate-500 hover:text-slate-800' : 'text-slate-300 hover:text-slate-500'}`}
                    title={field.visible ? 'Ẩn trường' : 'Hiện trường'}
                  >
                    {field.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => onDeleteField(field.id)}
                    className="p-1 text-slate-300 hover:text-rose-600 rounded-md transition"
                    title="Xóa trường này"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Phần 2: Xem trước bản ghi thực tế */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/70 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Xem trước dữ liệu ({records.length})</span>
          <span className="text-[11px] font-semibold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-full">
            {records.length > 0 ? `${previewIndex + 1} / ${records.length}` : '0 / 0'}
          </span>
        </div>

        <div className="flex items-center justify-between gap-1 mb-2">
          <button
            onClick={onPrevRecord}
            disabled={records.length <= 1}
            className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 text-slate-700 transition"
            title="Bản ghi trước"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <input
            type="range"
            min={0}
            max={Math.max(0, records.length - 1)}
            value={previewIndex}
            onChange={(e) => onSetPreviewIndex(parseInt(e.target.value) || 0)}
            disabled={records.length <= 1}
            className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
          />
          <button
            onClick={onNextRecord}
            disabled={records.length <= 1}
            className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 text-slate-700 transition"
            title="Bản ghi tiếp theo"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Thẻ hiển thị giá trị hiện tại */}
        <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs space-y-1 max-h-24 overflow-y-auto">
          {records.length === 0 ? (
            <p className="text-slate-400 italic">Chưa có bản ghi nào.</p>
          ) : (
            fields.filter(f => f.visible).slice(0, 4).map(f => (
              <div key={f.id} className="flex justify-between items-center text-[11px] gap-2">
                <span className="text-slate-400 font-medium truncate shrink-0">{f.label}:</span>
                <span className="text-slate-800 font-semibold truncate text-right">
                  {currentRecord[f.key] || currentRecord[f.label] || '(trống)'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal tạo trường mới */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-5 shadow-2xl max-w-sm w-full border border-slate-200 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm">Thêm Trường Dữ Liệu Mới</h3>
            </div>

            <form onSubmit={handleCreateField} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Loại trường</label>
                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setNewFieldType('text')}
                    className={`py-2 px-1.5 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 border transition ${
                      newFieldType === 'text' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <Type className="w-4 h-4" />
                    <span>Chữ</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewFieldType('qr')}
                    className={`py-2 px-1.5 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 border transition ${
                      newFieldType === 'qr' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Mã QR</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewFieldType('barcode')}
                    className={`py-2 px-1.5 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 border transition ${
                      newFieldType === 'barcode' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <Barcode className="w-4 h-4" />
                    <span>Vạch</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewFieldType('seal')}
                    className={`py-2 px-1.5 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 border transition ${
                      newFieldType === 'seal' ? 'border-rose-600 bg-rose-50 text-rose-700' : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <Stamp className="w-4 h-4" />
                    <span>Mộc Đỏ</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tên trường (Nhãn hiển thị)</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Chức Vụ, Mã Nhân Viên, SĐT..."
                  value={newFieldLabel}
                  onChange={(e) => {
                    setNewFieldLabel(e.target.value);
                    if (!newFieldKey) {
                      setNewFieldKey(e.target.value.toLowerCase().replace(/[^a-z0-9]/gi, '_'));
                    }
                  }}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Khóa liên kết dữ liệu Excel (Key)
                </label>
                <input
                  type="text"
                  placeholder="name, code, phone..."
                  value={newFieldKey}
                  onChange={(e) => setNewFieldKey(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono focus:outline-none focus:border-blue-600"
                />
                <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Khóa dùng để tự động bắt dữ liệu từ cột Excel.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                  Tạo trường
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
};
