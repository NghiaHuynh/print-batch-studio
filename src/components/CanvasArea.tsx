import React, { useState, useRef, useEffect } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  UploadCloud, 
  FileText, 
  ChevronLeft, 
  ChevronRight, 
  Sliders, 
  Eye, 
  EyeOff, 
  RotateCw, 
  Plus, 
  X, 
  Sparkles, 
  Type, 
  QrCode, 
  Barcode,
  Trash2
} from 'lucide-react';
import { FieldConfig, FieldType, RecordData, TemplateInfo } from '../types';
import { generateQrDataUrl, generateBarcodeDataUrl } from '../services/pdfService';

interface CanvasAreaProps {
  templateDataUrl: string;
  stageWidth: number;
  stageHeight: number;
  fields: FieldConfig[];
  selectedFieldId: string | null;
  currentRecord: RecordData;
  templateInfo: TemplateInfo;
  availableColumns: string[];
  onSelectField: (id: string | null) => void;
  onUpdateFieldPosition: (id: string, x: number, y: number) => void;
  onUploadTemplate?: (file: File) => void;
  onLoadProject?: (file: File) => void;
  onAddFieldAtPosition?: (type: FieldType, label: string, key: string, x: number, y: number) => void;
  onChangePdfPage?: (page: number) => void;
  onUpdateTemplateInfo?: (updates: Partial<TemplateInfo>) => void;
  onUpdateStageDimensions?: (width: number, height: number) => void;
  onAutoDetectText?: () => void;
  isDetectingText?: boolean;
  onRemoveBackgroundImage?: () => void;
  onApplyCleanPreset?: () => void;
}

export const CanvasArea: React.FC<CanvasAreaProps> = ({
  templateDataUrl,
  stageWidth,
  stageHeight,
  fields,
  selectedFieldId,
  currentRecord,
  templateInfo,
  availableColumns,
  onSelectField,
  onUpdateFieldPosition,
  onUploadTemplate,
  onLoadProject,
  onAddFieldAtPosition,
  onChangePdfPage,
  onUpdateTemplateInfo,
  onUpdateStageDimensions,
  onAutoDetectText,
  isDetectingText,
  onRemoveBackgroundImage,
  onApplyCleanPreset
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [guideX, setGuideX] = useState<number | null>(null);
  const [guideY, setGuideY] = useState<number | null>(null);

  // Kéo thả file từ máy tính
  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);
  const dragCounter = useRef<number>(0);
  const canvasFileInputRef = useRef<HTMLInputElement>(null);

  // Double-click để thêm trường tại tọa độ
  const [quickAddPos, setQuickAddPos] = useState<{ x: number; y: number } | null>(null);
  const [quickFieldLabel, setQuickFieldLabel] = useState<string>('');
  const [quickFieldKey, setQuickFieldKey] = useState<string>('');
  const [quickFieldType, setQuickFieldType] = useState<FieldType>('text');

  // Mở thanh điều chỉnh kích thước phôi
  const [showDimensionEdit, setShowDimensionEdit] = useState<boolean>(false);
  const [customWidth, setCustomWidth] = useState<number>(stageWidth);
  const [customHeight, setCustomHeight] = useState<number>(stageHeight);

  // Cache ảnh QR và Barcode
  const [qrCache, setQrCache] = useState<Record<string, string>>({});
  const [barcodeCache, setBarcodeCache] = useState<Record<string, string>>({});

  const stageRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef<{
    isDragging: boolean;
    fieldId: string | null;
    startX: number;
    startY: number;
    initialLeft: number;
    initialTop: number;
  }>({
    isDragging: false,
    fieldId: null,
    startX: 0,
    startY: 0,
    initialLeft: 0,
    initialTop: 0
  });

  useEffect(() => {
    setCustomWidth(stageWidth);
    setCustomHeight(stageHeight);
  }, [stageWidth, stageHeight]);

  // Sinh mã QR và Barcode khi trường hoặc dữ liệu thay đổi
  useEffect(() => {
    fields.forEach(async (field) => {
      const rawVal = currentRecord[field.key] || currentRecord[field.label] || 'PREVIEW-12345';
      if (field.type === 'qr') {
        const cacheKey = `${field.id}_${rawVal}_${field.qrSize || 100}`;
        if (!qrCache[cacheKey]) {
          const url = await generateQrDataUrl(rawVal, field.qrSize || 100);
          setQrCache(prev => ({ ...prev, [cacheKey]: url }));
        }
      } else if (field.type === 'barcode') {
        const cacheKey = `${field.id}_${rawVal}_${field.barcodeFormat || 'CODE128'}`;
        if (!barcodeCache[cacheKey]) {
          const url = generateBarcodeDataUrl(rawVal, field.barcodeFormat || 'CODE128');
          setBarcodeCache(prev => ({ ...prev, [cacheKey]: url }));
        }
      }
    });
  }, [fields, currentRecord]);

  // Xử lý kéo thả file từ máy tính
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer?.types?.includes('Files')) {
      dragCounter.current += 1;
      setIsDraggingFile(true);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer?.types?.includes('Files')) {
      e.dataTransfer.dropEffect = 'copy';
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setIsDraggingFile(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setIsDraggingFile(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.name.endsWith('.pbproject') && onLoadProject) {
        onLoadProject(file);
      } else if (onUploadTemplate) {
        onUploadTemplate(file);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.name.endsWith('.pbproject') && onLoadProject) {
        onLoadProject(file);
      } else if (onUploadTemplate) {
        onUploadTemplate(file);
      }
      e.target.value = '';
    }
  };

  // Xử lý nhấp đúp trên phôi để đặt trường tại tọa độ
  const handleStageDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) / zoom);
    const y = Math.round((e.clientY - rect.top) / zoom);

    setQuickAddPos({ x: Math.max(10, x), y: Math.max(10, y) });
    setQuickFieldLabel('');
    setQuickFieldKey('');
    setQuickFieldType('text');
  };

  const handleConfirmQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAddPos || !quickFieldLabel.trim()) return;

    const finalKey = quickFieldKey.trim() || quickFieldLabel.trim().toLowerCase().replace(/[^a-z0-9]/gi, '_');
    if (onAddFieldAtPosition) {
      onAddFieldAtPosition(quickFieldType, quickFieldLabel.trim(), finalKey, quickAddPos.x, quickAddPos.y);
    }
    setQuickAddPos(null);
  };

  // Xử lý kéo thả chuột các trường
  const handleMouseDown = (e: React.MouseEvent, field: FieldConfig) => {
    e.stopPropagation();
    onSelectField(field.id);

    draggingRef.current = {
      isDragging: true,
      fieldId: field.id,
      startX: e.clientX,
      startY: e.clientY,
      initialLeft: field.x,
      initialTop: field.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingRef.current.isDragging || !draggingRef.current.fieldId) return;

      const { fieldId, startX, startY, initialLeft, initialTop } = draggingRef.current;
      const dx = (e.clientX - startX) / zoom;
      const dy = (e.clientY - startY) / zoom;

      let newX = Math.round(initialLeft + dx);
      let newY = Math.round(initialTop + dy);

      // Snap căn giữa trục X và Y
      const centerX = Math.round(stageWidth / 2);
      const centerY = Math.round(stageHeight / 2);

      let snapX: number | null = null;
      let snapY: number | null = null;

      if (Math.abs(newX - centerX) < 8) {
        newX = centerX;
        snapX = centerX;
      }
      if (Math.abs(newY - centerY) < 8) {
        newY = centerY;
        snapY = centerY;
      }

      fields.forEach(other => {
        if (other.id !== fieldId && other.visible) {
          if (Math.abs(newX - other.x) < 6) {
            newX = other.x;
            snapX = other.x;
          }
          if (Math.abs(newY - other.y) < 6) {
            newY = other.y;
            snapY = other.y;
          }
        }
      });

      setGuideX(snapX);
      setGuideY(snapY);

      newX = Math.max(0, Math.min(newX, stageWidth - 10));
      newY = Math.max(0, Math.min(newY, stageHeight - 10));

      onUpdateFieldPosition(fieldId, newX, newY);
    };

    const handleMouseUp = () => {
      if (draggingRef.current.isDragging) {
        draggingRef.current.isDragging = false;
        draggingRef.current.fieldId = null;
        setGuideX(null);
        setGuideY(null);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [zoom, stageWidth, stageHeight, fields, onUpdateFieldPosition]);

  // Phím mũi tên để tinh chỉnh tọa độ 1px hoặc 10px (Shift)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return;
      if (!selectedFieldId) return;

      const field = fields.find(f => f.id === selectedFieldId);
      if (!field || !field.visible) return;

      const step = e.shiftKey ? 10 : 1;
      let moved = false;
      let nextX = field.x;
      let nextY = field.y;

      if (e.key === 'ArrowLeft') { nextX = Math.max(0, nextX - step); moved = true; }
      if (e.key === 'ArrowRight') { nextX = Math.min(stageWidth, nextX + step); moved = true; }
      if (e.key === 'ArrowUp') { nextY = Math.max(0, nextY - step); moved = true; }
      if (e.key === 'ArrowDown') { nextY = Math.min(stageHeight, nextY + step); moved = true; }

      if (moved) {
        e.preventDefault();
        onUpdateFieldPosition(selectedFieldId, nextX, nextY);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFieldId, fields, stageWidth, stageHeight, onUpdateFieldPosition]);

  // Đổi hướng phôi (Ngang ⇄ Dọc)
  const handleRotateOrientation = () => {
    if (onUpdateStageDimensions) {
      onUpdateStageDimensions(stageHeight, stageWidth);
    }
  };

  return (
    <main
      className="flex-1 canvas-grid-bg overflow-auto relative flex items-center justify-center p-6 select-none"
      onClick={() => {
        onSelectField(null);
        setQuickAddPos(null);
      }}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={canvasFileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp, application/pdf, .pbproject"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* THANH CÔNG CỤ ĐIỀU KHIỂN PHÔI THÔNG MINH (Top Floating Bar) */}
      <div className="absolute top-3.5 z-30 flex flex-wrap items-center justify-center gap-2 max-w-[95%]">
        {/* Nút chỉ dẫn & Nạp phôi */}
        <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-md text-white px-3 py-1.5 rounded-xl border border-slate-700/80 text-xs shadow-lg">
          <UploadCloud className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span className="text-slate-300 font-medium truncate max-w-[150px] sm:max-w-[200px]" title={templateInfo.name}>
            {templateInfo.name || 'Kéo thả phôi vào đây'}
          </span>
          <button
            type="button"
            onClick={() => canvasFileInputRef.current?.click()}
            className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold underline cursor-pointer"
          >
            Đổi phôi
          </button>
        </div>

        {/* Nút Nhận diện văn bản thông minh (Auto Detect & Convert to Editable Text) */}
        {templateDataUrl && onAutoDetectText && (
          <button
            type="button"
            onClick={onAutoDetectText}
            disabled={isDetectingText}
            className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-60 text-white px-3 py-1.5 rounded-xl border border-indigo-400/50 text-xs font-semibold shadow-lg transition active:scale-95 cursor-pointer"
            title="Tự động quét và chuyển toàn bộ chữ trên phôi ảnh hoặc PDF thành các trường văn bản có thể chỉnh sửa và loại bỏ ảnh nền"
          >
            <Sparkles className={`w-3.5 h-3.5 text-amber-300 ${isDetectingText ? 'animate-spin' : 'animate-pulse'}`} />
            <span>{isDetectingText ? 'Đang nhận diện chữ...' : 'Nhận diện & Bỏ ảnh gốc'}</span>
          </button>
        )}

        {/* Nút Xóa ảnh nền gốc / Chuyển sang phôi giấy trắng sạch */}
        {templateDataUrl && onRemoveBackgroundImage && (
          <button
            type="button"
            onClick={onRemoveBackgroundImage}
            className="flex items-center gap-1.5 bg-slate-900/85 hover:bg-rose-900/80 backdrop-blur-md text-slate-300 hover:text-white px-2.5 py-1.5 rounded-xl border border-slate-700/80 text-xs font-medium shadow-lg transition active:scale-95 cursor-pointer"
            title="Xóa bỏ hoàn toàn ảnh chụp phôi gốc (loại bỏ ảnh bị mờ/nghiêng/lỗi, chỉ giữ lại văn bản trên nền giấy trắng sạch)"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Bỏ ảnh gốc</span>
          </button>
        )}

        {/* Nút Áp dụng Mẫu Số Hóa Chuẩn 100% MTTQ */}
        {onApplyCleanPreset && (
          <button
            type="button"
            onClick={onApplyCleanPreset}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-lg transition active:scale-95 cursor-pointer"
            title="Áp dụng ngay Mẫu Thư Mời Chuẩn Vector MTTQ (Sạch đẹp 100%, không còn bất kỳ lỗi chữ nào)"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden md:inline">Mẫu Số Hóa Chuẩn 100%</span>
            <span className="md:hidden">Mẫu Chuẩn</span>
          </button>
        )}

        {/* Bộ chuyển trang nếu phôi là file PDF nhiều trang */}
        {templateInfo.type === 'pdf' && templateInfo.numPages > 1 && (
          <div className="flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md text-white px-2.5 py-1.5 rounded-xl border border-slate-700/80 text-xs shadow-lg">
            <span className="text-slate-400 text-[11px]">Trang:</span>
            <button
              onClick={() => onChangePdfPage && onChangePdfPage(Math.max(1, templateInfo.currentPage - 1))}
              disabled={templateInfo.currentPage <= 1}
              className="p-1 hover:bg-slate-800 disabled:opacity-30 rounded transition"
              title="Trang trước"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono font-bold text-blue-400 px-1">
              {templateInfo.currentPage} / {templateInfo.numPages}
            </span>
            <button
              onClick={() => onChangePdfPage && onChangePdfPage(Math.min(templateInfo.numPages, templateInfo.currentPage + 1))}
              disabled={templateInfo.currentPage >= templateInfo.numPages}
              className="p-1 hover:bg-slate-800 disabled:opacity-30 rounded transition"
              title="Trang tiếp"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Chỉnh độ mờ phôi (Opacity) */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-900/85 backdrop-blur-md text-white px-2.5 py-1.5 rounded-xl border border-slate-700/80 text-xs shadow-lg">
          <span className="text-slate-400 text-[11px]">Độ mờ phôi:</span>
          <input
            type="range"
            min="0.2"
            max="1"
            step="0.05"
            value={templateInfo.opacity}
            onChange={(e) => onUpdateTemplateInfo && onUpdateTemplateInfo({ opacity: parseFloat(e.target.value) })}
            className="w-16 accent-blue-500 cursor-pointer h-1 bg-slate-700 rounded"
            title="Điều chỉnh độ mờ của phôi nền"
          />
          <span className="font-mono text-[10px] text-slate-300 w-7 text-right">
            {Math.round(templateInfo.opacity * 100)}%
          </span>
        </div>

        {/* Chế độ in: In kèm nền vs Chỉ in chữ */}
        <button
          onClick={() => onUpdateTemplateInfo && onUpdateTemplateInfo({ printBackground: !templateInfo.printBackground })}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-lg transition backdrop-blur-md ${
            templateInfo.printBackground
              ? 'bg-blue-600/90 text-white border-blue-500'
              : 'bg-amber-600/90 text-white border-amber-500'
          }`}
          title={templateInfo.printBackground ? 'Đang bật: Sẽ in cả nền phôi và chữ' : 'Đang bật: Chỉ in chữ, ẩn ảnh phôi (dành cho phôi giấy có sẵn)'}
        >
          {templateInfo.printBackground ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span className="hidden md:inline">{templateInfo.printBackground ? 'In kèm phôi nền' : 'Chỉ in nội dung điền'}</span>
          <span className="md:hidden">{templateInfo.printBackground ? 'Kèm nền' : 'Chỉ chữ'}</span>
        </button>

        {/* Xoay hướng phôi & Kích thước */}
        <div className="flex items-center gap-1 bg-slate-900/85 backdrop-blur-md text-white px-2 py-1.5 rounded-xl border border-slate-700/80 text-xs shadow-lg">
          <button
            onClick={() => setShowDimensionEdit(!showDimensionEdit)}
            className="text-[11px] font-mono text-slate-300 hover:text-white px-1.5 py-0.5 rounded hover:bg-slate-800 transition"
            title="Bấm để điều chỉnh kích thước phôi"
          >
            {stageWidth} × {stageHeight}px
          </button>
          <button
            onClick={handleRotateOrientation}
            className="p-1 hover:bg-slate-800 text-slate-300 hover:text-blue-400 rounded transition"
            title="Xoay hướng phôi 90 độ (Ngang ⇄ Dọc)"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Popover chỉnh kích thước phôi */}
      {showDimensionEdit && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute top-16 z-40 bg-slate-900 text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700 text-xs space-y-2.5 w-64 animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="font-bold text-slate-200">Kích thước phôi (px)</span>
            <button onClick={() => setShowDimensionEdit(false)} className="text-slate-400 hover:text-white">✕</button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-slate-400 block mb-1">Rộng (W):</span>
              <input
                type="number"
                value={customWidth}
                onChange={(e) => setCustomWidth(parseInt(e.target.value) || 100)}
                className="w-full bg-slate-800 px-2 py-1 rounded text-xs font-mono text-white border border-slate-700"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block mb-1">Cao (H):</span>
              <input
                type="number"
                value={customHeight}
                onChange={(e) => setCustomHeight(parseInt(e.target.value) || 100)}
                className="w-full bg-slate-800 px-2 py-1 rounded text-xs font-mono text-white border border-slate-700"
              />
            </div>
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-slate-800">
            <div className="flex gap-1">
              <button
                onClick={() => { setCustomWidth(842); setCustomHeight(595); }}
                className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-[10px]"
                title="A4 Ngang"
              >
                A4 Ngang
              </button>
              <button
                onClick={() => { setCustomWidth(595); setCustomHeight(842); }}
                className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-[10px]"
                title="A4 Dọc"
              >
                A4 Dọc
              </button>
            </div>
            <button
              onClick={() => {
                if (onUpdateStageDimensions) onUpdateStageDimensions(customWidth, customHeight);
                setShowDimensionEdit(false);
              }}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold text-xs"
            >
              Áp dụng
            </button>
          </div>
        </div>
      )}

      {/* Lớp phủ trực quan khi đang kéo file từ máy tính lướt qua canvas */}
      {isDraggingFile && (
        <div className="absolute inset-4 z-50 rounded-2xl border-4 border-dashed border-blue-500 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center text-white pointer-events-none animate-in fade-in zoom-in-95 duration-150">
          <div className="p-4 bg-blue-600 rounded-2xl shadow-2xl mb-3 animate-bounce">
            <UploadCloud className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold tracking-tight mb-1">
            Thả file mẫu mới vào đây
          </h3>
          <p className="text-xs sm:text-sm text-blue-200">
            Chương trình sẽ tự động xử lý, giữ nguyên tỷ lệ cấu trúc gốc và sẵn sàng chỉnh sửa
          </p>
        </div>
      )}

      {/* Điều khiển Zoom góc dưới */}
      <div className="absolute bottom-5 left-5 z-30 bg-slate-900/90 backdrop-blur-md text-white px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2 border border-slate-700 text-xs">
        <button
          onClick={() => setZoom(prev => Math.max(0.4, Number((prev - 0.1).toFixed(1))))}
          className="p-1 hover:bg-slate-800 rounded transition"
          title="Thu nhỏ (-)"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <span className="font-mono font-semibold w-12 text-center">{Math.round(zoom * 100)}%</span>
        <button
          onClick={() => setZoom(prev => Math.min(2.0, Number((prev + 0.1).toFixed(1))))}
          className="p-1 hover:bg-slate-800 rounded transition"
          title="Phóng to (+)"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <div className="w-[1px] h-4 bg-slate-700 mx-1" />
        <button
          onClick={() => setZoom(1)}
          className="p-1 hover:bg-slate-800 rounded transition"
          title="Chuẩn 100%"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* GỢI Ý NHẤP ĐÚP ĐỂ ĐẶT TRƯỜNG */}
      <div className="absolute bottom-5 right-5 z-20 hidden md:flex items-center gap-1.5 bg-slate-900/70 text-slate-300 backdrop-blur-sm px-3 py-1.5 rounded-xl text-[11px] border border-slate-800">
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span>Mẹo: <b>Nhấp đúp chuột</b> vào bất kỳ chỗ nào trên phôi để thêm trường tại đó!</span>
      </div>

      {/* KHUNG STAGE BIỂU MẪU CHÍNH */}
      <div
        ref={stageRef}
        id="template-stage"
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={handleStageDoubleClick}
        className="relative bg-white shadow-2xl transition-transform duration-75 origin-center rounded-sm overflow-hidden cursor-crosshair"
        style={{
          width: `${stageWidth}px`,
          height: `${stageHeight}px`,
          transform: `scale(${zoom})`,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
        title="Nhấp đúp chuột vào điểm bất kỳ để đặt trường dữ liệu"
      >
        {/* Ảnh nền phôi có hỗ trợ opacity */}
        {templateDataUrl ? (
          <img
            src={templateDataUrl}
            alt="Mẫu biểu mẫu"
            className="w-full h-full object-contain pointer-events-none select-none block transition-opacity duration-150"
            style={{ opacity: templateInfo.opacity }}
          />
        ) : (
          <div
            onClick={() => canvasFileInputRef.current?.click()}
            className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100 p-8 text-center cursor-pointer hover:bg-slate-200/60 transition"
          >
            <UploadCloud className="w-12 h-12 text-blue-500 mb-2" />
            <p className="font-semibold text-slate-700 text-sm">Chưa có phôi nền</p>
            <p className="text-xs text-slate-500 mt-1">Kéo thả file ảnh hoặc PDF vào đây hoặc bấm để chọn file</p>
          </div>
        )}

        {/* Các đường gióng thông minh (Smart Guides) */}
        {guideX !== null && (
          <div
            className="absolute top-0 bottom-0 border-l-2 border-dashed border-blue-500 pointer-events-none z-40"
            style={{ left: `${guideX}px` }}
          />
        )}
        {guideY !== null && (
          <div
            className="absolute left-0 right-0 border-t-2 border-dashed border-blue-500 pointer-events-none z-40"
            style={{ top: `${guideY}px` }}
          />
        )}

        {/* HỘP THOẠI POPUP THÊM NHANH KHI DOUBLE-CLICK TRÊN PHÔI */}
        {quickAddPos && (
          <div
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
            className="absolute z-50 bg-white rounded-2xl shadow-2xl p-3.5 border border-slate-200 w-64 text-slate-800 animate-in fade-in zoom-in-95 duration-100 cursor-default"
            style={{
              left: `${Math.min(quickAddPos.x, stageWidth - 270)}px`,
              top: `${Math.min(quickAddPos.y, stageHeight - 200)}px`
            }}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2.5">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Đặt trường tại đây ({quickAddPos.x}, {quickAddPos.y})
              </span>
              <button onClick={() => setQuickAddPos(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleConfirmQuickAdd} className="space-y-2">
              <div className="grid grid-cols-3 gap-1">
                <button
                  type="button"
                  onClick={() => setQuickFieldType('text')}
                  className={`py-1 rounded text-[10px] font-semibold border flex items-center justify-center gap-1 ${
                    quickFieldType === 'text' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <Type className="w-3 h-3" /> Chữ
                </button>
                <button
                  type="button"
                  onClick={() => setQuickFieldType('qr')}
                  className={`py-1 rounded text-[10px] font-semibold border flex items-center justify-center gap-1 ${
                    quickFieldType === 'qr' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <QrCode className="w-3 h-3" /> QR
                </button>
                <button
                  type="button"
                  onClick={() => setQuickFieldType('barcode')}
                  className={`py-1 rounded text-[10px] font-semibold border flex items-center justify-center gap-1 ${
                    quickFieldType === 'barcode' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <Barcode className="w-3 h-3" /> Vạch
                </button>
              </div>

              <div>
                <input
                  type="text"
                  autoFocus
                  required
                  placeholder="Nhập tên trường..."
                  value={quickFieldLabel}
                  onChange={(e) => {
                    setQuickFieldLabel(e.target.value);
                    if (!quickFieldKey) setQuickFieldKey(e.target.value.toLowerCase().replace(/[^a-z0-9]/gi, '_'));
                  }}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-blue-600"
                />
              </div>

              {/* Chọn nhanh từ danh sách cột Excel đang có */}
              {availableColumns.length > 0 && (
                <div>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        setQuickFieldLabel(e.target.value);
                        setQuickFieldKey(e.target.value);
                      }
                    }}
                    className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-600"
                  >
                    <option value="">-- Hoặc chọn cột từ Excel --</option>
                    {availableColumns.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setQuickAddPos(null)}
                  className="px-2.5 py-1 text-[11px] text-slate-500 hover:bg-slate-100 rounded"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 text-[11px] font-semibold bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Tạo trường
                </button>
              </div>
            </form>
          </div>
        )}

        {/* RENDER CÁC TRƯỜNG DỮ LIỆU KÉO THẢ */}
        {fields.map((field) => {
          if (!field.visible) return null;
          const isSelected = field.id === selectedFieldId;
          const rawVal = currentRecord[field.key] || currentRecord[field.label] || `[${field.label}]`;

          let displayText = rawVal;
          if (field.prefix) displayText = field.prefix + displayText;
          if (field.suffix) displayText = displayText + field.suffix;
          if (field.textTransform === 'uppercase') displayText = displayText.toUpperCase();
          if (field.textTransform === 'lowercase') displayText = displayText.toLowerCase();

          return (
            <div
              key={field.id}
              onMouseDown={(e) => handleMouseDown(e, field)}
              onDoubleClick={(e) => e.stopPropagation()}
              className={`draggable-field px-2 py-0.5 rounded transition-all ${
                isSelected ? 'selected' : 'hover:outline-1 hover:outline-dashed hover:outline-blue-400'
              }`}
              style={{
                left: `${field.x}px`,
                top: `${field.y}px`,
                fontSize: `${field.fontSize}px`,
                fontFamily: field.fontFamily,
                fontWeight: field.fontWeight,
                color: field.color,
                fontStyle: field.fontStyle || 'normal',
                textAlign: field.align
              }}
            >
              {field.type === 'text' && (
                <span>{displayText}</span>
              )}

              {field.type === 'qr' && (
                <div className="flex flex-col items-center bg-white/90 p-1 rounded border border-slate-200 shadow-xs">
                  {qrCache[`${field.id}_${rawVal}_${field.qrSize || 100}`] ? (
                    <img
                      src={qrCache[`${field.id}_${rawVal}_${field.qrSize || 100}`]}
                      alt="QR"
                      style={{ width: `${field.width || field.qrSize || 100}px`, height: `${field.height || field.qrSize || 100}px` }}
                      className="pointer-events-none block"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-slate-200 animate-pulse" />
                  )}
                </div>
              )}

              {field.type === 'barcode' && (
                <div className="bg-white/90 p-1 rounded border border-slate-200 shadow-xs flex flex-col items-center">
                  {barcodeCache[`${field.id}_${rawVal}_${field.barcodeFormat || 'CODE128'}`] ? (
                    <img
                      src={barcodeCache[`${field.id}_${rawVal}_${field.barcodeFormat || 'CODE128'}`]}
                      alt="Barcode"
                      style={{ width: `${field.width || 180}px`, height: `${field.height || 50}px` }}
                      className="pointer-events-none block"
                    />
                  ) : (
                    <div className="w-36 h-12 bg-slate-200 animate-pulse" />
                  )}
                  <span className="text-[10px] font-mono mt-0.5 text-slate-700">{rawVal}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
};
