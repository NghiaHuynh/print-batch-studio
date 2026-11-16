import React from 'react';
import { 
  Sliders, 
  AlignCenterHorizontal, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Italic, 
  CaseUpper, 
  Palette, 
  HelpCircle,
  FileText,
  RotateCw,
  Eye,
  EyeOff,
  Sparkles,
  Stamp
} from 'lucide-react';
import { FieldConfig, TemplateInfo } from '../types';

interface InspectorSidebarProps {
  selectedField: FieldConfig | null;
  stageWidth: number;
  stageHeight: number;
  templateInfo?: TemplateInfo;
  onUpdateField: (id: string, updates: Partial<FieldConfig>) => void;
  onCenterHorizontally: (id: string) => void;
  onUpdateTemplateInfo?: (updates: Partial<TemplateInfo>) => void;
  onUpdateStageDimensions?: (width: number, height: number) => void;
  onAutoDetectText?: () => void;
  isDetectingText?: boolean;
}

const FONT_OPTIONS = [
  { label: 'Times New Roman (Chuẩn văn bản pháp quy)', value: "'Times New Roman', Times, serif" },
  { label: 'Inter (Hiện đại, rõ nét)', value: "'Inter', sans-serif" },
  { label: 'Playfair Display (Trang trọng, có chân)', value: "'Playfair Display', serif" },
  { label: 'Roboto (Chuẩn văn bản)', value: "'Roboto', sans-serif" },
  { label: 'Merriweather (Cổ điển, thanh lịch)', value: "'Merriweather', serif" },
  { label: 'Montserrat (Hình học, ấn tượng)', value: "'Montserrat', sans-serif" },
  { label: 'Space Mono (Đánh máy / Mã số)', value: "'Space Mono', monospace" }
];

export const InspectorSidebar: React.FC<InspectorSidebarProps> = ({
  selectedField,
  stageWidth,
  stageHeight,
  templateInfo,
  onUpdateField,
  onCenterHorizontally,
  onUpdateTemplateInfo,
  onUpdateStageDimensions,
  onAutoDetectText,
  isDetectingText
}) => {
  // Khi KHÔNG chọn trường nào: Hiển thị Bảng điều khiển & Chỉnh sửa cấu trúc Phôi Mẫu
  if (!selectedField) {
    return (
      <aside className="w-full lg:w-80 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 p-4 flex flex-col shrink-0 z-20 text-slate-700 overflow-y-auto select-none space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">Cấu hình Biểu Mẫu</h2>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {stageWidth > stageHeight ? 'Khổ ngang' : 'Khổ dọc'}
          </span>
        </div>

        {/* Thông tin phôi hiện tại */}
        {templateInfo && (
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span className="truncate" title={templateInfo.name}>{templateInfo.name}</span>
            </div>
            <div className="text-[11px] text-slate-500 flex justify-between">
              <span>Định dạng phôi:</span>
              <span className="font-semibold uppercase text-slate-700">{templateInfo.type}</span>
            </div>
            {templateInfo.type === 'pdf' && (
              <div className="text-[11px] text-slate-500 flex justify-between">
                <span>Số trang PDF:</span>
                <span className="font-semibold text-blue-600">{templateInfo.currentPage} / {templateInfo.numPages}</span>
              </div>
            )}
          </div>
        )}

        {/* Tính năng Nhận diện văn bản thông minh từ phôi */}
        {onAutoDetectText && (
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-3 rounded-xl border border-indigo-200/80 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-indigo-950">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Tự nhận diện chữ trên phôi</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Quét toàn bộ chữ trong file PDF hoặc ảnh biểu mẫu và tự động chuyển thành các trường văn bản kéo thả để chỉnh sửa dễ dàng.
            </p>
            <button
              onClick={onAutoDetectText}
              disabled={isDetectingText}
              className="w-full py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer active:scale-95"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isDetectingText ? 'animate-spin' : ''}`} />
              <span>{isDetectingText ? 'Đang nhận diện chữ...' : 'Nhận diện chữ thành văn bản'}</span>
            </button>
          </div>
        )}

        {/* Chỉnh sửa Kích thước & Khổ giấy chuẩn */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Kích thước khung phôi (px)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-50 p-1.5 px-2 rounded-lg border border-slate-200 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400">Rộng:</span>
              <input
                type="number"
                value={stageWidth}
                onChange={(e) => onUpdateStageDimensions && onUpdateStageDimensions(parseInt(e.target.value) || 100, stageHeight)}
                className="w-16 text-right bg-transparent font-mono text-xs font-semibold text-slate-800 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400">px</span>
            </div>
            <div className="bg-slate-50 p-1.5 px-2 rounded-lg border border-slate-200 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400">Cao:</span>
              <input
                type="number"
                value={stageHeight}
                onChange={(e) => onUpdateStageDimensions && onUpdateStageDimensions(stageWidth, parseInt(e.target.value) || 100)}
                className="w-16 text-right bg-transparent font-mono text-xs font-semibold text-slate-800 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400">px</span>
            </div>
          </div>

          {/* Các nút khổ giấy chuẩn */}
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            <button
              onClick={() => onUpdateStageDimensions && onUpdateStageDimensions(842, 595)}
              className="py-1 px-2 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition text-center"
            >
              A4 Ngang (842×595)
            </button>
            <button
              onClick={() => onUpdateStageDimensions && onUpdateStageDimensions(595, 842)}
              className="py-1 px-2 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition text-center"
            >
              A4 Dọc (595×842)
            </button>
            <button
              onClick={() => onUpdateStageDimensions && onUpdateStageDimensions(595, 420)}
              className="py-1 px-2 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition text-center"
            >
              A5 Ngang (595×420)
            </button>
            <button
              onClick={() => onUpdateStageDimensions && onUpdateStageDimensions(480, 720)}
              className="py-1 px-2 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition text-center"
            >
              Thẻ Đeo (480×720)
            </button>
          </div>

          <button
            onClick={() => onUpdateStageDimensions && onUpdateStageDimensions(stageHeight, stageWidth)}
            className="w-full mt-2 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Đổi hướng phôi (Ngang ⇄ Dọc)</span>
          </button>
        </div>

        {/* Tùy chỉnh Độ mờ & Chế độ in */}
        {templateInfo && (
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1">
                <span>Độ mờ phôi nền khi căn chỉnh</span>
                <span className="font-mono text-blue-600">{Math.round(templateInfo.opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="1"
                step="0.05"
                value={templateInfo.opacity}
                onChange={(e) => onUpdateTemplateInfo && onUpdateTemplateInfo({ opacity: parseFloat(e.target.value) })}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Chế độ In / Xuất file PDF</label>
              <button
                onClick={() => onUpdateTemplateInfo && onUpdateTemplateInfo({ printBackground: !templateInfo.printBackground })}
                className={`w-full py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition ${
                  templateInfo.printBackground
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-amber-50 border-amber-300 text-amber-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  {templateInfo.printBackground ? <Eye className="w-4 h-4 text-blue-600" /> : <EyeOff className="w-4 h-4 text-amber-600" />}
                  <span>{templateInfo.printBackground ? 'In kèm ảnh phôi nền' : 'Chỉ in chữ (ẩn ảnh phôi)'}</span>
                </div>
                <span className="text-[10px] font-bold uppercase underline">Đổi</span>
              </button>
              <p className="text-[10px] text-slate-400 mt-1">
                * Chọn "Chỉ in chữ" nếu bạn đã có sẵn phôi giấy in hoa văn sẵn để in đè chữ lên.
              </p>
            </div>
          </div>
        )}

        {/* Gợi ý hướng dẫn */}
        <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3 text-xs text-blue-900 space-y-1 mt-auto">
          <div className="font-semibold flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Mẹo căn chỉnh mẫu mới:</span>
          </div>
          <p className="text-[11px] text-blue-800">• <b>Nhấp đúp chuột</b> trực tiếp vào bất kỳ vị trí nào trên phôi để đặt trường ngay tại đó.</p>
          <p className="text-[11px] text-blue-800">• Chọn một trường để chỉnh font chữ, cỡ chữ và màu sắc.</p>
        </div>
      </aside>
    );
  }

  // Khi ĐANG CHỌN một trường: Hiển thị thuộc tính của trường
  return (
    <aside className="w-full lg:w-80 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 p-4 flex flex-col shrink-0 z-20 overflow-y-auto max-h-72 lg:max-h-full select-none">
      {/* Header Inspector */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex-1 min-w-0 pr-2">
          <input
            type="text"
            value={selectedField.label}
            onChange={(e) => onUpdateField(selectedField.id, { label: e.target.value })}
            className="text-xs font-bold text-slate-900 truncate w-full bg-transparent hover:bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500 rounded px-1 -ml-1 border-0"
            title="Nhấp để đổi tên trường"
          />
          <span className="text-[10px] font-mono text-slate-400 block px-0.5">cột: {selectedField.key}</span>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
          selectedField.type === 'qr' ? 'bg-indigo-100 text-indigo-700' :
          selectedField.type === 'barcode' ? 'bg-purple-100 text-purple-700' :
          selectedField.type === 'seal' ? 'bg-rose-100 text-rose-700' :
          'bg-blue-100 text-blue-700'
        }`}>
          {selectedField.type === 'seal' ? 'Mộc tròn' : selectedField.type}
        </span>
      </div>

      <div className="mt-3.5 space-y-4">
        {/* Tọa độ X, Y */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex justify-between">
            <span>Tọa độ vị trí (Pixel)</span>
            <span className="text-[10px] text-slate-400">Kéo hoặc gõ số</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-50 p-1.5 px-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">X:</span>
              <input
                type="number"
                value={selectedField.x}
                onChange={(e) => onUpdateField(selectedField.id, { x: parseInt(e.target.value) || 0 })}
                className="w-16 text-right bg-transparent font-mono text-xs font-semibold text-slate-800 focus:outline-none"
              />
              <span className="text-[11px] text-slate-400">px</span>
            </div>
            <div className="bg-slate-50 p-1.5 px-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Y:</span>
              <input
                type="number"
                value={selectedField.y}
                onChange={(e) => onUpdateField(selectedField.id, { y: parseInt(e.target.value) || 0 })}
                className="w-16 text-right bg-transparent font-mono text-xs font-semibold text-slate-800 focus:outline-none"
              />
              <span className="text-[11px] text-slate-400">px</span>
            </div>
          </div>

          <button
            onClick={() => onCenterHorizontally(selectedField.id)}
            className="mt-2 w-full py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition"
          >
            <AlignCenterHorizontal className="w-3.5 h-3.5" />
            <span>Căn giữa phôi theo chiều ngang</span>
          </button>
        </div>

        {/* Cấu hình cho TEXT */}
        {selectedField.type === 'text' && (
          <>
            {/* 1. Tùy chỉnh Nội dung văn bản trực tiếp */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">Nội dung chữ trên mẫu</label>
                <span className="text-[10px] text-blue-600 font-medium">Chỉnh sửa trực tiếp</span>
              </div>
              {selectedField.width || (selectedField.defaultValue && selectedField.defaultValue.includes('\n')) ? (
                <textarea
                  rows={4}
                  value={selectedField.defaultValue ?? ''}
                  placeholder={`Nội dung cho [${selectedField.label}]...`}
                  onChange={(e) => onUpdateField(selectedField.id, { defaultValue: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-blue-600 font-sans leading-relaxed"
                />
              ) : (
                <input
                  type="text"
                  value={selectedField.defaultValue ?? ''}
                  placeholder={`Nội dung cho [${selectedField.label}]...`}
                  onChange={(e) => onUpdateField(selectedField.id, { defaultValue: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600 font-sans"
                />
              )}
            </div>

            {/* 2. Kiểu chữ (Font Family) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kiểu chữ (Font Family)</label>
              <select
                value={selectedField.fontFamily}
                onChange={(e) => onUpdateField(selectedField.id, { fontFamily: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600"
              >
                {FONT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* 3. CỠ CHỮ LINH HOẠT (Font Size Steppers, Slider & Chips) */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Cỡ chữ (Font Size)</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={8}
                    max={120}
                    step={0.5}
                    value={selectedField.fontSize}
                    onChange={(e) => onUpdateField(selectedField.id, { fontSize: parseFloat(e.target.value) || 12 })}
                    className="w-14 text-center bg-white border border-slate-300 rounded px-1.5 py-0.5 text-xs font-mono font-bold text-blue-700 focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-[11px] font-semibold text-slate-400">px</span>
                </div>
              </div>

              {/* Thanh trượt điều chỉnh mượt mà */}
              <input
                type="range"
                min={8}
                max={60}
                step={0.5}
                value={selectedField.fontSize}
                onChange={(e) => onUpdateField(selectedField.id, { fontSize: parseFloat(e.target.value) || 12 })}
                className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
              />

              {/* Nút tăng giảm nhanh (-2, -1, +1, +2) */}
              <div className="grid grid-cols-4 gap-1">
                <button
                  type="button"
                  onClick={() => onUpdateField(selectedField.id, { fontSize: Math.max(8, Number((selectedField.fontSize - 2).toFixed(1))) })}
                  className="py-1 px-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded text-[11px] font-semibold transition"
                >
                  -2px
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateField(selectedField.id, { fontSize: Math.max(8, Number((selectedField.fontSize - 0.5).toFixed(1))) })}
                  className="py-1 px-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded text-[11px] font-semibold transition"
                >
                  -0.5
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateField(selectedField.id, { fontSize: Math.min(120, Number((selectedField.fontSize + 0.5).toFixed(1))) })}
                  className="py-1 px-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded text-[11px] font-semibold transition"
                >
                  +0.5
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateField(selectedField.id, { fontSize: Math.min(120, Number((selectedField.fontSize + 2).toFixed(1))) })}
                  className="py-1 px-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded text-[11px] font-semibold transition"
                >
                  +2px
                </button>
              </div>

              {/* Các kích thước chuẩn phổ biến */}
              <div className="flex flex-wrap gap-1 pt-1">
                {[10, 10.5, 11, 11.5, 12, 13, 14, 15, 17, 21, 26, 32].map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => onUpdateField(selectedField.id, { fontSize: sz })}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition ${
                      Math.abs(selectedField.fontSize - sz) < 0.3
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Độ rộng khung văn bản (Tự động xuống dòng) */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700">Độ rộng khung & Xuống dòng</label>
                {selectedField.width ? (
                  <button
                    type="button"
                    onClick={() => onUpdateField(selectedField.id, { width: undefined })}
                    className="text-[10px] text-rose-600 hover:underline"
                  >
                    Hủy giới hạn (1 dòng)
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onUpdateField(selectedField.id, { width: 350 })}
                    className="text-[10px] text-blue-600 hover:underline"
                  >
                    Bật xuống dòng
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Tự do theo 1 dòng (không giới hạn)"
                  value={selectedField.width || ''}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    onUpdateField(selectedField.id, { width: val > 0 ? val : undefined });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600 font-mono"
                />
                <span className="text-[11px] text-slate-400">px</span>
              </div>
            </div>

            {/* 5. Độ đậm */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Độ đậm nét</label>
              <select
                value={selectedField.fontWeight}
                onChange={(e) => onUpdateField(selectedField.id, { fontWeight: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600"
              >
                <option value="300">Mảnh (Light 300)</option>
                <option value="400">Thường (Regular 400)</option>
                <option value="500">Vừa (Medium 500)</option>
                <option value="600">Hơi đậm (Semi-Bold 600)</option>
                <option value="700">Đậm (Bold 700)</option>
                <option value="800">Cực đậm (Extra-Bold 800)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Căn lề & Kiểu chữ</label>
              <div className="flex items-center gap-1">
                <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                  <button
                    onClick={() => onUpdateField(selectedField.id, { align: 'left' })}
                    className={`p-1.5 rounded transition ${selectedField.align === 'left' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                    title="Canh trái"
                  >
                    <AlignLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onUpdateField(selectedField.id, { align: 'center' })}
                    className={`p-1.5 rounded transition ${selectedField.align === 'center' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                    title="Canh giữa"
                  >
                    <AlignCenter className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onUpdateField(selectedField.id, { align: 'right' })}
                    className={`p-1.5 rounded transition ${selectedField.align === 'right' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                    title="Canh phải"
                  >
                    <AlignRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => onUpdateField(selectedField.id, { fontStyle: selectedField.fontStyle === 'italic' ? 'normal' : 'italic' })}
                  className={`p-2 rounded-lg border transition ${selectedField.fontStyle === 'italic' ? 'bg-blue-50 border-blue-300 text-blue-600' : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600'}`}
                  title="Chữ nghiêng"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => onUpdateField(selectedField.id, { textTransform: selectedField.textTransform === 'uppercase' ? 'none' : 'uppercase' })}
                  className={`p-2 rounded-lg border transition ${selectedField.textTransform === 'uppercase' ? 'bg-blue-50 border-blue-300 text-blue-600' : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600'}`}
                  title="In hoa toàn bộ"
                >
                  <CaseUpper className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-slate-400" />
                <span>Màu chữ</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={selectedField.color}
                  onChange={(e) => onUpdateField(selectedField.id, { color: e.target.value })}
                  className="w-9 h-8 rounded-lg cursor-pointer border border-slate-200 p-0.5 bg-white"
                />
                <input
                  type="text"
                  value={selectedField.color}
                  onChange={(e) => onUpdateField(selectedField.id, { color: e.target.value })}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono uppercase text-slate-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tiền tố (Trước)</label>
                <input
                  type="text"
                  placeholder="Kính gửi: "
                  value={selectedField.prefix || ''}
                  onChange={(e) => onUpdateField(selectedField.id, { prefix: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Hậu tố (Sau)</label>
                <input
                  type="text"
                  placeholder=" VNĐ"
                  value={selectedField.suffix || ''}
                  onChange={(e) => onUpdateField(selectedField.id, { suffix: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800"
                />
              </div>
            </div>
          </>
        )}

        {/* Cấu hình cho QR CODE */}
        {selectedField.type === 'qr' && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Kích thước mã QR (px)</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={50}
                max={300}
                value={selectedField.qrSize || 100}
                onChange={(e) => onUpdateField(selectedField.id, { qrSize: parseInt(e.target.value) || 100 })}
                className="flex-1 accent-indigo-600 cursor-pointer"
              />
              <span className="font-mono text-xs font-bold text-slate-700 w-12 text-right">
                {selectedField.qrSize || 100}px
              </span>
            </div>
          </div>
        )}

        {/* Cấu hình cho BARCODE */}
        {selectedField.type === 'barcode' && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Chuẩn mã vạch</label>
            <select
              value={selectedField.barcodeFormat || 'CODE128'}
              onChange={(e) => onUpdateField(selectedField.id, { barcodeFormat: e.target.value as any })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-purple-600"
            >
              <option value="CODE128">CODE128 (Chuẩn quốc tế đa năng, chữ & số)</option>
              <option value="EAN13">EAN13 (Mã số thương phẩm 13 chữ số)</option>
              <option value="UPC">UPC (Chuẩn bán lẻ Bắc Mỹ)</option>
            </select>
          </div>
        )}

        {/* Cấu hình cho CON DẤU ĐỎ (SEAL) */}
        {selectedField.type === 'seal' && (
          <>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">Nội dung con dấu</label>
                <span className="text-[10px] text-rose-600 font-medium">Mộc tròn đỏ</span>
              </div>
              <textarea
                rows={3}
                value={selectedField.defaultValue ?? ''}
                placeholder="Nội dung trong con dấu..."
                onChange={(e) => onUpdateField(selectedField.id, { defaultValue: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-rose-600 font-sans leading-relaxed text-center uppercase"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">Đường kính con dấu</label>
                <span className="font-mono text-xs font-bold text-rose-700">
                  {selectedField.width || 82}px
                </span>
              </div>
              <input
                type="range"
                min={50}
                max={150}
                value={selectedField.width || 82}
                onChange={(e) => {
                  const sz = parseInt(e.target.value) || 82;
                  onUpdateField(selectedField.id, { width: sz, height: sz });
                }}
                className="w-full accent-rose-600 cursor-pointer"
              />
            </div>

            {/* Cỡ chữ trong con dấu */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Cỡ chữ trong dấu</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={7}
                    max={24}
                    step={0.5}
                    value={selectedField.fontSize}
                    onChange={(e) => onUpdateField(selectedField.id, { fontSize: parseFloat(e.target.value) || 9.5 })}
                    className="w-14 text-center bg-white border border-slate-300 rounded px-1.5 py-0.5 text-xs font-mono font-bold text-rose-700 focus:outline-none focus:border-rose-500"
                  />
                  <span className="text-[11px] font-semibold text-slate-400">px</span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-1">
                <button
                  type="button"
                  onClick={() => onUpdateField(selectedField.id, { fontSize: Math.max(7, Number((selectedField.fontSize - 1).toFixed(1))) })}
                  className="py-1 px-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded text-[11px] font-semibold transition"
                >
                  -1px
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateField(selectedField.id, { fontSize: Math.max(7, Number((selectedField.fontSize - 0.5).toFixed(1))) })}
                  className="py-1 px-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded text-[11px] font-semibold transition"
                >
                  -0.5
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateField(selectedField.id, { fontSize: Math.min(24, Number((selectedField.fontSize + 0.5).toFixed(1))) })}
                  className="py-1 px-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded text-[11px] font-semibold transition"
                >
                  +0.5
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateField(selectedField.id, { fontSize: Math.min(24, Number((selectedField.fontSize + 1).toFixed(1))) })}
                  className="py-1 px-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded text-[11px] font-semibold transition"
                >
                  +1px
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-slate-400" />
                <span>Màu mực con dấu</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={selectedField.color || '#dc2626'}
                  onChange={(e) => onUpdateField(selectedField.id, { color: e.target.value })}
                  className="w-9 h-8 rounded-lg cursor-pointer border border-slate-200 p-0.5 bg-white"
                />
                <input
                  type="text"
                  value={selectedField.color || '#dc2626'}
                  onChange={(e) => onUpdateField(selectedField.id, { color: e.target.value })}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono uppercase text-slate-700"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
};
